using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedContracts.Events
{
    public record SendEmailOpenOrganizerToAdminEvent(string OwnerName, List<string> ToEmail, string OrganizerName, Guid OrganizerId) : IntegrationEvent;
}
    