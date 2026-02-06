using AuthService.Application.DTOs.Response.Role;
using AuthService.Domain.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.DTOs.Response.User
{
    public class UserDTO
    {
        public string Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string? Phone { get; set; }
        public bool IsVerified { get; set; } = false!;
        public string? AvatarUrl { get; set; }
        public int? Gender { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public StatusEnum Status { get; set; }
        public RoleDTO Role { get; set; }
        public Guid? OrganizerId { get; set; }
        public List<LocationUserDTO> Locations { get; set; } = new List<LocationUserDTO>();

    }
}
