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
    public class VerifyForgotPasswordCommandHandler : IRequestHandler<VerifyForgotPasswordCommand, VerifyForgotPasswordResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService;
        private readonly IBcryptHelper _bcryptHelper;
        public VerifyForgotPasswordCommandHandler(IAuthUnitOfWork unitOfWork, ICacheService cacheService, IBcryptHelper bcryptHelper)
        {
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
            _bcryptHelper = bcryptHelper;
        }
        public async Task<VerifyForgotPasswordResponse> Handle(VerifyForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            var key = await _cacheService.GetAsync<string>($"FK_{request.Key}");
            var id = await _cacheService.GetAsync<string>($"FID_{request.Key}");
            if (key == null || id == null || key != request.Key)
            {
                return new VerifyForgotPasswordResponse
                {
                    IsSuccess = false,
                    Message = "Invalid or expired key."
                };
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var user = await _unitOfWork.Users.GetAllAsync().Include(x => x.Role).FirstOrDefaultAsync(x => x.Id == Guid.Parse(id));
                if (user == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return new VerifyForgotPasswordResponse
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }
                user.Password = _bcryptHelper.HashPassword(request.NewPassword);
                _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.CommitTransactionAsync();
                await _cacheService.RemoveAsync($"FK_{request.Key}");
                await _cacheService.RemoveAsync($"FID_{request.Key}");
                return new VerifyForgotPasswordResponse
                {
                    IsSuccess = true,
                    Message = "Password reset successfully."
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new VerifyForgotPasswordResponse
                {
                    IsSuccess = false,
                    Message = "An error occurred while resetting the password."
                };
            }
        }
    }
}
