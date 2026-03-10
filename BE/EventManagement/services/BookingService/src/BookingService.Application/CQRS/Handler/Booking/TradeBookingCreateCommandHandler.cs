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
    public class TradeBookingCreateCommandHandler : IRequestHandler<TradeBookingCreateCommand, CreateBookingResponse>
    {
        private readonly IManageUnitOfWork _unitOfWork;
        private readonly ITicketServiceClient _ticketServiceClient;
        private readonly IMomoService _momoService;

        public TradeBookingCreateCommandHandler(
            IManageUnitOfWork unitOfWork,
            ITicketServiceClient ticketServiceClient,
            IMomoService momoService)
        {
            _unitOfWork = unitOfWork;
            _ticketServiceClient = ticketServiceClient;
            _momoService = momoService;
        }

        public async Task<CreateBookingResponse> Handle(TradeBookingCreateCommand request, CancellationToken cancellationToken)
        {
            // 1. Validate the listing is active via TicketService HTTP call
            TicketListingValidateResult listingResult;
            try
            {
                listingResult = await _ticketServiceClient.ValidateListingAsync(request.ListingId, cancellationToken);
            }
            catch (Exception ex)
            {
                return new CreateBookingResponse
                {
                    IsSuccess = false,
                    Message = $"Failed to connect to TicketService: {ex.Message}"
                };
            }

            if (!listingResult.IsAvailable)
            {
                return new CreateBookingResponse
                {
                    IsSuccess = false,
                    Message = listingResult.Message ?? "Listing is not available."
                };
            }

            var eventId = Guid.TryParse(listingResult.EventId, out var eid) ? eid : Guid.Empty;
            var ticketId = Guid.TryParse(listingResult.TicketId, out var tid) ? tid : (Guid?)null;
            decimal price = listingResult.AskingPrice;

            // 2. Create Booking with BookingType = TradePurchase
            var booking = new BookingEntity
            {
                UserId = request.BuyerUserId,
                EventId = eventId,
                Fullname = request.Fullname,
                Email = request.Email,
                Phone = request.Phone,
                Amount = 1,
                TotalPrice = price,
                BookingType = BookingTypeEnum.TradePurchase,
                Status = price == 0 ? BookingStatusEnum.Paid : BookingStatusEnum.Pending, // If price is 0, mark as Paid immediately
            };

            var bookingDetail = new BookingDetailEntity
            {
                BookingId = booking.Id,
                TicketId = ticketId,
                TicketListingId = request.ListingId,   // link to the TicketListing
                Quantity = 1,
                PricePerTicket = price,
                TotalPrice = price,
                
            };

            booking.BookingDetails.Add(bookingDetail);
            await _unitOfWork.Bookings.AddAsync(booking);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var orderInfoModel = new OrderInfoModel
            {
                Amount = price,
                GuestEmail = request.Email ?? string.Empty,
                GuestName = request.Fullname ?? string.Empty,
                GuestPhone = request.Phone ?? string.Empty,
                OrderDescription = $"Trade ticket purchase for listing {request.ListingId}",
                OrderId = booking.Id.ToString(),
                EventId = eventId.ToString(),
                ResaleId = request.ListingId.ToString(),
            };

            // 4. Create payment URL
            string paymentUrl;
            try
            {
                if (orderInfoModel.Amount != 0)
                {
                    paymentUrl = await _momoService.CreatePaymentURL(orderInfoModel, new DefaultHttpContext());
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
                    Message = $"Failed to create payment URL: {ex.Message}"
                };
            }

            // 5. Record payment entry
            var payment = new Domain.Entities.Payment
            {
                BookingId = booking.Id,
                UserId = request.BuyerUserId,
                Cost = price,
                Currency = "VND",
                PaidAt = orderInfoModel.Amount == 0 ? DateTime.UtcNow : DateTime.MinValue, // If amount is 0, mark as paid immediately
            };
            await _unitOfWork.Payments.AddAsync(payment);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 6. For free trades (price == 0), immediately transfer ownership and record audit transaction
            //    (paid trades are handled via the Momo callback)
            if (price == 0)
            {
                // Transfer ownership first; if this fails, no DB changes are made for this step
                try
                {
                    await _ticketServiceClient.MarkListingSoldAsync(request.ListingId, request.BuyerUserId, cancellationToken);
                }
                catch (Exception ex)
                {
                    return new CreateBookingResponse
                    {
                        IsSuccess = false,
                        Message = $"Booking created but failed to transfer ticket ownership: {ex.Message}"
                    };
                }

                // Ownership transferred successfully; persist PaidAt and audit record atomically
                var paidAt = DateTime.UtcNow;
                booking.PaidAt = paidAt;
                _unitOfWork.Bookings.UpdateAsync(booking);

                await _unitOfWork.SaveChangesAsync(cancellationToken);
            }

            return new CreateBookingResponse
            {
                IsSuccess = true,
                Message = "Trade booking created successfully.",
                Data = new BookingDTO
                {
                    Id = booking.Id.ToString(),
                    UserId = booking.UserId.ToString(),
                    EventId = booking.EventId.ToString(),
                    Fullname = booking.Fullname ?? string.Empty,
                    Email = booking.Email ?? string.Empty,
                    Phone = booking.Phone ?? string.Empty,
                    Amount = booking.Amount,
                    TotalPrice = booking.TotalPrice,
                    Status = booking.Status.ToString(),
                    BookingType = booking.BookingType.ToString(),
                    CreatedAt = booking.CreatedAt,
                    PaymentUrl = paymentUrl,
                    BookingDetails = new List<BookingDetailSubDTO>
                    {
                        new BookingDetailSubDTO
                        {
                            Id = bookingDetail.Id.ToString(),
                            TicketId = bookingDetail.TicketId?.ToString(),
                            TicketListingId = bookingDetail.TicketListingId?.ToString(),
                            TicketTypeId = bookingDetail.TicketTypeId.HasValue ? bookingDetail.TicketTypeId.Value.ToString() : null,
                            Quantity = bookingDetail.Quantity,
                            PricePerTicket = bookingDetail.PricePerTicket,
                            TotalPrice = bookingDetail.TotalPrice,
                        }
                    }
                }
            };
        }
    }
}

