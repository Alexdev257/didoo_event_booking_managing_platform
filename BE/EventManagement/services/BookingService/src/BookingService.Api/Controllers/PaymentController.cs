using BookingService.Application.CQRS.Query.Payment;
using BookingService.Application.Interfaces.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BookingService.Api.Controllers
{
    [ApiController]
    [Route("api/payments")]
    public class PaymentController : ControllerBase
    {
        private readonly IMomoService _momoService;
        private readonly IMediator _mediator;

        public PaymentController(IMomoService momoService, IMediator mediator)
        {
            _momoService = momoService;
            _mediator = mediator;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetListPaymentsAsync([FromQuery] PaymentGetListQuery request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            else return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaymentByIdAsync([FromRoute] Guid id, [FromQuery] PaymentGetByIdQuery request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            else return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpGet("callback")]
        public async Task<IActionResult> Callback()
        {
            var response = await _momoService.GetPaymentStatus(Request.Query);

            var bookingId = Request.Query.FirstOrDefault(s => s.Key == "orderId").Value.ToString();
            var extraData = Request.Query.FirstOrDefault(s => s.Key == "extraData").Value.ToString();
            var frontEndUrl = "https://didoo-events.vercel.app";

            // extraData is "eventId" for normal bookings, "eventId|resaleId" for trade purchases
            var parts = extraData.Split('|');
            var eventId = parts[0];

            string successUrl;
            if (parts.Length == 2)
            {
                // Trade purchase: redirect to trade confirmation page
                var resaleId = parts[1];
              successUrl = $"{frontEndUrl}/resale/{eventId}/trade-booking/{parts[1]}/confirm?bookingId={bookingId}";
            }
            else
            {
                // Normal booking
                successUrl = $"{frontEndUrl}/events/{eventId}/booking/confirm?bookingId={bookingId}";
            }

            return Redirect(new UriBuilder(successUrl).ToString());
        }
    }
}
