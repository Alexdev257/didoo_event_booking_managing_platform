using EventService.Application.DTOs.Response.FavoriteEvent;
using MediatR;
using SharedContracts.Common.Wrappers.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Query.FavoriteEvent
{
    public class FavoriteGetListQuery :PaginationRequest, IRequest<FavoriteGetListResponse>
    {
        public Guid? UserId { get; set; }
        public Guid? EventId { get; set; }
        public string? Fields { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
