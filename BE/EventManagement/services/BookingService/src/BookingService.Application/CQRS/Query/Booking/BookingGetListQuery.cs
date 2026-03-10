using BookingService.Application.DTOs.Response.Booking;
using BookingService.Domain.Enum;
using MediatR;
using SharedContracts.Common.Wrappers.Requests;

namespace BookingService.Application.CQRS.Query.Booking
{
    public class BookingGetListQuery : PaginationRequest, IRequest<BookingGetListResponse>
    {
        public Guid? UserId { get; set; }
        public Guid? EventId { get; set; }
        public BookingStatusEnum? Status { get; set; }
        
        public BookingTypeEnum? BookingType { get; set; }
        public string? Fields { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
