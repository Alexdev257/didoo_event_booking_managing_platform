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
    public class TicketTypeRestoreCommandHandler : IRequestHandler<TicketTypeRestoreCommand, TicketTypeRestoreResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        private readonly EventGrpc.EventGrpcClient _eventGrpcClient;
        public TicketTypeRestoreCommandHandler(ITicketUnitOfWork unitOfWork, EventGrpc.EventGrpcClient eventGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _eventGrpcClient = eventGrpcClient;
        }
        public async Task<TicketTypeRestoreResponse> Handle(TicketTypeRestoreCommand request, CancellationToken cancellationToken)
        {
            var ticketType = await _unitOfWork.TicketTypes.GetByIdAsync(request.Id);
            if (ticketType == null)
            {
                return new TicketTypeRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Ticket Type is not found"
                };
            }
            if (!ticketType.IsDeleted)
            {
                return new TicketTypeRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Ticket Type is not deleted"
                };
            }
            try
            {
                var eventRequest = new EventRequest { EventId = ticketType.EventId.ToString() };
                var eventResponse = _eventGrpcClient.GetEventDetail(eventRequest);

                if (eventResponse == null)
                {
                    return new TicketTypeRestoreResponse
                    {
                        IsSuccess = false,
                        Message = "Event is not found"
                    };
                }
                Console.WriteLine($"Event Response: {eventResponse.Name}");

                await _unitOfWork.BeginTransactionAsync();
                ticketType.IsDeleted = false;
                ticketType.DeletedAt = null;
                await _unitOfWork.CommitTransactionAsync();
                return new TicketTypeRestoreResponse
                {
                    IsSuccess = true,
                    Message = "Update Ticket Type Successfully",
                    Data = new TicketTypeDTO
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
                return new TicketTypeRestoreResponse
                {
                    IsSuccess = false,
                    Message = $"Event with ID {ticketType.EventId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new TicketTypeRestoreResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
