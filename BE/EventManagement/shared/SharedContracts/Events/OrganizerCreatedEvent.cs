using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedContracts.Events
{
    public record OrganizerCreatedEvent(Guid userId, Guid organizerId) : IntegrationEvent;
}
