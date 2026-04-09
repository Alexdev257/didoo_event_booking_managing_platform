using AuthService.Application.CQRS.Command.Auth;
using AuthService.Application.DTOs.Response.Auth;
using AuthService.Application.Interfaces.Helpers;
using AuthService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.CQRS.Handler.Auth
{
    public class ChangePasswordCommandHandler : IRequestHandler<ChangePasswordCommand, ChangePasswordResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        private readonly IBcryptHelper _bcryptHelper;
        public ChangePasswordCommandHandler(IAuthUnitOfWork unitOfWork, IBcryptHelper bcryptHelper)
        {
            _unitOfWork = unitOfWork;
            _bcryptHelper = bcryptHelper;
        }

        public async Task<ChangePasswordResponse> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Users.GetAllAsync().Include(x => x.Role).FirstOrDefaultAsync(x => x.Id.ToString() == request.UserId);
            if (user == null)
            {
                return new ChangePasswordResponse
                {
                    IsSuccess = false,
                    Message = "User not found"
                };
            }
            if (user.IsDeleted)
            {
                return new ChangePasswordResponse
                {
                    IsSuccess = false,
                    Message = "User is deleted"
                };
            }
            if (user.Status == Domain.Enum.StatusEnum.Inactive)
            {
                return new ChangePasswordResponse
                {
                    IsSuccess = false,
                    Message = "User is inactive"
                };
            }

            var isPasswordValid = _bcryptHelper.VerifyPassword(request.Password, user.Password);
            if (!isPasswordValid)
                return new ChangePasswordResponse
                {
                    IsSuccess = false,
                    Message = "Old password is incorrect!"
                };

            if (request.Password == request.NewPassword)
                return new ChangePasswordResponse
                {
                    IsSuccess = false,
                    Message = "New password must be different from old password!"
                };

            var hasedNewPassword = _bcryptHelper.HashPassword(request.NewPassword);
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                user.Password = hasedNewPassword;
                _unitOfWork.Users.UpdateAsync(user);
                await _unitOfWork.CommitTransactionAsync();
                return new ChangePasswordResponse
                {
                    IsSuccess = true,
                    Message = "Password changed successfully"
                };
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new ChangePasswordResponse
                {
                    IsSuccess = false,
                    Message = "An error occurred while verifying email change"
                };
            }



        }
    }
}
