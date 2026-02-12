using EventService.Application.DTOs.Response.Category;
using MediatR;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Query.Category
{
    public class CategoryGetByIdQuery : IRequest<CategoryGetByIdResponse>
    {
        [JsonIgnore]
        [BindNever]
        public Guid Id { get; set; }
        public string? Fields { get; set; }
        public bool? HasParent { get; set; } = false!;
        public bool? HasSub { get; set; } = false!;
    }
}
