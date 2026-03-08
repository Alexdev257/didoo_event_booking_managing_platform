using MediatR;

namespace TicketService.Application.CQRS.Command.Ticket
{
    /// <summary>
    /// Called internally (e.g. from BookingService payment callback) to bulk-create
    /// Ticket records for a normal (non-trade) purchase after payment is confirmed.
    /// </summary>
    public class TicketBulkCreateCommand : IRequest<TicketBulkCreateResponse>
    {
        public Guid TicketTypeId { get; set; }
        public Guid EventId { get; set; }
        /// <summary>The buyer's UserId – becomes the initial OwnerId for each created Ticket.</summary>
        public Guid OwnerId { get; set; }
        public int Quantity { get; set; }
        public string? Zone { get; set; }
    }

    public class TicketBulkCreateResponse : SharedContracts.Common.Wrappers.CommonResponse<List<string>>
    {
    }
}


