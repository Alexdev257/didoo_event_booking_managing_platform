using BookingService.Application.CQRS.Query.PaymentMethod;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BookingService.Api.Controllers
{
    [Route("api/paymentmethods")]
    [ApiController]
    public class PaymentMethodController : ControllerBase
    {
        private readonly IMediator _mediator;
        public PaymentMethodController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetListPaymentMethodsAsync([FromQuery] PaymentMethodGetListQuery request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            else return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaymentMethodByIdAsync([FromRoute] Guid id, [FromQuery] PaymentMethodGetByIdQuery request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            else return StatusCode(StatusCodes.Status400BadRequest, result);
        }
    }
}
