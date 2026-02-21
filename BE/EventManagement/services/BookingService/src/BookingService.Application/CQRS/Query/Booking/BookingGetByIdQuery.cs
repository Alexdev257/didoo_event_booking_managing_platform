using BookingService.Application.DTOs.Response.Booking;
using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Text.Json.Serialization;

namespace BookingService.Application.CQRS.Query.Booking
{
    public class BookingGetByIdQuery : IRequest<BookingGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
    }
}
