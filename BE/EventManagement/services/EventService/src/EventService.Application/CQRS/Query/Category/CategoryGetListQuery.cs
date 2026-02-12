using EventService.Application.DTOs.Response.Category;
using EventService.Domain.Enum;
using MediatR;
using SharedContracts.Common.Wrappers.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Query.Category
{
    public class CategoryGetListQuery : PaginationRequest, IRequest<CategoryGetListResponse>
    {
        public string? Name { get; set; }
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public string? IconUrl { get; set; }
        public StatusEnum? Status { get; set; } = StatusEnum.Active;
        public Guid? ParentCategoryId { get; set; }
        public string? Fields { get; set; }
        public bool? HasParent { get; set; } = false!;
        public bool? HasSub { get; set; } = false!;
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
