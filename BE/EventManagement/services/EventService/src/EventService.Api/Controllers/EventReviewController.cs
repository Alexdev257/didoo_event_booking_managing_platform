using EventService.Application.CQRS.Command.EventReview;
using EventService.Application.CQRS.Query.EventReview;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EventService.Api.Controllers
{
    [Route("api/eventreviews")]
    [ApiController]
    public class EventReviewController : ControllerBase
    {
        private readonly IMediator _mediator;
        public EventReviewController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetListReviewsAsync([FromQuery] EventReviewGetListQuery request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventReviewByIdAsync([FromRoute] Guid id, [FromQuery] EventReviewGetByIdQuery request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateEventReviewAsync([FromBody] EventReviewCreateCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status201Created, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEventReviewAsync([FromRoute] Guid id, [FromBody] EventReviewUpdateCommand request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEventReviewAsync([FromRoute] Guid id)
        {
            var request = new EventReviewDeleteCommand { Id = id };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize]
        [HttpPatch("{id}")]
        public async Task<IActionResult> RestoreEventReviewAsync([FromRoute] Guid id)
        {
            var request = new EventReviewRestoreCommand { Id = id };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }
    }
}
