using BookingService.Application.DTOs.Response.BookingDetail;
using MediatR;
using SharedContracts.Common.Wrappers.Requests;

namespace BookingService.Application.CQRS.Query.BookingDetail
{
    public class BookingDetailGetListQuery : PaginationRequest, IRequest<BookingDetailGetListResponse>
    {
        public Guid? BookingId { get; set; }
        public Guid? TicketId { get; set; }
        public Guid? SeatId { get; set; }
        public string? Fields { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
