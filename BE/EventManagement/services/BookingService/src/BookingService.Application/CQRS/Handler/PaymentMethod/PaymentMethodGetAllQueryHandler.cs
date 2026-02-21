using BookingService.Application.CQRS.Query.PaymentMethod;
using BookingService.Application.DTOs.Response.PaymentMethod;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BookingService.Application.CQRS.Handler.PaymentMethod
{
    public class PaymentMethodGetAllQueryHandler : IRequestHandler<PaymentMethodGetAllQuery, GetAllPaymentMethodResponse>
    {
        private readonly IPaymentUnitOfWork _unitOfWork;
        public PaymentMethodGetAllQueryHandler(IPaymentUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<GetAllPaymentMethodResponse> Handle(PaymentMethodGetAllQuery request, CancellationToken cancellationToken)
        {
            var result = _unitOfWork.PaymentMethods.GetAllAsync();
            var dto = await result.Select(d => new PaymentMethodDTO
            {
                Id = d.Id.ToString(),
                Name = d.Name,
                Description = d.Description,
                Status = d.Status.ToString(),
                CreatedAt = d.CreatedAt
            }).ToListAsync(cancellationToken);

            return new GetAllPaymentMethodResponse
            {
                IsSuccess = true,
                Message = "Retrieve payment method successfully",
                Data = dto
            };
        }
    }
}
