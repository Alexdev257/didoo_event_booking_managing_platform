using BookingService.Application.CQRS.Query.Payment;
using BookingService.Application.Interfaces.Services;
using MediatR;
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

        [HttpGet]
        public async Task<IActionResult> GetListPaymentsAsync([FromQuery] PaymentGetListQuery request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            else return StatusCode(StatusCodes.Status400BadRequest, result);
        }

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

            //if ( response.Message == "Payment successful")
            //{
            //    //UriBuilder uriBuilder = new UriBuilder($"http://localhost:5173/confirm/{(response.Message.ToLower() == "success" ? "success" : "failed")}");
            //}
            var bookingId = Request.Query.FirstOrDefault(s => s.Key == "orderId").Value;
            var eventId = Request.Query.FirstOrDefault(s => s.Key == "extraData").Value;
            var successUrl = $"http://localhost:3000/events/{eventId}/booking/confirm?bookingId={bookingId}";
            var failedUrl = "https://github.com/";
             UriBuilder uriBuilder = new UriBuilder(response.Message.ToLower() == "success" ? successUrl : failedUrl);
             return Redirect(uriBuilder.ToString());
        }
    }
}
