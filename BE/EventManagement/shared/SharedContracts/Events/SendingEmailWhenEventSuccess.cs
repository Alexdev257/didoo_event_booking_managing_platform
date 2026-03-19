using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedContracts.Events
{
    public record SendingEmailWhenEventSuccess(
        string BuyerEmail,
        string BuyerName,
        string SellerEmail,
        string SellerName,
        string[] TicketIds,
        string EventName,
        bool IsTrade
        ) : IntegrationEvent;
}
