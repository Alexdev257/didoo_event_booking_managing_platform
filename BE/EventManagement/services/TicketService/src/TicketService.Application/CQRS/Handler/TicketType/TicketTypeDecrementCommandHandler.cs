using MediatR;
using TicketService.Application.CQRS.Command.TicketType;
using TicketService.Application.DTOs.Response.TicketType;
using TicketService.Application.Interfaces.Repositories;

namespace TicketService.Application.CQRS.Handler.TicketType
{
    public class TicketTypeDecrementCommandHandler : IRequestHandler<TicketTypeDecrementCommand, TicketTypeDecrementResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;

        public TicketTypeDecrementCommandHandler(ITicketUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TicketTypeDecrementResponse> Handle(TicketTypeDecrementCommand request, CancellationToken cancellationToken)
        {
            var ticketType = await _unitOfWork.TicketTypes.GetByIdAsync(request.Id);
            if (ticketType == null || ticketType.IsDeleted)
            {
                return new TicketTypeDecrementResponse
                {
                    IsSuccess = false,
                    Message = "Ticket type not found",
                    Data = new TicketTypeDecrementDTO { IsAvailable = false, Message = "Ticket type not found" }
                };
            }

            int available = ticketType.AvailableQuantity ?? 0;
            if (available < request.Quantity)
            {
                return new TicketTypeDecrementResponse
                {
                    IsSuccess = false,
                    Message = $"Not enough tickets available. Remaining: {available}",
                    Data = new TicketTypeDecrementDTO
                    {
                        IsAvailable = false,
                        Message = $"Not enough tickets available. Remaining: {available}",
                        RemainingQuantity = available,
                        PricePerTicket = ticketType.Price ?? 0,
                        MaxTicketsPerUser = ticketType.MaxTicketsPerUser
                    }
                };
            }

            ticketType.AvailableQuantity = available - request.Quantity;
            _unitOfWork.TicketTypes.UpdateAsync(ticketType);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new TicketTypeDecrementResponse
            {
                IsSuccess = true,
                Message = "Availability decremented successfully",
                Data = new TicketTypeDecrementDTO
                {
                    IsAvailable = true,
                    Message = "OK",
                    RemainingQuantity = ticketType.AvailableQuantity.Value,
                    PricePerTicket = ticketType.Price ?? 0,
                    MaxTicketsPerUser = ticketType.MaxTicketsPerUser
                }
            };
        }
    }
}
