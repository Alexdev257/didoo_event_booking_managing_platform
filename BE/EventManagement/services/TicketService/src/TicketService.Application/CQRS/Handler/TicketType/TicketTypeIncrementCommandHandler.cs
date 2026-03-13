using MediatR;
using TicketService.Application.CQRS.Command.TicketType;
using TicketService.Application.DTOs.Response.TicketType;
using TicketService.Application.Interfaces.Repositories;

namespace TicketService.Application.CQRS.Handler.TicketType
{
    public class TicketTypeIncrementCommandHandler : IRequestHandler<TicketTypeIncrementCommand, TicketTypeDecrementResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;

        public TicketTypeIncrementCommandHandler(ITicketUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TicketTypeDecrementResponse> Handle(TicketTypeIncrementCommand request, CancellationToken cancellationToken)
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
            int total = ticketType.TotalQuantity ?? 0;

            // Không cho increment vượt quá TotalQuantity
            int newAvailable = Math.Min(available + request.Quantity, total);

            ticketType.AvailableQuantity = newAvailable;
            _unitOfWork.TicketTypes.UpdateAsync(ticketType);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new TicketTypeDecrementResponse
            {
                IsSuccess = true,
                Message = "Availability incremented successfully",
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
