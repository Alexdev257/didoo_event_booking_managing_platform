using EventService.Application.DTOs.Response.Category;
using EventService.Domain.Enum;
using MediatR;
using SharedContracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using SharedContracts.Common.Wrappers;
namespace EventService.Application.CQRS.Command.Category
{
    public class CategoryCreateCommand : IRequest<CategoryCreateResponse>, IValidatable<CategoryCreateResponse>
    {
        public string Name { get; set; }
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public string? IconUrl { get; set; }
        public StatusEnum? Status { get; set; } = StatusEnum.Active;
        public string? ParentCategoryId { get; set; }

        public Task<CategoryCreateResponse> ValidateAsync()
        {
            var response = new CategoryCreateResponse();
            if (string.IsNullOrWhiteSpace(Name))
            {
                response.ListErrors.Add(new Errors
                {
                    Field = "Name",
                    Detail = "Name is not null or empty"
                });
            }
            if (!string.IsNullOrWhiteSpace(ParentCategoryId))
            {
                if(!Guid.TryParse(ParentCategoryId, out var _))
                {
                    response.ListErrors.Add(new Errors
                    {
                        Field = "ParentCategoryId",
                        Detail = "ParentCategoryId is not format GUID"
                    });
                }
            }
            if(response.ListErrors.Count > 0) response.IsSuccess = false;
            return Task.FromResult(response);
        }
    }
}
