using MediatR;
using OperationService.Application.DTOs.Response.Notification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.CQRS.Query.Notification
{
    public class NotificationGetListQuery : IRequest<NotificationGetListResponse>
    {
        public Guid? UserId { get; set; }
        public Guid? EventId { get; set; }
        public string? Title { get; set; }
        public string? Message { get; set; }
        public bool? IsRead { get; set; }
        public string? Fields { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
        public bool? HasUser { get; set; } = false!;
        public bool? HasEvent { get; set; } = false!;
    }
}
