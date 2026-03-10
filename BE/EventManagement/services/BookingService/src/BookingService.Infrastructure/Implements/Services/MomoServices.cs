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
using System.Security.Cryptography;
using System.Text;

namespace BookingService.Infrastructure.Implements.Services
{
    public class MomoServices : IMomoService
    {
        private readonly IOptions<MomoConfig> _momoConfig;
        private readonly IManageUnitOfWork _unitOfWork;
        private readonly ITicketServiceClient _ticketServiceClient;

        public MomoServices(IOptions<MomoConfig> momoConfig, IManageUnitOfWork unitOfWork, ITicketServiceClient ticketServiceClient)
        {
            _momoConfig = momoConfig;
            _unitOfWork = unitOfWork;
            _ticketServiceClient = ticketServiceClient;
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
            var extraData = collection.FirstOrDefault(s => s.Key == "extraData").Value.ToString();

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
