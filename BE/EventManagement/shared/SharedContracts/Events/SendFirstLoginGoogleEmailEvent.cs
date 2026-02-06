using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedContracts.Events
{
    public record SendFirstLoginGoogleEmailEvent(string ToEmail, string BasePassword, string Fullname, DateTime LoginAt) : IntegrationEvent;
}
