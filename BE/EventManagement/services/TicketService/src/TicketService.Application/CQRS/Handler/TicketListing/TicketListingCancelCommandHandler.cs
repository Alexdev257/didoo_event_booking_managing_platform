using MediatR;
using TicketService.Application.CQRS.Command.TicketListing;
using TicketService.Application.DTOs.Response.TicketListing;
using TicketService.Application.Interfaces.Repositories;
using TicketService.Domain.Enum;

namespace TicketService.Application.CQRS.Handler.TicketListing
{
    public class TicketListingCancelCommandHandler : IRequestHandler<TicketListingCancelCommand, TicketListingCancelResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;

        public TicketListingCancelCommandHandler(ITicketUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TicketListingCancelResponse> Handle(TicketListingCancelCommand request, CancellationToken cancellationToken)
        {
            var listing = await _unitOfWork.TicketListings.GetByIdAsync(request.Id);
            if (listing == null || listing.IsDeleted)
                return new TicketListingCancelResponse { IsSuccess = false, Message = "Listing not found." };

            if (listing.SellerUserId != request.SellerUserId)
                return new TicketListingCancelResponse { IsSuccess = false, Message = "You are not authorized to cancel this listing." };

            if (listing.Status == TicketListingStatusEnum.Sold)
                return new TicketListingCancelResponse { IsSuccess = false, Message = "Cannot cancel a listing that has already been sold." };

            if (listing.Status == TicketListingStatusEnum.Cancelled)
                return new TicketListingCancelResponse { IsSuccess = false, Message = "Listing is already cancelled." };

            listing.Status = TicketListingStatusEnum.Cancelled;
            _unitOfWork.TicketListings.UpdateAsync(listing);

            // Unlock ticket back to Available
            var ticket = await _unitOfWork.Tickets.GetByIdAsync(listing.TicketId);
            if (ticket != null && ticket.Status == TicketStatusEnum.Locked)
            {
                ticket.Status = TicketStatusEnum.Available;
                _unitOfWork.Tickets.UpdateAsync(ticket);
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new TicketListingCancelResponse
            {
                IsSuccess = true,
                Message = "Listing cancelled successfully.",
                Data = new TicketListingDTO
                {
                    Id = listing.Id.ToString(),
                    Ticket = new TicketListingTicketDTO
                    {
                        Id = listing.TicketId.ToString(),
                    },
                    SellerUser = new TicketListingUserDTO
                    {
                        Id  = listing.SellerUserId.ToString(),
                    },
                    Event = new TicketListingEventDTO
                    {
                        Id = listing.EventId.ToString(),
                    },
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

