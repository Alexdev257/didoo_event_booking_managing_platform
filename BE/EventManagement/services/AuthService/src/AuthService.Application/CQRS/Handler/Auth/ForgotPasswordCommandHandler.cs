using AuthService.Application.CQRS.Command.Auth;
using AuthService.Application.DTOs.Response.Auth;
using AuthService.Application.Interfaces;
using AuthService.Application.Interfaces.Helpers;
using AuthService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Events;
using SharedContracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;

namespace AuthService.Application.CQRS.Handler.Auth
{
    public class ForgotPasswordCommandHandler : IRequestHandler<ForgotPasswordCommand, ForgotPasswordResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService;
        private readonly IMessageProducer _messageProducer;
        public ForgotPasswordCommandHandler(IAuthUnitOfWork unitOfWork, ICacheService cacheService, IMessageProducer messageProducer)
        {
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
            _messageProducer = messageProducer;
        }
        public async Task<ForgotPasswordResponse> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Users.GetAllAsync().Include(x => x.Role).FirstOrDefaultAsync(x => x.Email == request.Email);
            if (user == null)
            {
                return new ForgotPasswordResponse
                {
                    IsSuccess = false,
                    Message = "User not found"
                };
            }

            if(user.IsDeleted)
            {
                return new ForgotPasswordResponse
                {
                    IsSuccess = false,
                    Message = "User is deleted"
                };
            }

            if(user.Status == AuthService.Domain.Enum.StatusEnum.Inactive)
            {
                return new ForgotPasswordResponse
                {
                    IsSuccess = false,
                    Message = "User is inactive"
                };
            }

            var key = OtpHelper.GenerateOtp(32);
            await _cacheService.SetAsync($"FK_{key}", key, TimeSpan.FromMinutes(5));
            await _cacheService.SetAsync($"FID_{key}", user.Id.ToString(), TimeSpan.FromMinutes(5));
            await _messageProducer.PublishAsync<SendForgotPasswordEmailEvent>(new SendForgotPasswordEmailEvent(request.Email, key), cancellationToken);
            return new ForgotPasswordResponse
            {
                IsSuccess = true,
                Message = "Send forgot password email successfully",
                Data = new ForgotPasswordResponseDTO
                {
                    Key = key
                }
            };

        }
    }
}
