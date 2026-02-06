using AuthService.Application.CQRS.Command.Auth;
using AuthService.Application.DTOs.Response.Auth;
using AuthService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Common.Wrappers;
using SharedContracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;

namespace AuthService.Application.CQRS.Handler.Auth
{
    public class VerifyChangeEmailCommandHandler : IRequestHandler<VerifyChangeEmailCommand, VerifyChangeEmailResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService;
        public VerifyChangeEmailCommandHandler(IAuthUnitOfWork unitOfWork, ICacheService cacheService)
        {
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
        }
        public async Task<VerifyChangeEmailResponse> Handle(VerifyChangeEmailCommand request, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Users.GetAllAsync().FirstOrDefaultAsync(u => u.Id.ToString() == request.UserId, cancellationToken);
            if (user == null)
            {
                return new VerifyChangeEmailResponse
                {
                    IsSuccess = false,
                    Message = "User not found"
                };
            }

            if (user.IsDeleted)
            {
                return new VerifyChangeEmailResponse
                {
                    IsSuccess = false,
                    Message = "User is deleted"
                };
            }

            if (user.Status == Domain.Enum.StatusEnum.Inactive)
            {
                return new VerifyChangeEmailResponse
                {
                    IsSuccess = false,
                    Message = "User is inactive"
                };
            }

            var newEmail = await _cacheService.GetAsync<string>($"CEE_{request.Otp}");
            var otp = await _cacheService.GetAsync<string>($"CEOTP_{request.Otp}");
            if (newEmail == null || otp == null || otp != request.Otp)
            {
                return new VerifyChangeEmailResponse
                {
                    IsSuccess = false,
                    Message = "Invalid or expired OTP"
                };
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                user.Email = newEmail;
                _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.CommitTransactionAsync();
                await _cacheService.RemoveAsync($"CEE_{request.Otp}");
                await _cacheService.RemoveAsync($"CEOTP_{request.Otp}");
                return new VerifyChangeEmailResponse
                {
                    IsSuccess = true,
                    Message = "Email change verified successfully"
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new VerifyChangeEmailResponse
                {
                    IsSuccess = false,
                    Message = "An error occurred while verifying email change"
                };
            }
        }
    }
}
