using MediatR;
using TicketService.Application.DTOs.Response.TicketListing;

namespace TicketService.Application.CQRS.Command.TicketListing
{
    public class TicketListingCreateCommand : IRequest<TicketListingCreateResponse>
    {
        public Guid TicketId { get; set; }
        public Guid SellerUserId { get; set; }
        public decimal AskingPrice { get; set; }
        public string? Description { get; set; }
    }
}

