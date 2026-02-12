using EventService.Domain.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.DTOs.Response.EventUserInteraction
{
    public class InteractionDTO
    {
        public string Id { get; set; }
        public InteractionTypeEnum Type { get; set; }
        public InteractionEventDTO Event { get; set; }
        public InteractionUserDTO User { get; set; }
    }
}
