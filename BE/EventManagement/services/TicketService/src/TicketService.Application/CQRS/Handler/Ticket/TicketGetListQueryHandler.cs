using Grpc.Core;
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
        private readonly EventGrpc.EventGrpcClient _eventGrpcClient;

        public TicketGetListQueryHandler(ITicketUnitOfWork unitOfWork, EventGrpc.EventGrpcClient eventGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _eventGrpcClient = eventGrpcClient;
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
                    tickets = tickets.Where(x => !x.IsDeleted);
                }
            }
            if (request.OwnerId != null && request.OwnerId != Guid.Empty)
            {
                tickets = tickets.Where(x => x.OwnerId == request.OwnerId);
            }
            if (request.TicketTypeId != null && request.TicketTypeId != Guid.Empty)
            {
                tickets = tickets.Where(x => x.TicketTypeId == request.TicketTypeId);
            }
            if (request.EventId != null && request.EventId != Guid.Empty)
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

            var hasEvent = request.HasEvent.HasValue && request.HasEvent.Value == true;

            if (hasEvent)
            {
                var pagedTickets = await tickets.ToPagedEntityListAsync(request.PageNumber, request.PageSize, cancellationToken);
                var eventIds = pagedTickets.Items.Select(t => t.EventId).Distinct().ToList();
                var eventDict = new Dictionary<Guid, EventResponse>();

                var eventTasks = eventIds.Select(async eventId =>
                {
                    try
                    {
                        var eventRequest = new EventRequest { EventId = eventId.ToString() };
                        var response = await _eventGrpcClient.GetEventDetailAsync(eventRequest, cancellationToken: cancellationToken);
                        return (eventId, response);
                    }
                    catch (RpcException)
                    {
                        return (eventId, (EventResponse)null!);
                    }
                });

                var eventResults = await Task.WhenAll(eventTasks);
                foreach (var (eventId, response) in eventResults)
                {
                    if (response != null)
                    {
                        eventDict[eventId] = response;
                    }
                }

                var dtoItems = pagedTickets.Items.Select(ticket =>
                {
                    var eventResponse = eventDict.TryGetValue(ticket.EventId, out var ev) ? ev : null;
                    return new TicketDTO
                    {
                        Id = ticket.Id.ToString(),
                        TicketType = (ticket.TicketType != null && (request.HasType.HasValue && request.HasType.Value == true))
                            ? new TicketTicketTypeDTO
                            {
                                Id = ticket.TicketType.Id.ToString(),
                                Name = ticket.TicketType.Name,
                                AvailableQuantity = ticket.TicketType.AvailableQuantity,
                                Description = ticket.TicketType.Description,
                                Price = ticket.TicketType.Price,
                                TotalQuantity = ticket.TicketType.TotalQuantity,
                            }
                            : null,
                        Event = MapEventToDto(eventResponse),
                        Zone = ticket.Zone,
                        Status = ticket.Status,
                        CreatedAt = ticket.CreatedAt,
                    };
                });

                var shapedItems = dtoItems.Select(x => DataShaper.ShapeData(x, request.Fields)).ToList();
                var pagedList = new SharedContracts.Common.Wrappers.PaginationResponse<object>
                {
                    Items = shapedItems,
                    TotalItems = pagedTickets.TotalItems,
                    PageNumber = pagedTickets.PageNumber,
                    PageSize = pagedTickets.PageSize
                };

                return new TicketGetListResponse
                {
                    IsSuccess = true,
                    Message = "Retrieve Tickets Successfully",
                    Data = pagedList
                };
            }

            var pagedListDefault = await QueryableExtensions.ToPagedListAsync(
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
                    Event = null,
                    Zone = ticket.Zone,
                    Status = ticket.Status,
                    CreatedAt = ticket.CreatedAt,
                },
                request.Fields);

            return new TicketGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve Tickets Successfully",
                Data = pagedListDefault
            };
        }

        private static TicketEventDTO? MapEventToDto(EventResponse? eventResponse)
        {
            if (eventResponse == null) return null;

            //var thumbnailUrl = eventResponse.ThumbnailUrl ?? string.Empty;
            //var bannerUrl = !string.IsNullOrEmpty(eventResponse.BannerUrl) ? eventResponse.BannerUrl : thumbnailUrl;

            return new TicketEventDTO
            {
                Id = eventResponse.Id,
                Name = eventResponse.Name,
                Description = eventResponse.Description,
                Slug = eventResponse.Slug,
                AgeRestriction = eventResponse.AgeRestriction,
                BannerUrl = eventResponse.BannerUrl,
                ThumbnailUrl = eventResponse.ThumbnailUrl,
                Tags = !string.IsNullOrEmpty(eventResponse.Tags) ? JsonSerializer.Deserialize<List<TagRequest>>(eventResponse.Tags) : new List<TagRequest>(),
                StartTime = eventResponse.StartTime?.ToDateTime(),
                EndTime = eventResponse.EndTime?.ToDateTime(),
                OpenTime = !string.IsNullOrEmpty(eventResponse.OpenTime) ? TimeOnly.Parse(eventResponse.OpenTime) : null,
                ClosedTime = !string.IsNullOrEmpty(eventResponse.ClosedTime) ? TimeOnly.Parse(eventResponse.ClosedTime) : null,
                Status = (int)eventResponse.Status
            };
        }
    }
}
