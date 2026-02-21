using BookingService.Application.DTOs.Request;
using BookingService.Application.DTOs.Response.Payment;
using BookingService.Application.Interfaces.Services;
using BookingService.Infrastructure.DependencyInjection.Options;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace BookingService.Infrastructure.Implements.Services
{
    public class MomoServices : IMomoService
    {
        private readonly IOptions<MomoConfig> _momoConfig;

        public MomoServices(IOptions<MomoConfig> momoConfig)
        {
            _momoConfig = momoConfig;
        }
        public async Task<string> CreatePaymentURL(OrderInfoModel orderInfo, HttpContext context)
        {
            orderInfo.OrderId = DateTime.Now.Ticks.ToString();
            var rawData =
                $"partnerCode={_momoConfig.Value.PartnerCode}" +
                $"&accessKey={_momoConfig.Value.AccessKey}" +
                $"&requestId={orderInfo.OrderId}" +
                $"&amount={orderInfo.Amount.ToString("0.##")}" +
                $"&orderId={orderInfo.OrderId}" +
                $"&orderInfo={orderInfo.OrderDescription}" +
                $"&returnUrl={_momoConfig.Value.ReturnUrl}" +
                $"&notifyUrl={_momoConfig.Value.NotifyUrl}" +
                $"&extraData=";
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
                extraData = "",
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
            //var BookingID = collection.FirstOrDefault(s => s.Key == "BookingID").Value;
            return await Task.FromResult(new RespondModel()
            {
                Amount = amount!,
                OrderId = orderId!,
                OrderDescription = orderInfo!,
                Message = message!,
                TrancasionID = trancasionID!,
                //BookingID = BookingID!
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
