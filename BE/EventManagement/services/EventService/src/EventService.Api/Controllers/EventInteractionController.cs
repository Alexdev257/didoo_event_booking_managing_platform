using EventService.Application.CQRS.Command.EventInteraction;
using EventService.Application.CQRS.Query.UserEventInteraction;
using EventService.Domain.Enum;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EventService.Api.Controllers
{
    [Route("api/interactions")]
    [ApiController]
    public class EventInteractionController : ControllerBase
    {
        private readonly IMediator _mediator;
        public EventInteractionController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetListInteractionsAsync([FromQuery] InteractionGetListQuery request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInteractionByIdAsync([FromRoute] Guid id, [FromQuery] InteractionGetByIdQuery request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateInteractionAsync([FromBody] InteractionCreateCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status201Created, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize]
        [HttpDelete("{userId}/{eventId}/{type}")]
        public async Task<IActionResult> DeleteInteractionAsync([FromRoute] Guid userId, [FromRoute] Guid eventId, [FromRoute] InteractionTypeEnum type)
        {
            var request = new InteractionDeleteCommand {UserId = userId, EventId = eventId, Type = type };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize]
        [HttpDelete("{userId}/{eventId}/{type}/soft")]
        public async Task<IActionResult> SoftDeleteInteractionAsync([FromRoute] Guid userId, [FromRoute] Guid eventId, [FromRoute] InteractionTypeEnum type)
        {
            var request = new InteractionSoftDeleteCommand { UserId = userId, EventId = eventId, Type = type };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize]
        [HttpPatch("{userId}/{eventId}/{type}")]
        public async Task<IActionResult> RestoreInteractionAsync([FromRoute] Guid userId, [FromRoute] Guid eventId, [FromRoute] InteractionTypeEnum type)
        {
            var request = new InteractionRestoreCommand { UserId = userId, EventId = eventId, Type = type };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }
    }
}
