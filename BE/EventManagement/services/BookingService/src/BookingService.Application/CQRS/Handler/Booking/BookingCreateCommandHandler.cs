using BookingService.Application.CQRS.Command.Booking;
using BookingService.Application.DTOs.Request;
using BookingService.Application.DTOs.Response.Booking;
using BookingService.Application.Interfaces.Repositories;
using BookingService.Application.Interfaces.Services;
using BookingService.Domain.Enum;
using MediatR;
using Microsoft.AspNetCore.Http;
using SharedContracts.Events;
using SharedContracts.Interfaces;
using BookingDetailEntity = BookingService.Domain.Entities.BookingDetail;
using BookingEntity = BookingService.Domain.Entities.Booking;

namespace BookingService.Application.CQRS.Handler.Booking
{
    public class BookingCreateCommandHandler : IRequestHandler<BookingCreateCommand, CreateBookingResponse>
    {
        private readonly IManageUnitOfWork _unitOfWork;
        private readonly ITicketServiceClient _ticketServiceClient;
        private readonly IMomoService _momoService;
        private readonly IMessageProducer _messageProducer;

        public BookingCreateCommandHandler(IManageUnitOfWork unitOfWork, ITicketServiceClient ticketServiceClient, IMomoService momoService, IMessageProducer messageProducer)
        {
            _unitOfWork = unitOfWork;
            _ticketServiceClient = ticketServiceClient;
            _momoService = momoService;
            _messageProducer = messageProducer;
        }

