using Grpc.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
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
    public class TicketRestoreCommandHandler : IRequestHandler<TicketRestoreCommand, TicketRestoreResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        private readonly EventGrpc.EventGrpcClient _eventGrpcClient;
        public TicketRestoreCommandHandler(ITicketUnitOfWork unitOfWork, EventGrpc.EventGrpcClient eventGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _eventGrpcClient = eventGrpcClient;
        }
        public async Task<TicketRestoreResponse> Handle(TicketRestoreCommand request, CancellationToken cancellationToken)
        {
            var ticket = await _unitOfWork.Tickets.GetAllAsync().Include(x => x.TicketType).FirstOrDefaultAsync(x => x.Id == request.Id);
            if (ticket == null)
            {
                return new TicketRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Ticket is not found"
                };
            }
            if (!ticket.IsDeleted)
            {
                return new TicketRestoreResponse
                {
                    IsSuccess = false,
                    Message = "Ticket is not deleted"
                };
            }

            try
            {
                var eventRequest = new EventRequest { EventId = ticket.EventId.ToString() };
                var eventResponse = _eventGrpcClient.GetEventDetail(eventRequest);

                if (eventResponse == null)
                {
                    return new TicketRestoreResponse
                    {
                        IsSuccess = false,
                        Message = "Event is not found"
                    };
                }
                Console.WriteLine($"Event Response: {eventResponse.Name}");

                await _unitOfWork.BeginTransactionAsync();
                ticket.IsDeleted = false;
                ticket.DeletedAt = null;
                _unitOfWork.Tickets.UpdateAsync(ticket);
                await _unitOfWork.CommitTransactionAsync();
                return new TicketRestoreResponse
                {
                    IsSuccess = true,
                    Message = "Update Ticket Successfully",
                    Data = new TicketDTO
                    {
                        Id = ticket.Id.ToString(),
                        TicketType = new TicketTicketTypeDTO
                        {
                            Id = ticket.TicketType.Id.ToString(),
                            Name = ticket.TicketType.Name,
                            AvailableQuantity = ticket.TicketType.AvailableQuantity,
                            Description = ticket.TicketType.Description,
                            Price = ticket.TicketType.Price,
                            TotalQuantity = ticket.TicketType.TotalQuantity,
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
                return new TicketRestoreResponse
                {
                    IsSuccess = false,
                    Message = $"Event with ID {ticket.EventId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new TicketRestoreResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }
}
