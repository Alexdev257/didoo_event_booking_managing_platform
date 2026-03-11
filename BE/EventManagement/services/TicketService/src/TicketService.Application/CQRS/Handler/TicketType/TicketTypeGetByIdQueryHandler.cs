using Grpc.Core;
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

namespace TicketService.Application.CQRS.Handler.TicketType
{
    public class TicketTypeGetByIdQueryHandler : IRequestHandler<TicketTypeGetByIdQuery, TicketTypeGetByIdResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        private readonly EventGrpc.EventGrpcClient _eventGrpcClient;
        public TicketTypeGetByIdQueryHandler(ITicketUnitOfWork unitOfWork, EventGrpc.EventGrpcClient eventGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _eventGrpcClient = eventGrpcClient;
        }
        public async Task<TicketTypeGetByIdResponse> Handle(TicketTypeGetByIdQuery request, CancellationToken cancellationToken)
        {
            var ticketType = await _unitOfWork.TicketTypes.GetByIdAsync(request.Id);
            if (ticketType == null)
            {
                return new TicketTypeGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Ticket Type is not found"
                };
            }
            if (ticketType.IsDeleted)
            {
                return new TicketTypeGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Ticket Type is deleted"
                };
            }
            try
            {
                var eventRequest = new EventRequest { EventId = ticketType.EventId.ToString() };
                var eventResponse = _eventGrpcClient.GetEventDetail(eventRequest);

                if (eventResponse == null)
                {
                    return new  TicketTypeGetByIdResponse
                    {
                        IsSuccess = false,
                        Message = "Event is not found"
                    };
                }
                Console.WriteLine($"Event Response: {eventResponse.Name}");

                var dto = new TicketTypeDTO
                {
                    Id = ticketType.Id.ToString(),
                    Name = ticketType.Name,
                    Price = ticketType.Price,
                    TotalQuantity = ticketType.TotalQuantity,
                    AvailableQuantity = ticketType.AvailableQuantity,
                    Description = ticketType.Description,
                    MaxTicketsPerUser = ticketType.MaxTicketsPerUser,
                    CreatedAt = ticketType.CreatedAt,
                    Event = (request.HasEvent.HasValue && request.HasEvent.Value == true) ? new TicketTypeEventDTO
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
                    } : null
                };

                var sahpedData = DataShaper.ShapeData(dto, request.Fields);
                return new TicketTypeGetByIdResponse
                {
                    IsSuccess = true,
                    Message = "Update Ticket Type Successfully",
                    Data = sahpedData,
                };

            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new TicketTypeGetByIdResponse
                {
                    IsSuccess = false,
                    Message = $"Event with ID {ticketType.EventId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new TicketTypeGetByIdResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
