using MediatR;
using TicketService.Application.CQRS.Command.TicketListing;
using TicketService.Application.DTOs.Response.TicketListing;
using TicketService.Application.Interfaces.Repositories;
using TicketService.Domain.Entities;
using TicketService.Domain.Enum;

namespace TicketService.Application.CQRS.Handler.TicketListing
{
    public class TicketListingCreateCommandHandler : IRequestHandler<TicketListingCreateCommand, TicketListingCreateResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;

        public TicketListingCreateCommandHandler(ITicketUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TicketListingCreateResponse> Handle(TicketListingCreateCommand request, CancellationToken cancellationToken)
        {
            //// Validate ticket exists and is owned by seller
            //var ticket = await _unitOfWork.Tickets.GetByIdAsync(request.TicketId);
            //if (ticket == null || ticket.IsDeleted)
            //    return new TicketListingCreateResponse { IsSuccess = false, Message = "Ticket not found." };

            //if (ticket.OwnerId != request.SellerUserId)
            //    return new TicketListingCreateResponse { IsSuccess = false, Message = "You do not own this ticket." };

            //if (ticket.Status != TicketStatusEnum.Available)
            //    return new TicketListingCreateResponse { IsSuccess = false, Message = $"Ticket is not available for listing. Current status: {ticket.Status}." };

            //// Check no active listing already exists for this ticket
            //var existingActive = _unitOfWork.TicketListings
            //    .GetAllAsync()
            //    .Where(l => l.TicketId == request.TicketId && l.Status == TicketListingStatusEnum.Active && !l.IsDeleted)
            //    .Any();

            //if (existingActive)
            //    return new TicketListingCreateResponse { IsSuccess = false, Message = "An active listing already exists for this ticket." };

            //// Lock the ticket so it can't be double-booked
            //ticket.Status = TicketStatusEnum.Locked;
            //_unitOfWork.Tickets.UpdateAsync(ticket);

            //var listing = new Domain.Entities.TicketListing
            //{
            //    Id = Guid.NewGuid(),
            //    TicketId = request.TicketId,
            //    SellerUserId = request.SellerUserId,
            //    AskingPrice = request.AskingPrice,
            //    Description = request.Description,
            //    Status = TicketListingStatusEnum.Active,
            //    CreatedAt = DateTime.UtcNow,
            //};

            //await _unitOfWork.TicketListings.AddAsync(listing);
            //await _unitOfWork.SaveChangesAsync(cancellationToken);

            //return new TicketListingCreateResponse
            //{
            //    IsSuccess = true,
            //    Message = "Ticket listing created successfully.",
            //    Data = MapToDTO(listing)
            //};

            var listings = new List<TicketListingDTO>();

            foreach (var ticketId in request.TicketIds)
            {
                var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);

                if (ticket == null || ticket.IsDeleted)
                {
                    return new TicketListingCreateResponse
                    {
                        IsSuccess = false,
                        Message = $"Ticket {ticketId} not found."
                    };
                }

                if (ticket.OwnerId != request.SellerUserId)
                {
                    return new TicketListingCreateResponse
                    {
                        IsSuccess = false,
                        Message = $"You do not own ticket {ticketId}."
                    };
                }

                if (ticket.Status != TicketStatusEnum.Available)
                {
                    return new TicketListingCreateResponse
                    {
                        IsSuccess = false,
                        Message = $"Ticket {ticketId} is not available."
                    };
                }

                var existingActive = (_unitOfWork.TicketListings.GetAllAsync())
                    .Any(x => x.TicketId == ticketId
                           && x.Status == TicketListingStatusEnum.Active
                           && !x.IsDeleted);

                if (existingActive)
                {
                    return new TicketListingCreateResponse
                    {
                        IsSuccess = false,
                        Message = $"Active listing already exists for ticket {ticketId}"
                    };
                }

                // Lock ticket
                ticket.Status = TicketStatusEnum.Locked;
                _unitOfWork.Tickets.UpdateAsync(ticket);

                var listing = new Domain.Entities.TicketListing
                {
                    Id = Guid.NewGuid(),
                    TicketId = ticketId,
                    SellerUserId = request.SellerUserId,
                    EventId = ticket.EventId,
                    AskingPrice = request.AskingPrice,
                    Description = request.Description,
                    Status = TicketListingStatusEnum.Active,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.TicketListings.AddAsync(listing);

                listings.Add(MapToDTO(listing));
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new TicketListingCreateResponse
            {
                IsSuccess = true,
                Message = "Ticket listings created successfully.",
                Data = listings
            };
        }

        private static TicketListingDTO MapToDTO(Domain.Entities.TicketListing l) => new()
        {
            Id = l.Id.ToString(),
            //TicketId = l.TicketId.ToString(),
            //SellerUserId = l.SellerUserId.ToString(),
            AskingPrice = l.AskingPrice,
            Description = l.Description,
            Status = l.Status,
            CreatedAt = l.CreatedAt,
            UpdatedAt = l.UpdatedAt,
        };
    }
}

