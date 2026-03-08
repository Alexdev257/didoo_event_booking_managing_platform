using MediatR;
using TicketService.Application.CQRS.Command.TicketListing;
using TicketService.Application.DTOs.Response.TicketListing;
using TicketService.Application.Interfaces.Repositories;
using TicketService.Domain.Enum;

namespace TicketService.Application.CQRS.Handler.TicketListing
{
    public class TicketListingMarkSoldCommandHandler : IRequestHandler<TicketListingMarkSoldCommand, TicketListingMarkSoldResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;

        public TicketListingMarkSoldCommandHandler(ITicketUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TicketListingMarkSoldResponse> Handle(TicketListingMarkSoldCommand request, CancellationToken cancellationToken)
        {
            var listing = await _unitOfWork.TicketListings.GetByIdAsync(request.ListingId);
            if (listing == null || listing.IsDeleted)
                return new TicketListingMarkSoldResponse { IsSuccess = false, Message = "Listing not found." };

            if (listing.Status != TicketListingStatusEnum.Active && listing.Status != TicketListingStatusEnum.Pending)
                return new TicketListingMarkSoldResponse { IsSuccess = false, Message = $"Listing cannot be marked as sold. Status: {listing.Status}." };

            listing.Status = TicketListingStatusEnum.Sold;
            _unitOfWork.TicketListings.UpdateAsync(listing);

            // Transfer ownership and make ticket available again for the new owner
            var ticket = await _unitOfWork.Tickets.GetByIdAsync(listing.TicketId);
            if (ticket != null)
            {
                ticket.OwnerId = request.NewOwnerUserId;
                ticket.Status = TicketStatusEnum.Available;
                _unitOfWork.Tickets.UpdateAsync(ticket);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new TicketListingMarkSoldResponse
            {
                IsSuccess = true,
                Message = "Ticket ownership transferred and listing marked as sold.",
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
}

