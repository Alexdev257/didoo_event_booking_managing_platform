using BookingService.Application.DTOs.Response.ResaleTransaction;
using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.Text.Json.Serialization;

namespace BookingService.Application.CQRS.Query.ResaleTransaction
{
    public class ResaleTransactionGetByIdQuery : IRequest<ResaleTransactionGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
    }
}
