using BookingService.Application.CQRS.Query.Booking;
using BookingService.Application.DTOs.Response.Booking;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;
using BookingService.Domain.Enum;
namespace BookingService.Application.CQRS.Handler.Booking
{
    public class BookingGetListQueryHandler : IRequestHandler<BookingGetListQuery, BookingGetListResponse>
    {
        private readonly IManageUnitOfWork _unitOfWork;
        public BookingGetListQueryHandler(IManageUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<BookingGetListResponse> Handle(BookingGetListQuery request, CancellationToken cancellationToken)
        {
            var bookings = _unitOfWork.Bookings
                .GetAllAsync()
                .Include(x => x.BookingDetails)
                .AsQueryable();

            if (request.IsDeleted.HasValue)
            {
                bookings = request.IsDeleted.Value
                    ? bookings.Where(x => x.IsDeleted)
                    : bookings.Where(x => !x.IsDeleted);
            }

            if (request.UserId.HasValue && request.UserId.Value != Guid.Empty)
                bookings = bookings.Where(x => x.UserId == request.UserId.Value);

            if (request.EventId.HasValue && request.EventId.Value != Guid.Empty)
                bookings = bookings.Where(x => x.EventId == request.EventId.Value);

            if (request.Status.HasValue)
                bookings = bookings.Where(x => x.Status == request.Status.Value);

            if (request.BookingType.HasValue)
                bookings = bookings.Where(x => x.BookingType == request.BookingType.Value);

            bookings = (request.IsDescending.HasValue && request.IsDescending.Value)
                ? bookings.OrderByDescending(x => x.CreatedAt)
                : bookings.OrderBy(x => x.CreatedAt);

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                bookings,
                request.PageNumber,
                request.PageSize,
                booking => new BookingDTO
                {
                    Id = booking.Id.ToString(),
                    UserId = booking.UserId.ToString(),
                    EventId = booking.EventId.ToString(),
                    Fullname = booking.Fullname ?? string.Empty,
                    Email = booking.Email ?? string.Empty,
                    Phone = booking.Phone ?? string.Empty,
                    Amount = booking.Amount,
                    TotalPrice = booking.TotalPrice,
                    Status = booking.Status.ToString(),
                    PaidAt = booking.PaidAt,
                    CreatedAt = booking.CreatedAt,
                    UpdatedAt = booking.UpdatedAt,
                    IsDeleted = booking.IsDeleted,
                    DeletedAt = booking.DeletedAt,
                    BookingType = booking.BookingType == BookingTypeEnum.Normal ? "Normal" : "TradePurchase",
                    BookingDetails = booking.BookingDetails.Select(d => new BookingDetailSubDTO
                    {
                        Id = d.Id.ToString(),
                        SeatId = d.SeatId.HasValue ? d.SeatId.Value.ToString() : null,
                        TicketId = d.TicketId.HasValue ? d.TicketId.Value.ToString() : null,
                        TicketListingId = d.TicketListingId.HasValue ? d.TicketListingId.Value.ToString() : null,
                        TicketTypeId = d.TicketTypeId.HasValue ? d.TicketTypeId.Value.ToString() : null,
                        Quantity = d.Quantity,
                        PricePerTicket = d.PricePerTicket,
                        TotalPrice = d.TotalPrice
                    }).ToList()
                },
                request.Fields);

            return new BookingGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve Bookings Successfully",
                Data = pagedList
            };
        }
    }
}
