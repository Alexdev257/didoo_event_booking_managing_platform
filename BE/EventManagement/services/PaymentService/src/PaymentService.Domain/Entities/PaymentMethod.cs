using PaymentService.Domain.Enum;
using SharedKernel.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PaymentService.Domain.Entities
{
    public class PaymentMethod : AuditableEntity
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public PaymentMethodStatusEnum Status { get; set; }

        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
