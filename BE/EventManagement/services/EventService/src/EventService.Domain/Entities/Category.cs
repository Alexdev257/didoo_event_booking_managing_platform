using EventService.Domain.Enum;
using SharedKernel.Domain;

namespace EventService.Domain.Entities
{
    public class Category : AuditableEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Slug { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public string? IconUrl { get; set; } = string.Empty;
        public StatusEnum? Status { get; set; } = StatusEnum.Active;
        public Guid? ParentCategoryId { get; set; }
        public virtual Category? ParentCategory { get; set; }
        public virtual ICollection<Category> SubCategories { get; set; }
        public virtual ICollection<Event> Events { get; set; }
    }
}