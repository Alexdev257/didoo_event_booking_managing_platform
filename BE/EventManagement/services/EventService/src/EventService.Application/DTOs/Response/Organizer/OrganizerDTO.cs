using EventService.Domain.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.DTOs.Response.Organizer
{
    public class OrganizerDTO
    {
        public string Id { get; set; }
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
        public bool? IsVerified { get; set; }
        public OrganizerStatusEnum Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<OrganizerEventDTO>? Events { get; set; }
    }
}
