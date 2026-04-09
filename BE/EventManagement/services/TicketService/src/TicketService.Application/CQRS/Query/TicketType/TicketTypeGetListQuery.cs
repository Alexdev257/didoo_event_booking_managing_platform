using MediatR;
using SharedContracts.Common.Wrappers.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Application.DTOs.Response.TicketType;

namespace TicketService.Application.CQRS.Query.TicketType
{
    public class TicketTypeGetListQuery : PaginationRequest, IRequest<TicketTypeGetListResponse>
    {
        public Guid? EventId { get; set; }
        public string? Name { get; set; }
        public decimal? FromPrice { get; set; }
        public decimal? ToPrice { get; set; }
        public string? Description { get; set; }
        public string? Fields { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
