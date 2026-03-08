using MediatR;
using SharedInfrastructure.Extensions;
using TicketService.Application.CQRS.Query.TicketListing;
using TicketService.Application.DTOs.Response.TicketListing;
using TicketService.Application.Interfaces.Repositories;

namespace TicketService.Application.CQRS.Handler.TicketListing
{
    public class TicketListingGetListQueryHandler : IRequestHandler<TicketListingGetListQuery, TicketListingGetListResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;

        public TicketListingGetListQueryHandler(ITicketUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TicketListingGetListResponse> Handle(TicketListingGetListQuery request, CancellationToken cancellationToken)
        {
            var listings = _unitOfWork.TicketListings.GetAllAsync().AsQueryable();

            if (request.IsDeleted.HasValue)
                listings = request.IsDeleted.Value ? listings.Where(x => x.IsDeleted) : listings.Where(x => !x.IsDeleted);

            if (request.SellerUserId.HasValue && request.SellerUserId.Value != Guid.Empty)
                listings = listings.Where(x => x.SellerUserId == request.SellerUserId.Value);

            if (request.TicketId.HasValue && request.TicketId.Value != Guid.Empty)
                listings = listings.Where(x => x.TicketId == request.TicketId.Value);

            if (request.Status.HasValue)
                listings = listings.Where(x => x.Status == request.Status.Value);

            if (request.FromPrice.HasValue)
                listings = listings.Where(x => x.AskingPrice >= request.FromPrice.Value);

            if (request.ToPrice.HasValue)
                listings = listings.Where(x => x.AskingPrice <= request.ToPrice.Value);

            listings = (request.IsDescending.HasValue && request.IsDescending.Value)
                ? listings.OrderByDescending(x => x.CreatedAt)
                : listings.OrderBy(x => x.CreatedAt);

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                listings,
                request.PageNumber,
                request.PageSize,
                l => new TicketListingDTO
                {
                    Id = l.Id.ToString(),
                    TicketId = l.TicketId.ToString(),
                    SellerUserId = l.SellerUserId.ToString(),
                    AskingPrice = l.AskingPrice,
                    Description = l.Description,
                    Status = l.Status,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt,
                },
                request.Fields);

            return new TicketListingGetListResponse
            {
                IsSuccess = true,
                Message = "Success",
                Data = pagedList
            };
        }
    }
}


