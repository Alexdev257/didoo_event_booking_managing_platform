using BookingService.Application.DTOs.Request;
using BookingService.Application.DTOs.Response.Payment;
using BookingService.Application.Interfaces.Repositories;
using BookingService.Application.Interfaces.Services;
using BookingService.Domain.Enum;
using BookingService.Infrastructure.DependencyInjection.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using SharedContracts.Events;
using SharedContracts.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace BookingService.Infrastructure.Implements.Services
{
    public class MomoServices : IMomoService
    {
        private readonly IOptions<MomoConfig> _momoConfig;
        private readonly IManageUnitOfWork _unitOfWork;
        private readonly ITicketServiceClient _ticketServiceClient;
        private readonly IMessageProducer _messageProducer;
        private readonly AuthGrpc.AuthGrpcClient _authClient;

        public MomoServices(IOptions<MomoConfig> momoConfig, IManageUnitOfWork unitOfWork, ITicketServiceClient ticketServiceClient, IMessageProducer messageProducer)
        {
            _momoConfig = momoConfig;
            _unitOfWork = unitOfWork;
            _ticketServiceClient = ticketServiceClient;
            _messageProducer = messageProducer;
        }

        public async Task<string> CreatePaymentURL(OrderInfoModel orderInfo, HttpContext context)
        {
            // extraData encodes "eventId" for normal bookings, "eventId|resaleId" for trade bookings
            var extraData = string.IsNullOrEmpty(orderInfo.ResaleId)
                ? orderInfo.EventId
                : $"{orderInfo.EventId}|{orderInfo.ResaleId}";

            var rawData =
                $"partnerCode={_momoConfig.Value.PartnerCode}" +
                $"&accessKey={_momoConfig.Value.AccessKey}" +
                $"&requestId={orderInfo.OrderId}" +
                $"&amount={orderInfo.Amount.ToString("0.##")}" +
                $"&orderId={orderInfo.OrderId}" +
                $"&orderInfo={orderInfo.OrderDescription}" +
                $"&returnUrl={_momoConfig.Value.ReturnUrl}" +
                $"&notifyUrl={_momoConfig.Value.NotifyUrl}" +
                $"&extraData={extraData}";
            var signature = ComputeHmacSha256(rawData, _momoConfig.Value.SecretKey);

            var client = new RestClient(_momoConfig.Value.MomoApiUrl);
            var request = new RestRequest() { Method = Method.Post };
            request.AddHeader("Content-Type", "application/json; charset=UTF-8");
            var requestData = new
            {
                accessKey = _momoConfig.Value.AccessKey,
                partnerCode = _momoConfig.Value.PartnerCode,
                requestType = _momoConfig.Value.RequestType,
                notifyUrl = _momoConfig.Value.NotifyUrl,
                returnUrl = _momoConfig.Value.ReturnUrl,
                orderId = orderInfo.OrderId,
                amount = orderInfo.Amount.ToString("0.##"),
                orderInfo = orderInfo.OrderDescription,
                requestId = orderInfo.OrderId,
                extraData = extraData,
                signature = signature
            };

            request.AddParameter("application/json", JsonConvert.SerializeObject(requestData), ParameterType.RequestBody);

            var response = await client.ExecuteAsync(request);

            string jsonString = response.Content!;
            JObject json = JObject.Parse(jsonString);
            string payUrl = json["payUrl"]?.ToString()!;

            return payUrl!;
        }

        public async Task<RespondModel> GetPaymentStatus(IQueryCollection collection)
        {
            var amount = collection.FirstOrDefault(s => s.Key == "amount").Value;
            var orderInfo = collection.FirstOrDefault(s => s.Key == "orderInfo").Value;
            var orderId = collection.FirstOrDefault(s => s.Key == "orderId").Value;
            var message = collection.FirstOrDefault(s => s.Key == "message").Value;
            var trancasionID = collection.FirstOrDefault(s => s.Key == "transId").Value;
            // extraData can be "eventId" or "eventId|resaleId"
            var extraData = collection.FirstOrDefault(predicate: s => s.Key == "extraData").Value.ToString();

            var booking = await _unitOfWork.Bookings.GetByIdAsync(Guid.Parse(orderId!));
            var payment = _unitOfWork.Payments.FindAsync(x => x.BookingId == Guid.Parse(orderId!)).FirstOrDefault();

            if (message.ToString().ToLower() != "success")
            {
                if (booking != null)
                {
                    booking.Status = BookingStatusEnum.Canceled;
                    _unitOfWork.Bookings.UpdateAsync(booking);
                }
            }
            else
            {
                var timeNow = DateTime.Now;
                if (booking != null)
                {
                    booking.Status = BookingStatusEnum.Paid;
                    booking.PaidAt = timeNow;
                    _unitOfWork.Bookings.UpdateAsync(booking);

                    if (booking.BookingType == BookingTypeEnum.TradePurchase)
                    {
                        // --- Trade booking: transfer ticket ownership via TicketService ---
                        // Parse resaleId from extraData ("eventId|resaleId")
                        var parts = extraData.Split('|');
                        if (parts.Length == 2 && Guid.TryParse(parts[1], out var listingId))
                        {
                            // Update OwnerId in Ticket via TicketService (MarkListingSoldAsync sets ticket.OwnerId = buyerId)
                            await _ticketServiceClient.MarkListingSoldAsync(listingId, booking.UserId);
                        }
                    }
                    else
                    {
                        // --- Normal booking: create Ticket records in TicketService ---
                        // Retrieve the BookingDetail to get TicketTypeId and Quantity
                        var bookingDetail = _unitOfWork.BookingDetails
                            .FindAsync(x => x.BookingId == booking.Id)
                            .FirstOrDefault();

                        if (bookingDetail != null && bookingDetail.TicketTypeId.HasValue)
                        {
                            var bulkRequest = new BulkCreateTicketsRequest
                            {
                                TicketTypeId = bookingDetail.TicketTypeId.Value,
                                EventId = booking.EventId,
                                OwnerId = booking.UserId,
                                Quantity = bookingDetail.Quantity,
                                Zone = null,
                            };

                            await _ticketServiceClient.BulkCreateTicketsAsync(bulkRequest);
                        }
                    }
                }

                if (payment != null)
                {
                    payment.PaidAt = timeNow;
                    _unitOfWork.Payments.UpdateAsync(payment);
                }
            }

            await _unitOfWork.SaveChangesAsync();

            // Publish notification events after successful payment
            if (message.ToString().ToLower() == "success" && booking != null)
            {
                if (booking.BookingType == BookingTypeEnum.TradePurchase)
                {
                    // Trade/Resale booking: parse resaleId from extraData
                    var resaleParts = extraData.Split('|');
                    var resaleId = resaleParts.Length == 2 && Guid.TryParse(resaleParts[1], out var rid) ? rid : Guid.Empty;

                    await _messageProducer.PublishAsync(new TicketResaleSuccessNotificationEvent
                    {
                        SellerUserId = Guid.Empty, // Seller info not available here
                        BuyerUserId = booking.UserId,
                        ResaleId = resaleId,
                        EventId = booking.EventId,
                        EventName = "",
                        SoldPrice = booking.TotalPrice
                    });
                }
                else
                {
                    // Normal booking
                    await _messageProducer.PublishAsync(new BookingSuccessNotificationEvent
                    {
                        UserId = booking.UserId,
                        BookingId = booking.Id,
                        EventId = booking.EventId,
                        EventName = ""
                    });


                    await _messageProducer.PublishAsync(new BookingSuccessNotificationEvent
                    {
                        UserId = booking.UserId,
                        BookingId = booking.Id,
                        EventId = booking.EventId,
                        
                    });

                    string buyerEmail = "hungptse183180@fpt.edu.vn"; // Retrieve buyer email from UserService if needed
                    string buyerName = "Pham Tien Hung"; // Retrieve buyer name from UserService if needed
                    string sellerEmail = "hungphamtien43@gmail.com"; // Retrieve seller email from UserService if needed
                    string sellerName = "Park Tae Hyun"; // Retrieve seller name from UserService if needed
                    string eventName = "Hackathon"; // Retrieve event name from EventService if needed
                    string[] ticketIds = ( _unitOfWork.BookingDetails
                            .FindAsync(x => x.BookingId == booking.Id))
                        .Select(x =>
                            booking.BookingType == BookingTypeEnum.TradePurchase
                                ? (x.TicketListingId.HasValue ? x.TicketListingId.Value.ToString() : "")
                                : (x.TicketTypeId.HasValue ? x.TicketTypeId.Value.ToString() : "")
                        )
                        .Where(x => !string.IsNullOrEmpty(x))
                        .ToArray();
                    bool isTrade = booking.BookingType == BookingTypeEnum.TradePurchase;



                    await _messageProducer.PublishAsync(new SendingEmailWhenEventSuccess(
                        BuyerEmail: buyerEmail,
                        BuyerName: buyerName,
                        SellerEmail: sellerEmail,
                        SellerName: sellerName,
                        TicketIds: ticketIds,
                        EventName: eventName,
                        IsTrade: isTrade
                        ));
                }
            }

            return await Task.FromResult(new RespondModel()
            {
                Amount = amount!,
                OrderId = orderId!,
                OrderDescription = orderInfo!,
                Message = message!,
                TrancasionID = trancasionID!,
            });
        }

        private string ComputeHmacSha256(string message, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            var messageBytes = Encoding.UTF8.GetBytes(message);

            byte[] hashBytes;

            using (var hmac = new HMACSHA256(keyBytes))
            {
                hashBytes = hmac.ComputeHash(messageBytes);
            }

            var hashString = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

            return hashString;
        }
    }
}
