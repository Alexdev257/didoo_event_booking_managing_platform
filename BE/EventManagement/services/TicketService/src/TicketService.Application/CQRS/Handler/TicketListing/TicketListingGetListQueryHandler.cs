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
            //var listings = _unitOfWork.TicketListings.GetAllAsync().AsQueryable();

            //if (request.IsDeleted.HasValue)
            //    listings = request.IsDeleted.Value ? listings.Where(x => x.IsDeleted) : listings.Where(x => !x.IsDeleted);

            //if (request.SellerUserId.HasValue && request.SellerUserId.Value != Guid.Empty)
            //    listings = listings.Where(x => x.SellerUserId == request.SellerUserId.Value);

            //if (request.TicketId.HasValue && request.TicketId.Value != Guid.Empty)
            //    listings = listings.Where(x => x.TicketId == request.TicketId.Value);

            //if(request.EventId.HasValue && request.EventId.Value != Guid.Empty)
            //    listings = listings.Where(x => x.Ticket.EventId == request.EventId.Value);

            //if (request.Status.HasValue)
            //    listings = listings.Where(x => x.Status == request.Status.Value);

            //if (request.FromPrice.HasValue)
            //    listings = listings.Where(x => x.AskingPrice >= request.FromPrice.Value);

            //if (request.ToPrice.HasValue)
            //    listings = listings.Where(x => x.AskingPrice <= request.ToPrice.Value);

            //listings = (request.IsDescending.HasValue && request.IsDescending.Value)
            //    ? listings.OrderByDescending(x => x.CreatedAt)
            //    : listings.OrderBy(x => x.CreatedAt);

            //var pagedList = await QueryableExtensions.ToPagedListAsync(
            //    listings,
            //    request.PageNumber,
            //    request.PageSize,
            //    l => new TicketListingDTO
            //    {
            //        Id = l.Id.ToString(),
            //        //TicketId = l.TicketId.ToString(),
            //        //SellerUserId = l.SellerUserId.ToString(),
            //        Ticket = new List<TicketListingTicketDTO>
            //        {
            //            new TicketListingTicketDTO
            //            {
            //                Id = l.TicketId.ToString(),
            //            },
            //        },
            //        SellerUser = new TicketListingUserDTO
            //        {
            //            Id = l.SellerUserId.ToString(),
            //        },
            //        Event = new TicketListingEventDTO
            //        {
            //            Id = l.EventId.ToString(),
            //        },
            //        AskingPrice = l.AskingPrice,
            //        Description = l.Description,
            //        Status = l.Status,
            //        CreatedAt = l.CreatedAt,
            //        UpdatedAt = l.UpdatedAt,
            //    },
            //    request.Fields);

            //return new TicketListingGetListResponse
            //{
            //    IsSuccess = true,
            //    Message = "Success",
            //    Data = pagedList
            //};


            var listings = _unitOfWork.TicketListings.GetAllAsync().AsQueryable();

            if (request.IsDeleted.HasValue)
                listings = request.IsDeleted.Value
                    ? listings.Where(x => x.IsDeleted)
                    : listings.Where(x => !x.IsDeleted);

            if (request.SellerUserId.HasValue && request.SellerUserId.Value != Guid.Empty)
                listings = listings.Where(x => x.SellerUserId == request.SellerUserId.Value);

            if (request.TicketId.HasValue && request.TicketId.Value != Guid.Empty)
                listings = listings.Where(x => x.TicketId == request.TicketId.Value);

            if (request.EventId.HasValue && request.EventId.Value != Guid.Empty)
                listings = listings.Where(x => x.EventId == request.EventId.Value);

            if (request.Status.HasValue)
                listings = listings.Where(x => x.Status == request.Status.Value);

            if (request.FromPrice.HasValue)
                listings = listings.Where(x => x.AskingPrice >= request.FromPrice.Value);

            if (request.ToPrice.HasValue)
                listings = listings.Where(x => x.AskingPrice <= request.ToPrice.Value);

            listings = (request.IsDescending.HasValue && request.IsDescending.Value)
                ? listings.OrderByDescending(x => x.CreatedAt)
                : listings.OrderBy(x => x.CreatedAt);


            // ========================
            // GROUP LISTING
            // ========================

            var groupedListings = listings
                .GroupBy(x => new { x.SellerUserId, x.EventId })
                .Select(g => new TicketListingDTO
                {
                    Id = g.First().Id.ToString(),

                    Ticket = g.Select(x => new TicketListingTicketDTO
                    {
                        Id = x.TicketId.ToString()
                    }).ToList(),

                    SellerUser = new TicketListingUserDTO
                    {
                        Id = g.Key.SellerUserId.ToString()
                    },

                    Event = new TicketListingEventDTO
                    {
                        Id = g.Key.EventId.ToString()
                    },

                    AskingPrice = g.First().AskingPrice,
                    Description = g.First().Description,
                    Status = g.First().Status,
                    CreatedAt = g.First().CreatedAt,
                    UpdatedAt = g.First().UpdatedAt
                });


            // ========================
            // PAGINATION
            // ========================

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                groupedListings,
                request.PageNumber,
                request.PageSize,
                x => x,
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


