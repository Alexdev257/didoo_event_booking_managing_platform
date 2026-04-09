using ResaleService.Domain.Enum;
using SharedKernel.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ResaleService.Domain.Entities
{
    public class Resale : AuditableEntity
    {
        public Guid SalerUserId { get; set; }
        public Guid BookingDetailId { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public ResaleStatusEnum? Status { get; set; } = ResaleStatusEnum.Unavailable;
        public ICollection<ResaleTransaction> Transactions { get; set; } = new List<ResaleTransaction>();
    }
}
