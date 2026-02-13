using Grpc.Core;
using MediatR;
using SharedContracts.Protos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using TicketService.Application.CQRS.Command.Ticket;
using TicketService.Application.DTOs.Response.Ticket;
using TicketService.Application.DTOs.Response.TicketType;
using TicketService.Application.Interfaces.Repositories;

namespace TicketService.Application.CQRS.Handler.Ticket
{
    public class TicketCreateCommandHandler : IRequestHandler<TicketCreateCommand, TicketCreateResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        private readonly EventGrpc.EventGrpcClient _eventGrpcClient;
        public TicketCreateCommandHandler(ITicketUnitOfWork unitOfWork, EventGrpc.EventGrpcClient eventGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _eventGrpcClient = eventGrpcClient;
        }
        public async Task<TicketCreateResponse> Handle(TicketCreateCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var ticketType = await _unitOfWork.TicketTypes.GetByIdAsync(request.TicketTypeId);
                if(ticketType == null)
                {
                    return new TicketCreateResponse
                    {
                        IsSuccess = false,
                        Message = "Ticket Type is not found"
                    };
                }
                if(ticketType.IsDeleted)
                {
                    return new TicketCreateResponse
                    {
                        IsSuccess = false,
                        Message = "Ticket Type is deleted"
                    };
                }

                var eventRequest = new EventRequest { EventId = request.EventId.ToString() };
                var eventResponse = _eventGrpcClient.GetEventDetail(eventRequest);

                if (eventResponse == null)
                {
                    return new TicketCreateResponse
                    {
                        IsSuccess = false,
                        Message = "Event is not found"
                    };
                }
                Console.WriteLine($"Event Response: {eventResponse.Name}");
                var ticket = new TicketService.Domain.Entities.Ticket
                {
                    Id = Guid.NewGuid(),
                    EventId = request.EventId,
                    TicketTypeId = request.TicketTypeId,
                    Zone = request.Zone,
                    Status = request.Status,
                    CreatedAt = DateTime.UtcNow,
                };

                await _unitOfWork.BeginTransactionAsync();
                await _unitOfWork.Tickets.AddAsync(ticket);
                await _unitOfWork.CommitTransactionAsync();
                return new TicketCreateResponse
                {
                    IsSuccess = true,
                    Message = "Create Ticket Type Successfully",
                    Data = new TicketDTO
                    {
                        Id = ticket.Id.ToString(),
                        TicketType = new TicketTicketTypeDTO
                        {
                            Id = ticketType.Id.ToString(),
                            Name = ticketType.Name,
                            Description = ticketType.Description,
                            Price = ticketType.Price,
                            TotalQuantity = ticketType.TotalQuantity,
                            AvailableQuantity = ticketType.AvailableQuantity,
                        },
                        Event = new TicketEventDTO
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
                        },
                        Zone = ticket.Zone,
                        Status = ticket.Status,
                        CreatedAt = ticket.CreatedAt,
                    }
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new TicketCreateResponse
                {
                    IsSuccess = false,
                    Message = $"Event with ID {request.EventId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new TicketCreateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
