using EventService.Application.DTOs.Response.EventUserInteraction;
using EventService.Domain.Enum;
using MediatR;
using SharedContracts.Common.Wrappers.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Query.UserEventInteraction
{
    public class InteractionGetListQuery :PaginationRequest, IRequest<InteractionGetListResponse>
    {
        public InteractionTypeEnum? Type { get; set; }
        public Guid? EventId { get; set; }
        public Guid? UserId { get; set; }
        public string? Fields { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
