using MediatR;
using Microsoft.AspNetCore.Mvc;
using TicketService.Application.CQRS.Command.TicketListing;
using TicketService.Application.CQRS.Query.TicketListing;

namespace TicketService.Api.Controllers
{
    [Route("api/ticketlistings")]
    [ApiController]
    public class TicketListingController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TicketListingController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetListAsync([FromQuery] TicketListingGetListQuery request)
        {
            var result = await _mediator.Send(request);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetByIdAsync([FromRoute] Guid id)
        {
            var result = await _mediator.Send(new TicketListingGetByIdQuery { Id = id });
            return result.IsSuccess ? Ok(result) : NotFound(result);
        }

        /// <summary>
        /// Called by BookingService to validate a listing before creating a trade booking.
        /// </summary>
        [HttpGet("{id}/validate")]
        public async Task<IActionResult> ValidateAsync([FromRoute] Guid id)
        {
            var result = await _mediator.Send(new TicketListingValidateQuery { ListingId = id });
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateAsync([FromBody] TicketListingCreateCommand request)
        {
            var result = await _mediator.Send(request);
            return result.IsSuccess ? StatusCode(201, result) : BadRequest(result);
        }

        [HttpPatch("{id}/cancel")]
        public async Task<IActionResult> CancelAsync([FromRoute] Guid id, [FromBody] TicketListingCancelCommand request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }

        /// <summary>
        /// Called internally (e.g. from BookingService payment callback) to mark listing as sold and transfer ownership.
        /// </summary>
        [HttpPatch("{id}/mark-sold")]
        public async Task<IActionResult> MarkSoldAsync([FromRoute] Guid id, [FromBody] TicketListingMarkSoldCommand request)
        {
            request.ListingId = id;
            var result = await _mediator.Send(request);
            return result.IsSuccess ? Ok(result) : BadRequest(result);
        }
    }
}

