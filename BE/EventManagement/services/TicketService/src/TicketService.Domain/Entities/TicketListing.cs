using SharedKernel.Domain;
using TicketService.Domain.Enum;

namespace TicketService.Domain.Entities
{
    public class TicketListing : AuditableEntity
    {
        public Guid TicketId { get; set; }
        public Guid SellerUserId { get; set; }
        public decimal AskingPrice { get; set; }
        public string? Description { get; set; }
        public TicketListingStatusEnum Status { get; set; } = TicketListingStatusEnum.Active;

        public virtual Ticket Ticket { get; set; } = default!;
    }
}

