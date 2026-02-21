using BookingService.Application.CQRS.Query.PaymentMethod;
using BookingService.Application.DTOs.Response.PaymentMethod;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;

namespace BookingService.Application.CQRS.Handler.PaymentMethod
{
    public class PaymentMethodGetByIdQueryHandler : IRequestHandler<PaymentMethodGetByIdQuery, PaymentMethodGetByIdResponse>
    {
        private readonly IPaymentUnitOfWork _unitOfWork;
        public PaymentMethodGetByIdQueryHandler(IPaymentUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PaymentMethodGetByIdResponse> Handle(PaymentMethodGetByIdQuery request, CancellationToken cancellationToken)
        {
            var method = await _unitOfWork.PaymentMethods
                .GetAllAsync()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (method == null)
            {
                return new PaymentMethodGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Payment method is not found"
                };
            }
            if (method.IsDeleted)
            {
                return new PaymentMethodGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Payment method is deleted"
                };
            }

            var dto = new PaymentMethodDTO
            {
                Id = method.Id.ToString(),
                Name = method.Name,
                Description = method.Description,
                Status = method.Status.ToString(),
                CreatedAt = method.CreatedAt
            };

            var shapedData = DataShaper.ShapeData(dto, request.Fields);
            return new PaymentMethodGetByIdResponse
            {
                IsSuccess = true,
                Message = "Retrieve Payment Method Successfully",
                Data = shapedData
            };
        }
    }
}
