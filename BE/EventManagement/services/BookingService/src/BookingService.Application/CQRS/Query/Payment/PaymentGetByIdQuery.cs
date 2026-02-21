using BookingService.Application.DTOs.Response.Payment;
using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Text.Json.Serialization;

namespace BookingService.Application.CQRS.Query.Payment
{
    public class PaymentGetByIdQuery : IRequest<PaymentGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
    }
}
