using BookingService.Domain.Enum;
using SharedKernel.Domain;

namespace BookingService.Domain.Entities
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
