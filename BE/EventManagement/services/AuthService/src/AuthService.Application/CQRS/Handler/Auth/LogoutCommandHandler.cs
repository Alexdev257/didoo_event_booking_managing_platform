using AuthService.Application.CQRS.Command.Auth;
using AuthService.Application.DTOs.Response.Auth;
using MediatR;
using SharedContracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Handler.Auth
{
    public class LogoutCommandHandler : IRequestHandler<LogoutCommand, LogoutResponse>
    {
        private readonly ICacheService _cacheService;
        public LogoutCommandHandler(ICacheService cacheService)
        {
            _cacheService = cacheService;
        }
        public async Task<LogoutResponse> Handle(LogoutCommand request, CancellationToken cancellationToken)
        {
            var token = await _cacheService.GetAsync<string>($"RT_{request.UserId}");
            if (token == null)
            {
                return new LogoutResponse
                {
                    IsSuccess = false,
                    Message = "User is already logged out."
                };
            }
            else
            {
                await _cacheService.RemoveAsync($"RT_{request.UserId}");
                return new LogoutResponse
                {
                    IsSuccess = true,
                    Message = "User logged out successfully."
                };
            }
        }
    }
}
