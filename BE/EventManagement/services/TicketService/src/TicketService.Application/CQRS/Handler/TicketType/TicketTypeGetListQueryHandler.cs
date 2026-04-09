using MediatR;
using SharedContracts.Protos;
using SharedInfrastructure.Extensions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TicketService.Application.CQRS.Query.TicketType;
using TicketService.Application.DTOs.Response.TicketType;
using TicketService.Application.Interfaces.Repositories;
using TicketService.Domain.Entities;

namespace TicketService.Application.CQRS.Handler.TicketType
{
    public class TicketTypeGetListQueryHandler : IRequestHandler<TicketTypeGetListQuery, TicketTypeGetListResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        private readonly EventGrpc.EventGrpcClient _eventGrpcClient;
        public TicketTypeGetListQueryHandler(ITicketUnitOfWork unitOfWork, EventGrpc.EventGrpcClient eventGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _eventGrpcClient = eventGrpcClient;
        }
        public async Task<TicketTypeGetListResponse> Handle(TicketTypeGetListQuery request, CancellationToken cancellationToken)
        {
            var ticketTypes = _unitOfWork.TicketTypes.GetAllAsync();
            if (request.IsDeleted.HasValue)
            {
                if (request.IsDeleted.Value == true)
                {
                    ticketTypes = ticketTypes.Where(x => x.IsDeleted);
                }
                else if (request.IsDeleted.Value == false)
                {
                    {
                        ticketTypes = ticketTypes.Where(x => !x.IsDeleted);
                    }
                }
            }
            if (request.EventId != null & request.EventId != Guid.Empty)
            {
                ticketTypes = ticketTypes.Where(x => x.EventId == request.EventId);
            }
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                ticketTypes = ticketTypes.Where(x => x.Name.ToLower().Contains(request.Name.ToLower()));
            }
            if (request.FromPrice.HasValue)
            {
                ticketTypes = ticketTypes.Where(x => x.Price >= request.FromPrice.Value);
            }
            if (request.ToPrice.HasValue)
            {
                ticketTypes = ticketTypes.Where(x => x.Price <= request.ToPrice.Value);
            }
            if (!string.IsNullOrWhiteSpace(request.Description))
            {
                ticketTypes = ticketTypes.Where(x => x.Description.ToLower().Contains(request.Description.ToLower()));
            }
            if (request.IsDescending.HasValue && request.IsDescending == true)
            {
                ticketTypes = ticketTypes.OrderByDescending(x => x.CreatedAt); 
            }
            else
            {
                ticketTypes = ticketTypes.OrderBy(x => x.CreatedAt);
            }

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                                            ticketTypes,
                                            request.PageNumber,
                                            request.PageSize,
                                            ticketType => new TicketTypeDTO
                                            {
                                                Id = ticketType.Id.ToString(),
                                                Name = ticketType.Name,
                                                Price = ticketType.Price,
                                                TotalQuantity = ticketType.TotalQuantity,
                                                AvailableQuantity = ticketType.AvailableQuantity,
                                                Description = ticketType.Description,
                                                MaxTicketsPerUser = ticketType.MaxTicketsPerUser,
                                                CreatedAt = ticketType.CreatedAt,
                                                Event = new TicketTypeEventDTO
                                                {
                                                    Id = ticketType.EventId.ToString(),
                                                }
                                            },
                                            request.Fields);
            return new TicketTypeGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve Ticket Types Successfully",
                Data = pagedList
            };
        }
    }
}
