using BookingService.Application.CQRS.Query.Resale;
using BookingService.Application.DTOs.Response.Resale;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using SharedInfrastructure.Extensions;

namespace BookingService.Application.CQRS.Handler.Resale
{
    public class ResaleGetListQueryHandler : IRequestHandler<ResaleGetListQuery, ResaleGetListResponse>
    {
        private readonly IManageUnitOfWork _unitOfWork;
        public ResaleGetListQueryHandler(IManageUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ResaleGetListResponse> Handle(ResaleGetListQuery request, CancellationToken cancellationToken)
        {
            var resales = _unitOfWork.Resales.GetAllAsync().AsQueryable();

            if (request.IsDeleted.HasValue)
            {
                resales = request.IsDeleted.Value
                    ? resales.Where(x => x.IsDeleted)
                    : resales.Where(x => !x.IsDeleted);
            }

            if (request.SalerUserId.HasValue && request.SalerUserId.Value != Guid.Empty)
                resales = resales.Where(x => x.SalerUserId == request.SalerUserId.Value);

            if (request.BookingDetailId.HasValue && request.BookingDetailId.Value != Guid.Empty)
                resales = resales.Where(x => x.BookingDetailId == request.BookingDetailId.Value);

            if (request.Status.HasValue)
                resales = resales.Where(x => x.Status == request.Status.Value);

            if (request.FromPrice.HasValue)
                resales = resales.Where(x => x.Price >= request.FromPrice.Value);

            if (request.ToPrice.HasValue)
                resales = resales.Where(x => x.Price <= request.ToPrice.Value);

            resales = (request.IsDescending.HasValue && request.IsDescending.Value)
                ? resales.OrderByDescending(x => x.CreatedAt)
                : resales.OrderBy(x => x.CreatedAt);

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                resales,
                request.PageNumber,
                request.PageSize,
                r => new ResaleDTO
                {
                    Id = r.Id.ToString(),
                    SalerUserId = r.SalerUserId.ToString(),
                    BookingDetailId = r.BookingDetailId.ToString(),
                    Description = r.Description,
                    Price = r.Price,
                    Status = r.Status.ToString(),
                    CreatedAt = r.CreatedAt,
                    UpdatedAt = r.UpdatedAt,
                    IsDeleted = r.IsDeleted,
                    DeletedAt = r.DeletedAt
                },
                request.Fields);

            return new ResaleGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve Resales Successfully",
                Data = pagedList
            };
        }
    }
}
