using BookingService.Application.DTOs.Response.Booking;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookingService.Application.CQRS.Query.Booking
{
    public class BookingGetAllQuery : IRequest<GetAllBookingResponse>
    {
    }
}
