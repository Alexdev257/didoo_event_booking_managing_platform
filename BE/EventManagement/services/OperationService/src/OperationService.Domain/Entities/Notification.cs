using SharedKernel.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Domain.Entities
{
    public class Notification : AuditableEntity
    {
        public Guid UserId { get; set; }
        public Guid? EventId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public bool? IsRead { get; set; }
    }
}
