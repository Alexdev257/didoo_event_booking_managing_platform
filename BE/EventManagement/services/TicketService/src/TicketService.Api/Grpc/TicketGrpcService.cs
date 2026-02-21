using Grpc.Core;
using SharedContracts.Protos;
using TicketService.Application.Interfaces.Repositories;

namespace TicketService.Api.Grpc
{
    public class TicketGrpcService : TicketGrpc.TicketGrpcBase
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        private readonly ILogger<TicketGrpcService> _logger;

        public TicketGrpcService(ITicketUnitOfWork unitOfWork, ILogger<TicketGrpcService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        /// <summary>
        /// Kiểm tra TicketType còn slot không, nếu còn → giảm AvailableQuantity và trả về available=true.
        /// BookingService gọi RPC này trước khi tạo Booking.
        /// </summary>
        public override async Task<CheckAvailabilityResponse> CheckAndDecrementAvailability(
            CheckAvailabilityRequest request, ServerCallContext context)
        {
            _logger.LogInformation("[TicketGrpc] CheckAndDecrementAvailability: TicketTypeId={Id}, Qty={Qty}",
                request.TicketTypeId, request.Quantity);

            if (!Guid.TryParse(request.TicketTypeId, out var ticketTypeId))
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid TicketTypeId format"));

            if (request.Quantity <= 0)
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Quantity must be greater than 0"));

            var ticketType = await _unitOfWork.TicketTypes.GetByIdAsync(ticketTypeId);

            if (ticketType == null || ticketType.IsDeleted)
            {
                return new CheckAvailabilityResponse
                {
                    IsAvailable = false,
                    Message = "TicketType not found or has been deleted",
                    RemainingQuantity = 0,
                    PricePerTicket = 0
                };
            }

            var available = ticketType.AvailableQuantity ?? 0;
            if (available < request.Quantity)
            {
                return new CheckAvailabilityResponse
                {
                    IsAvailable = false,
                    Message = $"Not enough tickets. Available: {available}, Requested: {request.Quantity}",
                    RemainingQuantity = available,
                    PricePerTicket = (double)(ticketType.Price ?? 0)
                };
            }

            // Giảm AvailableQuantity
            ticketType.AvailableQuantity = available - request.Quantity;
            _unitOfWork.TicketTypes.UpdateAsync(ticketType);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("[TicketGrpc] Decremented AvailableQuantity for {Id}: {Before} → {After}",
                ticketTypeId, available, ticketType.AvailableQuantity);

            return new CheckAvailabilityResponse
            {
                IsAvailable = true,
                Message = "Available",
                RemainingQuantity = ticketType.AvailableQuantity ?? 0,
                PricePerTicket = (double)(ticketType.Price ?? 0)
            };
        }

        /// <summary>
        /// Lấy chi tiết Ticket (kept for backward compatibility).
        /// </summary>
        public override async Task<GetTicketDetailResponse> GetTicketDetail(
            GetTicketDetailRequest request, ServerCallContext context)
        {
            if (!Guid.TryParse(request.TicketId, out var ticketId))
                throw new RpcException(new Status(StatusCode.InvalidArgument, "Invalid TicketId format"));

            var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
            if (ticket == null || ticket.IsDeleted)
            {
                return new GetTicketDetailResponse
                {
                    IsSuccess = false,
                    Message = "Ticket not found"
                };
            }

            return new GetTicketDetailResponse
            {
                IsSuccess = true,
                Message = "Success",
                TicketData = new TicketModel
                {
                    Id = ticket.Id.ToString(),
                    EventId = "",
                    Zone = ticket.Zone?.ToString() ?? "",
                    Status = ticket.Status.ToString(),
                    OwnerId = ticket.OwnerId?.ToString() ?? ""
                }
            };
        }
    }
}
