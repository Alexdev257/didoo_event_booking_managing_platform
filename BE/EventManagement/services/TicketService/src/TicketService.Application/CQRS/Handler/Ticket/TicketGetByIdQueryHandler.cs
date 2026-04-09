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

namespace TicketService.Application.CQRS.Handler.Ticket
{
    public class TicketGetByIdQueryHandler : IRequestHandler<TicketGetByIdQuery, TicketGetByIdResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        private readonly EventGrpc.EventGrpcClient _eventGrpcClient;
        public TicketGetByIdQueryHandler(ITicketUnitOfWork unitOfWork, EventGrpc.EventGrpcClient eventGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _eventGrpcClient = eventGrpcClient;
        }
        public async Task<TicketGetByIdResponse> Handle(TicketGetByIdQuery request, CancellationToken cancellationToken)
        {
            var ticket = await _unitOfWork.Tickets.GetAllAsync().Include(x => x.TicketType).FirstOrDefaultAsync(x => x.Id == request.Id);
            if (ticket == null)
            {
                return new TicketGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Ticket is not found"
                };
            }
            if (ticket.IsDeleted)
            {
                return new TicketGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Ticket is deleted"
                };
            }

            try
            {
                var eventResponse = new EventResponse();
                if(request.HasEvent.HasValue && request.HasEvent.Value == true)
                {
                    var eventRequest = new EventRequest { EventId = ticket.EventId.ToString() };
                    eventResponse = _eventGrpcClient.GetEventDetail(eventRequest);

                    if (eventResponse == null)
                    {
                        return new TicketGetByIdResponse
                        {
                            IsSuccess = false,
                            Message = "Event is not found"
                        };
                    }
                    Console.WriteLine($"Event Response: {eventResponse.Name}");
                }

                var dto = new TicketDTO
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
                    } : null,
                    Zone = ticket.Zone,
                    Status = ticket.Status,
                    CreatedAt = ticket.CreatedAt,
                };

                var shapedData = DataShaper.ShapeData(dto, request.Fields);

                return new TicketGetByIdResponse
                {
                    IsSuccess = true,
                    Message = "Update Ticket Successfully",
                    Data = shapedData,
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new TicketGetByIdResponse
                {
                    IsSuccess = false,
                    Message = $"Event with ID {ticket.EventId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new TicketGetByIdResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
