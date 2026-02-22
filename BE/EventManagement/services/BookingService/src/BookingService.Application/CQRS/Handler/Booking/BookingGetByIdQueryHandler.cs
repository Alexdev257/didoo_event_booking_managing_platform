using BookingService.Application.CQRS.Query.Booking;
using BookingService.Application.DTOs.Response.Booking;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;

namespace BookingService.Application.CQRS.Handler.Booking
{
    public class BookingGetByIdQueryHandler : IRequestHandler<BookingGetByIdQuery, BookingGetByIdResponse>
    {
        private readonly IManageUnitOfWork _unitOfWork;
        public BookingGetByIdQueryHandler(IManageUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<BookingGetByIdResponse> Handle(BookingGetByIdQuery request, CancellationToken cancellationToken)
        {
            var booking = await _unitOfWork.Bookings
                .GetAllAsync()
                .Include(x => x.BookingDetails)
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (booking == null)
            {
                return new BookingGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Booking is not found"
                };
            }
            if (booking.IsDeleted)
            {
                return new BookingGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Booking is deleted"
                };
            }

            var dto = new BookingDTO
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
                BookingDetails = booking.BookingDetails.Select(d => new BookingDetailSubDTO
                {
                    Id = d.Id.ToString(),
                    SeatId = d.SeatId.HasValue ? d.SeatId.Value.ToString() : null,
                    TicketId = d.TicketId.HasValue ? d.TicketId.Value.ToString() : null,
                    Quantity = d.Quantity,
                    PricePerTicket = d.PricePerTicket,
                    TotalPrice = d.TotalPrice
                }).ToList()
            };

            var shapedData = DataShaper.ShapeData(dto, request.Fields);
            return new BookingGetByIdResponse
            {
                IsSuccess = true,
                Message = "Retrieve Booking Successfully",
                Data = shapedData
            };
        }
    }
}
