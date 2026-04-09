using EventService.Application.DTOs.Response.Organizer;
using MediatR;
using SharedContracts.Common.Wrappers;
using SharedContracts.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Command.Organizer
{
    public class OrganizerRestoreCommand : IRequest<OrganizerRestoreResponse>, IValidatable<OrganizerRestoreResponse>
    {
        public Guid Id { get; set; }

        public Task<OrganizerRestoreResponse> ValidateAsync()
        {
            var response = new OrganizerRestoreResponse();
            if (string.IsNullOrEmpty(Id.ToString()))
            {
                response.ListErrors.Add(new Errors
                {
                    Field = "Id",
                    Detail = "Id is not null or empty"
                });
            }
            if (!Guid.TryParse(Id.ToString(), out var _))
            {
                response.ListErrors.Add(new Errors
                {
                    Field = "Id",
                    Detail = "Id is not format GUID"
                });
            }
            if (response.ListErrors.Count > 0) response.IsSuccess = false;
            return Task.FromResult(response);
        }
    }
}
