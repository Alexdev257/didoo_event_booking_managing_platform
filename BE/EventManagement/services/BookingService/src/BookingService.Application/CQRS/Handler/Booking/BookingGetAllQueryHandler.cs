using BookingService.Application.CQRS.Query.Booking;
using BookingService.Application.DTOs.Response.Booking;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookingService.Application.CQRS.Handler.Booking
{
    public class BookingGetAllQueryHandler : IRequestHandler<BookingGetAllQuery, GetAllBookingResponse>
    {
        private readonly IBookingUnitOfWork _unitOfWork;
        public BookingGetAllQueryHandler(IBookingUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<GetAllBookingResponse> Handle(BookingGetAllQuery request, CancellationToken cancellationToken)
        {
            var result = _unitOfWork.Bookings.GetAllAsync();
            var dto = await result.Select(d => new BookingDTO
            {
                Id = d.Id.ToString(),
                UserId = d.UserId.ToString(),
                EventId = d.EventId.ToString(),
                Fullname = d.Fullname,
                Email = d.Email,
                Phone = d.Phone,
                Amount = d.Amount,
                TotalPrice = d.TotalPrice,
                Status = d.Status.ToString(),
                PaidAt = d.PaidAt,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
                IsDeleted = d.IsDeleted,
                DeletedAt = d.DeletedAt,
            }).ToListAsync();

            return new GetAllBookingResponse
            {
                IsSuccess = true,
                Message = "Retrieve booking successfully",
                Data = dto
            };
        }
    }
}
