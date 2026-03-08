using MediatR;
using TicketService.Application.CQRS.Query.TicketListing;
using TicketService.Application.DTOs.Response.TicketListing;
using TicketService.Application.Interfaces.Repositories;
using TicketService.Domain.Enum;

namespace TicketService.Application.CQRS.Handler.TicketListing
{
    public class TicketListingGetByIdQueryHandler : IRequestHandler<TicketListingGetByIdQuery, TicketListingGetByIdResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;

        public TicketListingGetByIdQueryHandler(ITicketUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TicketListingGetByIdResponse> Handle(TicketListingGetByIdQuery request, CancellationToken cancellationToken)
        {
            var listing = await _unitOfWork.TicketListings.GetByIdAsync(request.Id);
            if (listing == null || listing.IsDeleted)
                return new TicketListingGetByIdResponse { IsSuccess = false, Message = "Listing not found." };

            return new TicketListingGetByIdResponse
            {
                IsSuccess = true,
                Message = "Success",
                Data = new TicketListingDTO
                {
                    Id = listing.Id.ToString(),
                    TicketId = listing.TicketId.ToString(),
                    SellerUserId = listing.SellerUserId.ToString(),
                    AskingPrice = listing.AskingPrice,
                    Description = listing.Description,
                    Status = listing.Status,
                    CreatedAt = listing.CreatedAt,
                    UpdatedAt = listing.UpdatedAt,
                }
            };
        }
    }

    public class TicketListingValidateQueryHandler : IRequestHandler<TicketListingValidateQuery, TicketListingValidateResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;

        public TicketListingValidateQueryHandler(ITicketUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TicketListingValidateResponse> Handle(TicketListingValidateQuery request, CancellationToken cancellationToken)
        {
            var listing = await _unitOfWork.TicketListings.GetByIdAsync(request.ListingId);

            if (listing == null || listing.IsDeleted)
                return new TicketListingValidateResponse
                {
                    IsSuccess = false,
                    Message = "Listing not found.",
                    Data = new TicketListingValidateData { IsAvailable = false, Message = "Listing not found." }
                };

            if (listing.Status != TicketListingStatusEnum.Active)
                return new TicketListingValidateResponse
                {
                    IsSuccess = false,
                    Message = $"Listing is not active. Current status: {listing.Status}.",
                    Data = new TicketListingValidateData { IsAvailable = false, Message = $"Listing is not active. Status: {listing.Status}." }
                };

            var ticket = await _unitOfWork.Tickets.GetByIdAsync(listing.TicketId);

            return new TicketListingValidateResponse
            {
                IsSuccess = true,
                Message = "Listing is available.",
                Data = new TicketListingValidateData
                {
                    IsAvailable = true,
                    Message = "Listing is active and available for purchase.",
                    TicketId = listing.TicketId.ToString(),
                    EventId = ticket?.EventId.ToString(),
                    AskingPrice = listing.AskingPrice,
                }
            };
        }
    }
}

