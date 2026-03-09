using Grpc.Core;
using MediatR;
using SharedContracts.Protos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TicketService.Application.CQRS.Command.TicketType;
using TicketService.Application.DTOs.Response.TicketType;
using TicketService.Application.Interfaces.Repositories;
using TicketService.Domain.Entities;
using static SharedContracts.Protos.EventGrpc;

namespace TicketService.Application.CQRS.Handler.TicketType
{
    public class TicketTypeCreateArrayCommandHandler : IRequestHandler<TicketTypeCreateArrayCommand, TicketTypeCreateArrayResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        private readonly EventGrpc.EventGrpcClient _eventGrpcClient;
        public TicketTypeCreateArrayCommandHandler(ITicketUnitOfWork unitOfWork, EventGrpc.EventGrpcClient eventGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _eventGrpcClient = eventGrpcClient;
        }
        public async Task<TicketTypeCreateArrayResponse> Handle(TicketTypeCreateArrayCommand request, CancellationToken cancellationToken)
        {
            List<TicketTypeDTO> createdTicketTypes = new List<TicketTypeDTO>();
            foreach (var item in request.TicketTypes)
            {
                try
                {
                    var eventRequest = new EventRequest { EventId = item.EventId.ToString() };
                    var eventResponse = _eventGrpcClient.GetEventDetail(eventRequest);

                    if (eventResponse == null)
                    {
                        return new TicketTypeCreateArrayResponse
                        {
                            IsSuccess = false,
                            Message = "Event is not found"
                        };
                    }
                    Console.WriteLine($"Event Response: {eventResponse.Name}");
                    var ticketType = new TicketService.Domain.Entities.TicketType
                    {
                        Id = Guid.NewGuid(),
                        EventId = item.EventId,
                        Name = item.Name,
                        Price = item.Price,
                        TotalQuantity = item.TotalQuantity,
                        AvailableQuantity = item.AvailableQuantity,
                        Description = item.Description,
                        CreatedAt = DateTime.UtcNow,
                    };

                    await _unitOfWork.BeginTransactionAsync();
                    await _unitOfWork.TicketTypes.AddAsync(ticketType);
                    await _unitOfWork.CommitTransactionAsync();
                    createdTicketTypes.Add(new TicketTypeDTO
                    {
                        Id = ticketType.Id.ToString(),
                        Name = ticketType.Name,
                        Price = ticketType.Price,
                        TotalQuantity = ticketType.TotalQuantity,
                        AvailableQuantity = ticketType.AvailableQuantity,
                        Description = ticketType.Description,
                        CreatedAt = ticketType.CreatedAt,
                        Event = new TicketTypeEventDTO
                        {
                            Id = eventResponse.Id.ToString(),
                            Name = eventResponse.Name,
                            Description = eventResponse.Description,
                            Slug = eventResponse.Slug,
                            AgeRestriction = eventResponse.AgeRestriction,
                            BannerUrl = eventResponse.BannerUrl,
                            ThumbnailUrl = eventResponse.ThumbnailUrl,
                            Tags = eventResponse.Tags != null ? JsonSerializer.Deserialize<List<TagRequest>>(eventResponse.Tags) : new List<TagRequest>(),
                            StartTime = eventResponse.StartTime != null ? eventResponse.StartTime?.ToDateTime() : null,
                            EndTime = eventResponse.EndTime != null ? eventResponse.EndTime?.ToDateTime() : null,
                            OpenTime = !string.IsNullOrEmpty(eventResponse.OpenTime)
                                                    ? TimeOnly.Parse(eventResponse.OpenTime)
                                                    : null,
                            ClosedTime = !string.IsNullOrEmpty(eventResponse.ClosedTime)
                                                    ? TimeOnly.Parse(eventResponse.ClosedTime)
                                                    : null,
                            Status = (int)eventResponse.Status
                        }
                    });
                    
                }
                catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return new TicketTypeCreateArrayResponse
                    {
                        IsSuccess = false,
                        Message = $"Event with ID {item.EventId} does not exist.",
                    };
                }
                catch (Exception ex)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return new TicketTypeCreateArrayResponse
                    {
                        IsSuccess = false,
                        Message = ex.Message,
                    };
                }
            }

            return new TicketTypeCreateArrayResponse
            {
                IsSuccess = true,
                Message = "Create Ticket Type Successfully",
                Data = createdTicketTypes
            };
        }
    }
}
