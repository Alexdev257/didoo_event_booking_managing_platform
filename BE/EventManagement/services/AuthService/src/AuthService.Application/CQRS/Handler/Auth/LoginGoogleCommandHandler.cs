using AuthService.Application.CQRS.Command.Auth;
using AuthService.Application.DTOs.Response.Auth;
using AuthService.Application.Interfaces.Helpers;
using AuthService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Common.Wrappers;
using SharedContracts.Events;
using SharedContracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Handler.Auth
{
    public class LoginGoogleCommandHandler : IRequestHandler<LoginGoogleCommand, LoginGoogleResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        private readonly IGoolgeOAuthHelper _googleOAuthHelper;
        private readonly ICacheService _cacheService;
        private readonly IBcryptHelper _bcryptHelper;
        private readonly IMessageProducer _messageProducer;
        private readonly IJwtHelper _jwtHelper;

        public LoginGoogleCommandHandler(IAuthUnitOfWork unitOfWork, IGoolgeOAuthHelper goolgeOAuthHelper, ICacheService cacheService, IBcryptHelper bcryptHelper, IMessageProducer messageProducer, IJwtHelper jwtHelper)
        {
            _unitOfWork = unitOfWork;
            _googleOAuthHelper = goolgeOAuthHelper;
            _cacheService = cacheService;
            _bcryptHelper = bcryptHelper;
            _messageProducer = messageProducer;
            _jwtHelper = jwtHelper;
        }


        public async Task<LoginGoogleResponse> Handle(LoginGoogleCommand request, CancellationToken cancellationToken)
        {
            var validatedResult = await _googleOAuthHelper.ValidateGoogleTokenAsync(request.GoogleToken);
            if (!validatedResult.IsValid)
            {
                return new LoginGoogleResponse
                {
                    IsSuccess = false,
                    Message = "Invalid Google token",
                    ListErrors = new List<Errors>
                    {
                        new() { Field = "GoogleToken", Detail = validatedResult.ErrorMessage }
                    }
                };
            }

            var user = await _unitOfWork.Users.GetAllAsync().Include(x => x.Role).Include(x => x.Locations).FirstOrDefaultAsync(x => x.Email == validatedResult.Email);
            if(user == null)
            {
                var id = Guid.NewGuid();
                var basePassword = $"Event{id}";
                var role = await _unitOfWork.Roles.GetAllAsync().Where(x => x.Name == Domain.Enum.RoleNameEnum.User).FirstOrDefaultAsync();
                user = new Domain.Entities.User
                {
                    Id = id,
                    FullName = validatedResult.Name,
                    Email = validatedResult.Email,
                    Phone = null,
                    IsVerified = true,
                    Password = _bcryptHelper.HashPassword(basePassword),
                    AvatarUrl = validatedResult.Picture,
                    Gender = null,
                    DateOfBirth = null,
                    Address = null,
                    RoleId = role.Id,
                    OrganizerId = null,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.BeginTransactionAsync();
                try
                {
                    await _unitOfWork.Users.AddAsync(user);
                    await _unitOfWork.CommitTransactionAsync();
                    await _messageProducer.PublishAsync<SendFirstLoginGoogleEmailEvent>(new SendFirstLoginGoogleEmailEvent(validatedResult.Email, basePassword, validatedResult.Name, DateTime.UtcNow), cancellationToken);
                    var accessToken = _jwtHelper.GenerateAccessToken(user);
                    var refreshToken = _jwtHelper.GenerateRefreshToken();
                    await _cacheService.SetAsync<string>($"RT_{user.Id}", refreshToken, TimeSpan.FromDays(7), cancellationToken);
                    return new LoginGoogleResponse
                    {
                        IsSuccess = true,
                        Message = "Login with Google successfully! Please check your email to get your password.",
                        Data = new TokenDTO
                        {
                            AccessToken = accessToken,
                            RefreshToken = refreshToken
                        }
                    };
                }
                catch(Exception ex)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return new LoginGoogleResponse
                    {
                        IsSuccess = false,
                        Message = "An error occurred while verifying email change"
                    };
                }
            }
            else
            {
                var accessToken = _jwtHelper.GenerateAccessToken(user);
                var refreshToken = _jwtHelper.GenerateRefreshToken();
                await _cacheService.SetAsync<string>($"RT_{user.Id}", refreshToken, TimeSpan.FromDays(7), cancellationToken);
                return new LoginGoogleResponse
                {
                    IsSuccess = true,
                    Message = "Login with Google successfully! Please check your email to get your password.",
                    Data = new TokenDTO
                    {
                        AccessToken = accessToken,
                        RefreshToken = refreshToken
                    }
                };
            }
               
        }
    }
}
