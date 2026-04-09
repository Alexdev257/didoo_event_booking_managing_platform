using AuthService.Application.CQRS.Command.Auth;
using AuthService.Application.DTOs.Response.Auth;
using AuthService.Application.Interfaces;
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

namespace AuthService.Application.CQRS.Handler.Auth
{
    public class ChangeEmailCommandHandler : IRequestHandler<ChangeEmailCommand, ChangeEmailResponse>
    {
        private readonly IAuthUnitOfWork _unitOfWork;
        private readonly ICacheService _cacheService;
        private readonly IMessageProducer _messageProducer;
        public ChangeEmailCommandHandler(IAuthUnitOfWork unitOfWork, ICacheService cacheService, IMessageProducer messageProducer)
        {
            _unitOfWork = unitOfWork;
            _cacheService = cacheService;
            _messageProducer = messageProducer;
        }
        public async Task<ChangeEmailResponse> Handle(ChangeEmailCommand request, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Users.GetAllAsync().Include(x => x.Role).FirstOrDefaultAsync(x => x.Id.ToString() == request.UserId);
            if (user == null)
            {
                return new ChangeEmailResponse
                {
                    IsSuccess = false,
                    Message = "User not found"
                };
            }

            if (user.IsDeleted)
            {
                return new ChangeEmailResponse
                {
                    IsSuccess = false,
                    Message = "User is deleted"
                };
            }

            if (user.Status == AuthService.Domain.Enum.StatusEnum.Inactive)
            {
                return new ChangeEmailResponse
                {
                    IsSuccess = false,
                    Message = "User is inactive"
                };
            }

            var otp = OtpHelper.GenerateOtp();

            await _cacheService.SetAsync<string>($"CEE_{otp}", request.NewEmail, TimeSpan.FromMinutes(5));
            await _cacheService.SetAsync<string>($"CEOTP_{otp}", otp, TimeSpan.FromMinutes(5));
            await _messageProducer.PublishAsync<SendChangeEmailEmailEvent>(new SendChangeEmailEmailEvent(request.NewEmail, otp), cancellationToken);
            return new ChangeEmailResponse
            {
                IsSuccess = true,
                Message = "OTP sent to new email",
                Data = new ChangeEmailResponseDTO
                {
                    NewEmail = request.NewEmail
                }
            };

        }
    }
}
