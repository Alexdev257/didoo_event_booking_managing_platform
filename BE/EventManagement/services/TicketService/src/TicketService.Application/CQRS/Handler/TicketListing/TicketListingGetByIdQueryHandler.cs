using Grpc.Core;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Protos;
using SharedInfrastructure.Extensions;
using System.Net.Sockets;
using System.Text.Json;
using TicketService.Application.CQRS.Query.TicketListing;
using TicketService.Application.DTOs.Response.TicketListing;
using TicketService.Application.DTOs.Response.TicketType;
using TicketService.Application.Interfaces.Repositories;
using TicketService.Domain.Entities;
using TicketService.Domain.Enum;

namespace TicketService.Application.CQRS.Handler.TicketListing
{
    public class TicketListingGetByIdQueryHandler : IRequestHandler<TicketListingGetByIdQuery, TicketListingGetByIdResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        private readonly EventGrpc.EventGrpcClient _eventGrpcClient;
        private readonly AuthGrpc.AuthGrpcClient _authGrpcClient;

        public TicketListingGetByIdQueryHandler(ITicketUnitOfWork unitOfWork, EventGrpc.EventGrpcClient eventGrpcClient, AuthGrpc.AuthGrpcClient authGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _eventGrpcClient = eventGrpcClient;
            _authGrpcClient = authGrpcClient;
        }

        public async Task<TicketListingGetByIdResponse> Handle(TicketListingGetByIdQuery request, CancellationToken cancellationToken)
        {
            //var listing = await _unitOfWork.TicketListings.GetByIdAsync(request.Id);
            var listing = await _unitOfWork.TicketListings.GetAllAsync().Include(x => x.Ticket).FirstOrDefaultAsync(x => x.Id == request.Id);
            if (listing == null || listing.IsDeleted)
                return new TicketListingGetByIdResponse { IsSuccess = false, Message = "Listing not found." };

            try
            {
                var eventRequest = new EventRequest { EventId = listing.EventId.ToString() };
                var eventResponse = _eventGrpcClient.GetEventDetail(eventRequest);

                if (eventResponse == null)
                {
                    return new TicketListingGetByIdResponse
                    {
                        IsSuccess = false,
                        Message = "Event is not found"
                    };
                }
                Console.WriteLine($"Event Response: {eventResponse.Name}");

                var userRequest = new UserRequest { UserId = listing.SellerUserId.ToString() };

                var userResponse = await _authGrpcClient.GetUserProfileAsync(userRequest, cancellationToken: cancellationToken);

                if (userResponse == null)
                {
                    return new TicketListingGetByIdResponse
                    {
                        IsSuccess = false,
                        Message = "User is not found"
                    };
                }
                Console.WriteLine($"User Response: {userResponse.FullName}");
                var dto = new TicketListingDTO
                {
                    Id = listing.Id.ToString(),
                    Ticket = new TicketListingTicketDTO
                    {
                        Id =listing.Ticket.Id.ToString(),
                        OwnerId = listing.Ticket.OwnerId.ToString(),
                        Status = listing.Ticket.Status,
                        TicketTypeId = listing.Ticket.TicketTypeId.ToString(),
                        Zone = listing.Ticket.Zone,
                    },
                    Event = new TicketListingEventDTO
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
                    SellerUser = new TicketListingUserDTO
                    {
                        Id = userResponse.Id.ToString(),
                        FullName = userResponse.FullName,
                        AvatarUrl = userResponse.AvatarUrl,
                        Gender = Int32.Parse(userResponse.Gender),
                    },
                    AskingPrice = listing.AskingPrice,
                    Description = listing.Description,
                    Status = listing.Status,
                    CreatedAt = listing.CreatedAt,
                    UpdatedAt = listing.UpdatedAt,
                };
                var shapedData = DataShaper.ShapeData(dto, request.Fields);
                return new TicketListingGetByIdResponse
                {
                    IsSuccess = true,
                    Message = "Ticket listing retrieved successfully.",
                    Data = shapedData
                };
            }
            catch (RpcException ex) when (ex.StatusCode == StatusCode.NotFound)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new TicketListingGetByIdResponse
                {
                    IsSuccess = false,
                    Message = $"Event with ID {listing.EventId} does not exist.",
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new  TicketListingGetByIdResponse
                {
                    IsSuccess = false,
                    Message = ex.Message,
                };
            }
        }
    }

    public class TicketListingValidateQueryHandler : IRequestHandler<TicketListingValidateQuery, TicketListingValidateResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        private readonly EventGrpc.EventGrpcClient _eventGrpcClient;
        private readonly AuthGrpc.AuthGrpcClient _authGrpcClient;

        public TicketListingValidateQueryHandler(ITicketUnitOfWork unitOfWork, EventGrpc.EventGrpcClient eventGrpcClient, AuthGrpc.AuthGrpcClient authGrpcClient)
        {
            _unitOfWork = unitOfWork;
            _eventGrpcClient = eventGrpcClient;
            _authGrpcClient = authGrpcClient;
        }

        public async Task<TicketListingValidateResponse> Handle(TicketListingValidateQuery request, CancellationToken cancellationToken)
        {
            var listing = await _unitOfWork.TicketListings.GetByIdAsync(request.ListingId);

            if (listing == null || listing.IsDeleted)
                return new TicketListingValidateResponse
                {
                    IsSuccess = false,
                    Message = "Listing not found.",
                    Data = new TicketListingValidateData { IsAvailable = false, Message = "Listing not found." }
                };

            if (listing.Status != TicketListingStatusEnum.Active)
                return new TicketListingValidateResponse
                {
                    IsSuccess = false,
                    Message = $"Listing is not active. Current status: {listing.Status}.",
                    Data = new TicketListingValidateData { IsAvailable = false, Message = $"Listing is not active. Status: {listing.Status}." }
                };

            var ticket = await _unitOfWork.Tickets.GetByIdAsync(listing.TicketId);

            return new TicketListingValidateResponse
            {
                IsSuccess = true,
                Message = "Listing is available.",
                Data = new TicketListingValidateData
                {
                    IsAvailable = true,
                    Message = "Listing is active and available for purchase.",
                    TicketId = listing.TicketId.ToString(),
                    EventId = ticket?.EventId.ToString(),
                    AskingPrice = listing.AskingPrice,
                }
            };
        }
    }
}

