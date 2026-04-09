using ResaleService.Domain.Enum;
using SharedKernel.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ResaleService.Domain.Entities
{
    public class ResaleTransaction : AuditableEntity
    {
        public Guid ResaleId { get; set; }
        public Guid BuyerUserId { get; set; }
        public decimal Cost { get; set; }
        public decimal FeeCost { get; set; }
        public ResaleTransactionStatusEnum Status { get; set; } = ResaleTransactionStatusEnum.Pending;
        public DateTime TransactionDate { get; set; }
        public Resale Resale { get; set; } = default!;
    }
}
