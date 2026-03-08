using MediatR;
using TicketService.Application.DTOs.Response.TicketListing;
using TicketService.Domain.Enum;
using SharedContracts.Common.Wrappers.Requests;

namespace TicketService.Application.CQRS.Query.TicketListing
{
    public class TicketListingGetListQuery : PaginationRequest, IRequest<TicketListingGetListResponse>
    {
        public Guid? SellerUserId { get; set; }
        public Guid? TicketId { get; set; }
        public TicketListingStatusEnum? Status { get; set; }
        public decimal? FromPrice { get; set; }
        public decimal? ToPrice { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
        public string? Fields { get; set; }
    }
}


