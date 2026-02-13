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

namespace TicketService.Application.CQRS.Handler.TicketType
{
    public class TicketTypeCreateCommandHandler : IRequestHandler<TicketTypeCreateCommand, TicketTypeCreateResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        private readonly EventGrpc.EventGrpcClient _eventGrpcClient;
        public TicketTypeCreateCommandHandler(ITicketUnitOfWork unitOfWork, EventGrpc.EventGrpcClient eventGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _eventGrpcClient = eventGrpcClient;
        }
        public async Task<TicketTypeCreateResponse> Handle(TicketTypeCreateCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var eventRequest = new EventRequest { EventId = request.EventId.ToString() };
                var eventResponse = _eventGrpcClient.GetEventDetail(eventRequest);

                if (eventResponse == null)
                {
                    return new TicketTypeCreateResponse
                    {
                        IsSuccess = false,
                        Message = "Event is not found"
                    };
                }
                Console.WriteLine($"Event Response: {eventResponse.Name}");
                var ticketType = new TicketService.Domain.Entities.TicketType
                {
                    Id = Guid.NewGuid(),
                    EventId = request.EventId,
                    Name = request.Name,
                    Price = request.Price,
                    TotalQuantity = request.TotalQuantity,
                    AvailableQuantity = request.AvailableQuantity,
                    Description = request.Description,
                    CreatedAt = DateTime.UtcNow,
                };

                await _unitOfWork.BeginTransactionAsync();
                await _unitOfWork.TicketTypes.AddAsync(ticketType);
                await _unitOfWork.CommitTransactionAsync();
                return new TicketTypeCreateResponse
                {
                    IsSuccess = true,
                    Message = "Create Ticket Type Successfully",
                    Data = new TicketTypeDTO
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
                    }
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new TicketTypeCreateResponse
                {
                    IsSuccess = false,
                    Message = $"Event with ID {request.EventId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new TicketTypeCreateResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
