using BookingService.Domain.Enum;
using SharedKernel.Domain;

namespace BookingService.Domain.Entities
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
