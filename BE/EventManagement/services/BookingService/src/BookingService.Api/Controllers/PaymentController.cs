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

        [HttpPost("callback")]
        public async Task<IActionResult> Callback([FromRoute] string payment_name)
        {
            var response = await _momoService.GetPaymentStatus(Request.Query);
            return Ok(response);
        }
    }
}
