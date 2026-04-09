using BookingService.Application.DTOs.Request;
using BookingService.Application.DTOs.Response.Payment;
using Microsoft.AspNetCore.Http;

namespace BookingService.Application.Interfaces.Services
{
    public interface IMomoService
    {
        Task<string> CreatePaymentURL(OrderInfoModel orderInfo, HttpContext context);
        Task<RespondModel> GetPaymentStatus(IQueryCollection collection);
    }
}
