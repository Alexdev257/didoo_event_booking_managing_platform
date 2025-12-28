using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TicketService.Domain.Enum
{
    public enum SeatStatusEnum
    {
        Available = 1,
        Reserved = 2,
        Sold = 3,
        Unavailable = 4,
    }
}
