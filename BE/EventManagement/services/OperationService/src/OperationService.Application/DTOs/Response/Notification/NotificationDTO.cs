using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.DTOs.Response.Notification
{
    public class NotificationDTO
    {
        public string? Id { get; set; }
        public NotificationUserDTO? User { get; set; }
        public NotificationEventDTO? Event { get; set; }
        public string? Title { get; set; }
        public string? Message { get; set; }
        public bool IsRead { get; set; }
    }
}
