using EventService.Application.CQRS.Command.Event;
using EventService.Application.CQRS.Query.Event;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EventService.Api.Controllers
{
    [Route("api/events")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly IMediator _mediator;
        public EventController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetListEventsAsync([FromQuery] EventGetListQuery request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetEventByIdAsync([FromRoute] Guid id, [FromQuery] EventGetByIdQuery request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateEventAsync([FromBody] EventCreateCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status201Created, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEventAsync([FromRoute] Guid id, [FromBody] EventUpdateCommand request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEventAsync([FromRoute] Guid id)
        {
            var request = new EventDeleteCommand { Id = id };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> RestoreEventAsync([FromRoute] Guid id)
        {
            var request = new EventRestoreCommand { Id = id };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

    }
}
