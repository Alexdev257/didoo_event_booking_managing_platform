using BookingService.Application.DTOs.Response.BookingDetail;
using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Text.Json.Serialization;

namespace BookingService.Application.CQRS.Query.BookingDetail
{
    public class BookingDetailGetByIdQuery : IRequest<BookingDetailGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
    }
}
