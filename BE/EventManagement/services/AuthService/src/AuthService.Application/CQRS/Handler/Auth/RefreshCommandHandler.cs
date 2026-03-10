using AuthService.Application.CQRS.Command.Auth;
using AuthService.Application.DTOs.Response.Auth;
using AuthService.Application.Interfaces.Helpers;
using AuthService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Handler.Auth
{
    public class RefreshCommandHandler : IRequestHandler<RefreshCommand, RefreshResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService;
        private readonly IJwtHelper _jwtHelper;
        public RefreshCommandHandler(IAuthUnitOfWork unitOfWork, ICacheService cacheService, IJwtHelper jwtHelper)
        {
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
            _jwtHelper = jwtHelper;
        }
        public async Task<RefreshResponse> Handle(RefreshCommand request, CancellationToken cancellationToken)
        {
            var rs = _jwtHelper.ValidateToken(request.AccessToken);
            if (!rs.Item1)
                return new RefreshResponse
                {
                    IsSuccess = false,
                    Message = rs.Item2
                };
            var refreshToken = await _cacheService.GetAsync<string>($"RT_{request.Id}");
            if (string.IsNullOrEmpty(refreshToken))
                return new RefreshResponse
                {
                    IsSuccess = false,
                    Message = "RefreshToken is used or expired!"
                };
            var user = await _unitOfWork.Users.GetAllAsync().Include(x => x.Role).FirstOrDefaultAsync(x => x.Id == Guid.Parse(request.Id));
            var newAccessToken = _jwtHelper.GenerateAccessToken(user!);
            var newRefreshToken = _jwtHelper.GenerateRefreshToken();
            await _cacheService.RemoveAsync($"RT_{request.Id}");
            await _cacheService.SetAsync($"RT_{request.Id}", newRefreshToken);
            return new RefreshResponse
            {
                IsSuccess = true,
                Message = "Refresh successfully!",
                Data = new TokenDTO
                {
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken
                }
            };

        }
    }
}
