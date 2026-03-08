using MediatR;
using TicketService.Application.CQRS.Command.Ticket;
using TicketService.Application.Interfaces.Repositories;
using TicketService.Domain.Enum;

namespace TicketService.Application.CQRS.Handler.Ticket
{
    public class TicketBulkCreateCommandHandler : IRequestHandler<TicketBulkCreateCommand, TicketBulkCreateResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;

        public TicketBulkCreateCommandHandler(ITicketUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<TicketBulkCreateResponse> Handle(TicketBulkCreateCommand request, CancellationToken cancellationToken)
        {
            if (request.Quantity <= 0)
                return new TicketBulkCreateResponse { IsSuccess = false, Message = "Quantity must be greater than 0." };

            var ticketType = await _unitOfWork.TicketTypes.GetByIdAsync(request.TicketTypeId);
            if (ticketType == null || ticketType.IsDeleted)
                return new TicketBulkCreateResponse { IsSuccess = false, Message = "TicketType not found or has been deleted." };

            var createdIds = new List<string>();

            for (int i = 0; i < request.Quantity; i++)
            {
                var ticket = new Domain.Entities.Ticket
                {
                    Id = Guid.NewGuid(),
                    TicketTypeId = request.TicketTypeId,
                    EventId = request.EventId,
                    OwnerId = request.OwnerId,
                    Zone = request.Zone,
                    Status = TicketStatusEnum.Available,
                    CreatedAt = DateTime.UtcNow,
                };

                await _unitOfWork.Tickets.AddAsync(ticket);
                createdIds.Add(ticket.Id.ToString());
            }

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new TicketBulkCreateResponse
            {
                IsSuccess = true,
                Message = $"{request.Quantity} ticket(s) created successfully.",
                Data = createdIds,
            };
        }
    }
}


