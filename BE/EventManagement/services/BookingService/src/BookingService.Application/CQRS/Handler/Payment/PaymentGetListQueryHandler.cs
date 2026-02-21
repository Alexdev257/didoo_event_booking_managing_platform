using BookingService.Application.CQRS.Query.Payment;
using BookingService.Application.DTOs.Response.Payment;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using SharedInfrastructure.Extensions;

namespace BookingService.Application.CQRS.Handler.Payment
{
    public class PaymentGetListQueryHandler : IRequestHandler<PaymentGetListQuery, PaymentGetListResponse>
    {
        private readonly IPaymentUnitOfWork _unitOfWork;
        public PaymentGetListQueryHandler(IPaymentUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PaymentGetListResponse> Handle(PaymentGetListQuery request, CancellationToken cancellationToken)
        {
            var payments = _unitOfWork.Payments.GetAllAsync().AsQueryable();

            if (request.IsDeleted.HasValue)
            {
                payments = request.IsDeleted.Value
                    ? payments.Where(x => x.IsDeleted)
                    : payments.Where(x => !x.IsDeleted);
            }

            if (request.UserId.HasValue && request.UserId.Value != Guid.Empty)
                payments = payments.Where(x => x.UserId == request.UserId.Value);

            if (request.BookingId.HasValue && request.BookingId.Value != Guid.Empty)
                payments = payments.Where(x => x.BookingId == request.BookingId.Value);

            if (request.PaymentMethodId.HasValue && request.PaymentMethodId.Value != Guid.Empty)
                payments = payments.Where(x => x.PaymentMethodId == request.PaymentMethodId.Value);

            if (!string.IsNullOrWhiteSpace(request.TransactionCode))
                payments = payments.Where(x => x.TransactionCode != null && x.TransactionCode.ToLower().Contains(request.TransactionCode.ToLower()));

            payments = (request.IsDescending.HasValue && request.IsDescending.Value)
                ? payments.OrderByDescending(x => x.CreatedAt)
                : payments.OrderBy(x => x.CreatedAt);

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                payments,
                request.PageNumber,
                request.PageSize,
                p => new PaymentDTO
                {
                    Id = p.Id.ToString(),
                    UserId = p.UserId.ToString(),
                    BookingId = p.BookingId.HasValue ? p.BookingId.Value.ToString() : null,
                    ResaleTransactionId = p.ResaleTransactionId.HasValue ? p.ResaleTransactionId.Value.ToString() : null,
                    PaymentMethodId = p.PaymentMethodId.HasValue ? p.PaymentMethodId.Value.ToString() : null,
                    Cost = p.Cost,
                    Currency = p.Currency,
                    TransactionCode = p.TransactionCode,
                    ProviderResponse = p.ProviderResponse,
                    PaidAt = p.PaidAt,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    IsDeleted = p.IsDeleted,
                    DeletedAt = p.DeletedAt
                },
                request.Fields);

            return new PaymentGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve Payments Successfully",
                Data = pagedList
            };
        }
    }
}
