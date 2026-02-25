using BookingService.Domain.Enum;
using SharedKernel.Domain;

namespace BookingService.Domain.Entities
{
    public class PaymentMethod : AuditableEntity
    {
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public PaymentMethodStatusEnum Status { get; set; }

        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }
}
