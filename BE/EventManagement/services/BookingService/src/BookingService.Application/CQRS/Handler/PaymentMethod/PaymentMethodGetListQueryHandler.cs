using BookingService.Application.CQRS.Query.PaymentMethod;
using BookingService.Application.DTOs.Response.PaymentMethod;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using SharedInfrastructure.Extensions;

namespace BookingService.Application.CQRS.Handler.PaymentMethod
{
    public class PaymentMethodGetListQueryHandler : IRequestHandler<PaymentMethodGetListQuery, PaymentMethodGetListResponse>
    {
        private readonly IManageUnitOfWork _unitOfWork;
        public PaymentMethodGetListQueryHandler(IManageUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PaymentMethodGetListResponse> Handle(PaymentMethodGetListQuery request, CancellationToken cancellationToken)
        {
            var methods = _unitOfWork.PaymentMethods.GetAllAsync().AsQueryable();

            if (request.IsDeleted.HasValue)
            {
                methods = request.IsDeleted.Value
                    ? methods.Where(x => x.IsDeleted)
                    : methods.Where(x => !x.IsDeleted);
            }

            if (!string.IsNullOrWhiteSpace(request.Name))
                methods = methods.Where(x => x.Name.ToLower().Contains(request.Name.ToLower()));

            if (request.Status.HasValue)
                methods = methods.Where(x => x.Status == request.Status.Value);

            methods = (request.IsDescending.HasValue && request.IsDescending.Value)
                ? methods.OrderByDescending(x => x.CreatedAt)
                : methods.OrderBy(x => x.CreatedAt);

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                methods,
                request.PageNumber,
                request.PageSize,
                m => new PaymentMethodDTO
                {
                    Id = m.Id.ToString(),
                    Name = m.Name,
                    Description = m.Description,
                    Status = m.Status.ToString(),
                    CreatedAt = m.CreatedAt
                },
                request.Fields);

            return new PaymentMethodGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve Payment Methods Successfully",
                Data = pagedList
            };
        }
    }
}