        public async Task<CreateBookingResponse> Handle(BookingCreateCommand request, CancellationToken cancellationToken)
        {
            // 1. Check & decrement availability via HTTP
            TicketDecrementResult ticketResult;
            try
            {
                ticketResult = await _ticketServiceClient.CheckAndDecrementAsync(request.TicketTypeId, request.Quantity, cancellationToken);
            }
            catch (Exception ex)
            {
                return new CreateBookingResponse
                {
                    IsSuccess = false,
                    Message = $"Failed to connect to TicketService: {ex.Message}"
                };
            }

            if (!ticketResult.IsAvailable)
            {
                return new CreateBookingResponse
                {
                    IsSuccess = false,
                    Message = ticketResult.Message!
                };
            }

            // 1b. Check per-user ticket limit
            if (ticketResult.MaxTicketsPerUser.HasValue)
            {
                // MaxTicketsPerUser được áp dụng theo từng TicketType riêng,
                // nên chỉ cộng các bookingdetail thuộc đúng TicketTypeId của request.
                var existingBookingDetails = _unitOfWork.BookingDetails
                    .FindAsync(d =>
                        d.TicketTypeId == request.TicketTypeId
                        && d.Booking.UserId == request.UserId
                        && d.Booking.EventId == request.EventId
                        && d.Booking.Status != BookingStatusEnum.Canceled
                        && !d.Booking.IsDeleted);

                int totalBooked = existingBookingDetails.Sum(d => d.Quantity);
                int maxAllowed = ticketResult.MaxTicketsPerUser.Value;

                if (totalBooked + request.Quantity > maxAllowed)
                {
                    // Rollback: increment lại số vé đã decrement
                    await _ticketServiceClient.IncrementAsync(request.TicketTypeId, request.Quantity, cancellationToken);

                    int remaining = maxAllowed - totalBooked;
                    return new CreateBookingResponse
                    {
                        IsSuccess = false,
                        Message = $"Bạn đã đặt {totalBooked}/{maxAllowed} vé cho sự kiện này. Bạn chỉ có thể đặt thêm tối đa {(remaining > 0 ? remaining : 0)} vé."
                    };
                }
            }
            // 2. Create booking
            decimal pricePerTicket = ticketResult.PricePerTicket;
            decimal totalPrice = pricePerTicket * request.Quantity;

            BookingEntity booking = new BookingEntity
            {
                UserId = request.UserId,
                EventId = request.EventId,
                Fullname = request.Fullname,
                Email = request.Email,
                Phone = request.Phone,
                Amount = request.Quantity,
                TotalPrice = totalPrice,
                Status = totalPrice == 0 ? BookingStatusEnum.Paid : BookingStatusEnum.Pending,
            };

            BookingDetailEntity bookingDetail = new BookingDetailEntity
            {
                BookingId = booking.Id,
                TicketTypeId = request.TicketTypeId,
                Quantity = request.Quantity,
                PricePerTicket = pricePerTicket,
                TotalPrice = totalPrice
            };

            booking.BookingDetails.Add(bookingDetail);

            await _unitOfWork.Bookings.AddAsync(booking);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var orderInfoModel = new OrderInfoModel
            {
                Amount = totalPrice,
                GuestEmail = request.Email!,
                GuestName = request.Fullname!,
                GuestPhone = request.Phone!,
                OrderDescription = $"",
                OrderId = booking.Id.ToString(),
                EventId = request.EventId.ToString(),
            };

            // 3. Create payment URL
            HttpContext httpContext = new DefaultHttpContext(); // You should ideally pass the actual HttpContext from your controller


            string paymentUrl;
            try
            {
                if (totalPrice != 0)
                {
                    paymentUrl = await _momoService.CreatePaymentURL(orderInfoModel, httpContext);
                }
                else
                {
                    paymentUrl = string.Empty;
                }
            }
            catch (Exception ex)
            {
                return new CreateBookingResponse
                {
                    IsSuccess = false,
                    Message = $"Failed to connect to MomoService: {ex.Message}"
                };
            }

            // 4. Add payment data to database
            var payment = new Domain.Entities.Payment
            {
                BookingId = booking.Id,
                Cost = totalPrice,
                Currency = "VND",
                PaidAt = totalPrice == 0 ? DateTime.UtcNow : DateTime.MinValue, // Mark as paid if total price is 0
            };

            await _unitOfWork.Payments.AddAsync(payment);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 5. For free bookings, synchronously create tickets (no payment callback will fire)
            if (totalPrice == 0)
            {
                booking.PaidAt = DateTime.UtcNow;

                var bulkRequest = new BulkCreateTicketsRequest
                {
                    TicketTypeId = request.TicketTypeId,
                    EventId = request.EventId,
                    OwnerId = request.UserId,
                    Quantity = request.Quantity,
                    Zone = null,
                };

                BulkCreateTicketsResult bulkResult;
                try
                {
                    bulkResult = await _ticketServiceClient.BulkCreateTicketsAsync(bulkRequest, cancellationToken);
                }
                catch (Exception ex)
                {
                    booking.Status = BookingStatusEnum.Canceled;
                    booking.PaidAt = null;
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                    return new CreateBookingResponse
                    {
                        IsSuccess = false,
                        Message = $"Booking created but failed to create tickets: {ex.Message}"
                    };
                }

                if (!bulkResult.IsSuccess)
                {
                    booking.Status = BookingStatusEnum.Canceled;
                    booking.PaidAt = null;
                    await _unitOfWork.SaveChangesAsync(cancellationToken);
                    return new CreateBookingResponse
                    {
                        IsSuccess = false,
                        Message = $"Booking created but failed to create tickets: {bulkResult.Message}"
                    };
                }

                await _unitOfWork.SaveChangesAsync(cancellationToken);

                // Publish notification event for free booking
                await _messageProducer.PublishAsync(new BookingSuccessNotificationEvent
                {
                    UserId = request.UserId,
                    BookingId = booking.Id,
                    EventId = request.EventId,
                    EventName = ""
                }, cancellationToken);
            }

            BookingDTO dto = new BookingDTO
            {
                Id = booking.Id.ToString(),
                UserId = booking.UserId.ToString(),
                EventId = booking.EventId.ToString(),
                Fullname = booking.Fullname!,
                Email = booking.Email!,
                Phone = booking.Phone!,
                Amount = booking.Amount,
                TotalPrice = booking.TotalPrice,
                Status = booking.Status.ToString(),
                BookingType = booking.BookingType.ToString(),
                PaidAt = booking.PaidAt,
                CreatedAt = booking.CreatedAt,
                UpdatedAt = booking.UpdatedAt,
                IsDeleted = booking.IsDeleted,
                DeletedAt = booking.DeletedAt,
                PaymentUrl = paymentUrl,
            };

            return new CreateBookingResponse
            {
                IsSuccess = true,
                Message = "Booking created successfully",
                Data = dto
            };
        }
    }
}
