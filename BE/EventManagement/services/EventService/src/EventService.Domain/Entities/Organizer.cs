using EventService.Domain.Enum;
using SharedKernel.Domain;

namespace EventService.Domain.Entities
{
    public class Organizer : AuditableEntity
    {
        public string? Name { get; set; } = string.Empty;
        public string? Slug { get; set; } = string.Empty;
        public string? Description { get; set; } = string.Empty;
        public string? LogoUrl { get; set; } = string.Empty;
        public string? BannerUrl { get; set; } = string.Empty;
        public string? Email { get; set; } = string.Empty;
        public string? Phone { get; set; } = string.Empty;
        public string? WebsiteUrl { get; set; } = string.Empty;
        public string? FacebookUrl { get; set; } = string.Empty;
        public string? InstagramUrl { get; set; } = string.Empty;
        public string? TiktokUrl { get; set; } = string.Empty;
        public string? Address { get; set; } = string.Empty;
        public bool? IsVerified { get; set; } = false!;
        public OrganizerStatusEnum Status { get; set; } = OrganizerStatusEnum.Pending;
        public virtual ICollection<Event> Events { get; set; }

    }
}