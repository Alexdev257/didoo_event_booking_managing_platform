using MediatR;
using System.Text.Json.Serialization;
using TicketService.Application.DTOs.Response.TicketType;

namespace TicketService.Application.CQRS.Command.TicketType
{
    public class TicketTypeIncrementCommand : IRequest<TicketTypeDecrementResponse>
    {
        [JsonIgnore]
        public Guid Id { get; set; }
        public int Quantity { get; set; }
    }
}
