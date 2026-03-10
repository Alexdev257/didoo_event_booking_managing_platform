    using MediatR;
    using TicketService.Application.DTOs.Response.TicketListing;

    namespace TicketService.Application.CQRS.Command.TicketListing
    {
        public class TicketListingCreateCommand : IRequest<TicketListingCreateResponse>
        {
            public List<Guid> TicketIds { get; set; }
            public Guid SellerUserId { get; set; }
            public Guid EventId { get; set; }
            public decimal AskingPrice { get; set; }
            public string? Description { get; set; }
        }

        //public class TicketRequest
        //{
        //    public Guid TicketId { get; set; }
        //}
    }

