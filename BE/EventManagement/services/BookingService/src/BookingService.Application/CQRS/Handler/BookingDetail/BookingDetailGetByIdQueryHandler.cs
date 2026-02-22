using BookingService.Application.CQRS.Query.BookingDetail;
using BookingService.Application.DTOs.Response.BookingDetail;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;

namespace BookingService.Application.CQRS.Handler.BookingDetail
{
    public class BookingDetailGetByIdQueryHandler : IRequestHandler<BookingDetailGetByIdQuery, BookingDetailGetByIdResponse>
    {
        private readonly IManageUnitOfWork _unitOfWork;
        public BookingDetailGetByIdQueryHandler(IManageUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<BookingDetailGetByIdResponse> Handle(BookingDetailGetByIdQuery request, CancellationToken cancellationToken)
        {
            var detail = await _unitOfWork.BookingDetails
                .GetAllAsync()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (detail == null)
            {
                return new BookingDetailGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Booking detail is not found"
                };
            }
            if (detail.IsDeleted)
            {
                return new BookingDetailGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Booking detail is deleted"
                };
            }

            var dto = new BookingDetailDTO
            {
                Id = detail.Id.ToString(),
                BookingId = detail.BookingId.ToString(),
                SeatId = detail.SeatId.HasValue ? detail.SeatId.Value.ToString() : null,
                TicketId = detail.TicketId.HasValue ? detail.TicketId.Value.ToString() : null,
                Quantity = detail.Quantity,
                PricePerTicket = detail.PricePerTicket,
                TotalPrice = detail.TotalPrice,
                CreatedAt = detail.CreatedAt,
                UpdatedAt = detail.UpdatedAt,
                IsDeleted = detail.IsDeleted,
                DeletedAt = detail.DeletedAt
            };

            var shapedData = DataShaper.ShapeData(dto, request.Fields);
            return new BookingDetailGetByIdResponse
            {
                IsSuccess = true,
                Message = "Retrieve Booking Detail Successfully",
                Data = shapedData
            };
        }
    }
}
