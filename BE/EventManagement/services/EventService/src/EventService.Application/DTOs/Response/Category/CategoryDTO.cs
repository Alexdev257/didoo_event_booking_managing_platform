using EventService.Domain.Enum;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.DTOs.Response.Category
{
    public class CategoryDTO
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public string? IconUrl { get; set; }
        public StatusEnum? Status { get; set; }
        public CategoryDTO? ParentCategory { get; set; }
        public List<CategoryDTO>? SubCategories { get; set; } = new List<CategoryDTO>();
        //public virtual Category? ParentCategory { get; set; }
        //public virtual ICollection<Category> SubCategories { get; set; }
        //public virtual ICollection<Event> Events { get; set; }
    }
}
