using BookingService.Application.DTOs.Response.PaymentMethod;
using BookingService.Domain.Enum;
using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Text.Json.Serialization;

namespace BookingService.Application.CQRS.Query.PaymentMethod
{
    public class PaymentMethodGetByIdQuery : IRequest<PaymentMethodGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
    }
}
