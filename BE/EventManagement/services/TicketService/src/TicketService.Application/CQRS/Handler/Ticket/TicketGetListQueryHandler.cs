using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Protos;
using SharedInfrastructure.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TicketService.Application.CQRS.Query.Ticket;
using TicketService.Application.DTOs.Response.Ticket;
using TicketService.Application.DTOs.Response.TicketType;
using TicketService.Application.Interfaces.Repositories;
using TicketService.Domain.Entities;

namespace TicketService.Application.CQRS.Handler.Ticket
{
    public class TicketGetListQueryHandler : IRequestHandler<TicketGetListQuery, TicketGetListResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        public TicketGetListQueryHandler(ITicketUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<TicketGetListResponse> Handle(TicketGetListQuery request, CancellationToken cancellationToken)
        {
            var tickets = _unitOfWork.Tickets.GetAllAsync().Include(x => x.TicketType).AsQueryable();
            if (request.IsDeleted.HasValue)
            {
                if (request.IsDeleted.Value == true)
                {
                    tickets = tickets.Where(x => x.IsDeleted);
                }
                else if (request.IsDeleted.Value == false)
                {
                    {
                        tickets = tickets.Where(x => !x.IsDeleted);
                    }
                }
            }
            if(request.OwnerId != null && request.OwnerId != Guid.Empty)
            {
                tickets = tickets.Where(x => x.OwnerId == request.OwnerId);
            }
            if(request.TicketTypeId != null && request.TicketTypeId != Guid.Empty)
            {
                tickets = tickets.Where(x => x.TicketTypeId == request.TicketTypeId);
            }
            if(request.EventId != null && request.EventId != Guid.Empty)
            {
                tickets = tickets.Where(x => x.EventId == request.EventId);
            }
            if (!string.IsNullOrWhiteSpace(request.Zone))
            {
                tickets = tickets.Where(x => x.Zone.ToLower().Contains(request.Zone.ToLower()));
            }
            if (request.IsDescending.HasValue && request.IsDescending == true)
            {
                tickets = tickets.OrderByDescending(x => x.CreatedAt);
            }
            else
            {
                tickets = tickets.OrderBy(x => x.CreatedAt);
            }

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                                            tickets,
                                            request.PageNumber,
                                            request.PageSize,
                                            ticket => new TicketDTO
                                            {
                                                Id = ticket.Id.ToString(),
                                                TicketType = (ticket.TicketType != null && (request.HasType.HasValue && request.HasType.Value == true)) ? new TicketTicketTypeDTO
                                                {
                                                    Id = ticket.TicketType.Id.ToString(),
                                                    Name = ticket.TicketType.Name,
                                                    AvailableQuantity = ticket.TicketType.AvailableQuantity,
                                                    Description = ticket.TicketType.Description,
                                                    Price = ticket.TicketType.Price,
                                                    TotalQuantity = ticket.TicketType.TotalQuantity,
                                                } : null,
                                                Event = (request.HasEvent.HasValue && request.HasEvent.Value == true) ? new TicketEventDTO
                                                {
                                                    Id = ticket.EventId.ToString(),
                                                } : null,
                                                Zone = ticket.Zone,
                                                Status = ticket.Status,
                                                CreatedAt = ticket.CreatedAt,
                                            },
                                            request.Fields);
            return new TicketGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve Tickets Successfully",
                Data = pagedList
            };
        }
    }
}
