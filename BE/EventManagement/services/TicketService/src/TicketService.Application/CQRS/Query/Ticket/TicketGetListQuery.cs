using MediatR;
using Microsoft.AspNetCore.Mvc.RazorPages.Infrastructure;
using SharedContracts.Common.Wrappers.Requests;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Application.DTOs.Response.Ticket;
using TicketService.Domain.Enum;

namespace TicketService.Application.CQRS.Query.Ticket
{
    public class TicketGetListQuery : PaginationRequest, IRequest<TicketGetListResponse>
    {
        public Guid? TicketTypeId { get; set; }
        public Guid? EventId { get; set; }
        public string? Zone { get; set; }
        public TicketStatusEnum? Status { get; set; }
        public string? Fields { get; set; }
        public bool? HasEvent { get; set; } = false!;
        public bool? HasType {  get; set; } = false!;
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
