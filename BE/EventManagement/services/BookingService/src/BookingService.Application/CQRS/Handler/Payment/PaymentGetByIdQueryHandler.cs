using BookingService.Application.CQRS.Query.Payment;
using BookingService.Application.DTOs.Response.Payment;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;

namespace BookingService.Application.CQRS.Handler.Payment
{
    public class PaymentGetByIdQueryHandler : IRequestHandler<PaymentGetByIdQuery, PaymentGetByIdResponse>
    {
        private readonly IManageUnitOfWork _unitOfWork;
        public PaymentGetByIdQueryHandler(IManageUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PaymentGetByIdResponse> Handle(PaymentGetByIdQuery request, CancellationToken cancellationToken)
        {
            var payment = await _unitOfWork.Payments
                .GetAllAsync()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (payment == null)
            {
                return new PaymentGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Payment is not found"
                };
            }
            if (payment.IsDeleted)
            {
                return new PaymentGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Payment is deleted"
                };
            }

            var dto = new PaymentDTO
            {
                Id = payment.Id.ToString(),
                UserId = payment.UserId.ToString(),
                BookingId = payment.BookingId.HasValue ? payment.BookingId.Value.ToString() : null,
                ResaleTransactionId = payment.ResaleTransactionId.HasValue ? payment.ResaleTransactionId.Value.ToString() : null,
                PaymentMethodId = payment.PaymentMethodId.HasValue ? payment.PaymentMethodId.Value.ToString() : null,
                Cost = payment.Cost,
                Currency = payment.Currency,
                TransactionCode = payment.TransactionCode,
                ProviderResponse = payment.ProviderResponse,
                PaidAt = payment.PaidAt,
                CreatedAt = payment.CreatedAt,
                UpdatedAt = payment.UpdatedAt,
                IsDeleted = payment.IsDeleted,
                DeletedAt = payment.DeletedAt
            };

            var shapedData = DataShaper.ShapeData(dto, request.Fields);
            return new PaymentGetByIdResponse
            {
                IsSuccess = true,
                Message = "Retrieve Payment Successfully",
                Data = shapedData
            };
        }
    }
}
