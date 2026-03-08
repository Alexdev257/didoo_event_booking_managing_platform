using MediatR;
using TicketService.Application.DTOs.Response.TicketListing;

namespace TicketService.Application.CQRS.Command.TicketListing
{
    public class TicketListingCancelCommand : IRequest<TicketListingCancelResponse>
    {
        public Guid Id { get; set; }
        public Guid SellerUserId { get; set; }
    }
}

