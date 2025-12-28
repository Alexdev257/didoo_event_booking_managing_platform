using SharedContracts.Common.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.DTOs.Response
{
    public class GetAllNotificationResponse : CommonResponse<List<NotificationDTO>> { }

    public class NotificationDTO
    {
        public string Id { get; set; }
        public string UserId { get; set; }
        public string? EventId { get; set; }
        public string? Title { get; set; }
        public string? Message { get; set; }
        public bool IsRead { get; set; }
    }
}
