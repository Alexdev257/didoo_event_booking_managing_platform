using BookingService.Domain.Enum;
using SharedKernel.Domain;

namespace BookingService.Domain.Entities
{
    public class Payment : AuditableEntity
    {
        public Guid UserId { get; set; }
        public Guid? BookingId { get; set; }
        public Guid? ResaleTransactionId { get; set; }
        public Guid? PaymentMethodId { get; set; }
        public decimal Cost { get; set; }
        public string Currency { get; set; } = "VND";
        public string? TransactionCode { get; set; }
        public string? ProviderResponse { get; set; }
        public DateTime PaidAt { get; set; }
        public virtual PaymentMethod? PaymentMethod { get; set; }
    }
}
