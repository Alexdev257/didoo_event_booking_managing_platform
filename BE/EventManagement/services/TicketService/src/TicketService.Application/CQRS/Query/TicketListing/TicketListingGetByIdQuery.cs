using MediatR;
using TicketService.Application.DTOs.Response.TicketListing;

namespace TicketService.Application.CQRS.Query.TicketListing
{
    public class TicketListingGetByIdQuery : IRequest<TicketListingGetByIdResponse>
    {
        public Guid Id { get; set; }
        public string? Fields { get; set; }
    }

    public class TicketListingValidateQuery : IRequest<TicketListingValidateResponse>
    {
        public Guid ListingId { get; set; }
    }
}

