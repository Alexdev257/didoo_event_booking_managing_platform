using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.DTOs.Response.Notification
{
    public class NotificationEventDTO
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? ThumbnailUrl { get; set; }
    }

}
