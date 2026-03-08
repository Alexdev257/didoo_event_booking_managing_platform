using BookingService.Application.CQRS.Command.Booking;
using BookingService.Application.DTOs.Request;
using BookingService.Application.DTOs.Response.Booking;
using BookingService.Application.Interfaces.Repositories;
using BookingService.Application.Interfaces.Services;
using BookingService.Domain.Enum;
using MediatR;
using Microsoft.AspNetCore.Http;
using BookingDetailEntity = BookingService.Domain.Entities.BookingDetail;
using BookingEntity = BookingService.Domain.Entities.Booking;

namespace BookingService.Application.CQRS.Handler.Booking
{
    public class BookingCreateCommandHandler : IRequestHandler<BookingCreateCommand, CreateBookingResponse>
    {
        private readonly IManageUnitOfWork _unitOfWork;
        private readonly ITicketServiceClient _ticketServiceClient;
        private readonly IMomoService _momoService;

        public BookingCreateCommandHandler(IManageUnitOfWork unitOfWork, ITicketServiceClient ticketServiceClient, IMomoService momoService)
        {
            _unitOfWork = unitOfWork;
            _ticketServiceClient = ticketServiceClient;
            _momoService = momoService;
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
