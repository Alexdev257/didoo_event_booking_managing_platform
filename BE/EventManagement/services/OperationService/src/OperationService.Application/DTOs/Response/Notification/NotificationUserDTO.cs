using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.DTOs.Response.Notification
{
    public class NotificationUserDTO
    {
        public string? Id { get; set; }
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public int? Gender { get; set; }
    }
}
