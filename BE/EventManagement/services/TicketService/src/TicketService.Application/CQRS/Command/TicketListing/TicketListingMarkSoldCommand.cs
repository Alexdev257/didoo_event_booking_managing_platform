using MediatR;
using TicketService.Application.DTOs.Response.TicketListing;

namespace TicketService.Application.CQRS.Command.TicketListing
{
    /// <summary>
    /// Called internally (e.g. from BookingService callback) to transfer ticket ownership
    /// and mark the listing as Sold.
    /// </summary>
    public class TicketListingMarkSoldCommand : IRequest<TicketListingMarkSoldResponse>
    {
        public Guid ListingId { get; set; }
        public Guid NewOwnerUserId { get; set; }
    }

    public class TicketListingMarkSoldResponse : SharedContracts.Common.Wrappers.CommonResponse<TicketListingDTO> { }
}

