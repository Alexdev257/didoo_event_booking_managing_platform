using BookingService.Application.CQRS.Query.BookingDetail;
using BookingService.Application.DTOs.Response.BookingDetail;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using SharedInfrastructure.Extensions;

namespace BookingService.Application.CQRS.Handler.BookingDetail
{
    public class BookingDetailGetListQueryHandler : IRequestHandler<BookingDetailGetListQuery, BookingDetailGetListResponse>
    {
        private readonly IManageUnitOfWork _unitOfWork;
        public BookingDetailGetListQueryHandler(IManageUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<BookingDetailGetListResponse> Handle(BookingDetailGetListQuery request, CancellationToken cancellationToken)
        {
            var details = _unitOfWork.BookingDetails.GetAllAsync().AsQueryable();

            if (request.IsDeleted.HasValue)
            {
                details = request.IsDeleted.Value
                    ? details.Where(x => x.IsDeleted)
                    : details.Where(x => !x.IsDeleted);
            }

            if (request.BookingId.HasValue && request.BookingId.Value != Guid.Empty)
                details = details.Where(x => x.BookingId == request.BookingId.Value);

            if (request.TicketId.HasValue && request.TicketId.Value != Guid.Empty)
                details = details.Where(x => x.TicketId == request.TicketId.Value);

            if (request.SeatId.HasValue && request.SeatId.Value != Guid.Empty)
                details = details.Where(x => x.SeatId == request.SeatId.Value);

            details = (request.IsDescending.HasValue && request.IsDescending.Value)
                ? details.OrderByDescending(x => x.CreatedAt)
                : details.OrderBy(x => x.CreatedAt);

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                details,
                request.PageNumber,
                request.PageSize,
                d => new BookingDetailDTO
                {
                    Id = d.Id.ToString(),
                    BookingId = d.BookingId.ToString(),
                    SeatId = d.SeatId.HasValue ? d.SeatId.Value.ToString() : null,
                    TicketId = d.TicketId.HasValue ? d.TicketId.Value.ToString() : null,
                    Quantity = d.Quantity,
                    PricePerTicket = d.PricePerTicket,
                    TotalPrice = d.TotalPrice,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt,
                    IsDeleted = d.IsDeleted,
                    DeletedAt = d.DeletedAt
                },
                request.Fields);

            return new BookingDetailGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve Booking Details Successfully",
                Data = pagedList
            };
        }
    }
}
