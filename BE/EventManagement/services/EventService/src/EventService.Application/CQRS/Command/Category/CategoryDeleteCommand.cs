using EventService.Application.DTOs.Response.Category;
using MediatR;
using SharedContracts.Common.Wrappers;
using SharedContracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Command.Category
{
    public class CategoryDeleteCommand : IRequest<CategoryDeleteResponse>, IValidatable<CategoryDeleteResponse>
    {
        public Guid Id { get; set; }

        public Task<CategoryDeleteResponse> ValidateAsync()
        {
            var response = new CategoryDeleteResponse();
            if (string.IsNullOrEmpty(Id.ToString()))
            {
                response.ListErrors.Add(new Errors
                {
                    Field = "Id",
                    Detail = "Id is not null or empty"
                });
            }
            if (response.ListErrors.Count > 0) response.IsSuccess = false;
            return Task.FromResult(response);
        }
    }
}
