using BookingService.Application.CQRS.Command.Booking;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BookingService.Api.Controllers
{
    [Route("api/trade-bookings")]
    [ApiController]
    public class TradeBookingController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TradeBookingController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Create a booking for a trade/resale ticket listing.
        /// Returns a Momo payment URL to complete the purchase.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateTradeBookingAsync([FromBody] TradeBookingCreateCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status201Created, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }
    }
}

