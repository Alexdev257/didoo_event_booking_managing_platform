using BookingService.Application.Interfaces.Services;
using BookingService.Domain.Entities;
using MassTransit.Mediator;
using Microsoft.AspNetCore.Mvc;

namespace BookingService.Api.Controllers
{
    [ApiController]
    [Route("api/{controller}")]
    public class PaymentController : ControllerBase
    {
        private readonly IMomoService _momoService;

        public PaymentController(IMomoService momoService)
        {
            _momoService = momoService;
        }

        [HttpPost("callback")]
        public async Task<IActionResult> Callback([FromRoute] string payment_name)
        {
            var response = await _momoService.GetPaymentStatus(Request.Query);
            return Ok(response);
        }
    }
}
