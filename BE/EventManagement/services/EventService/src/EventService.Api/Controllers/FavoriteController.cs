using EventService.Application.CQRS.Command.FavoriteEvent;
using EventService.Application.CQRS.Query.FavoriteEvent;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EventService.Api.Controllers
{
    [Route("api/favorites")]
    [ApiController]
    public class FavoriteController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FavoriteController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetListFavoriteAsync([FromQuery] FavoriteGetListQuery request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFavoriteById([FromRoute] Guid id, [FromQuery] FavoriteGetByIdQuery request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateFavoriteAsync([FromBody] FavoriteCreateCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status201Created, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize]
        [HttpDelete("{userId}/{eventId}")]
        public async Task<IActionResult> DeleteFavoriteAsync([FromRoute] Guid userId, [FromRoute] Guid eventId)
        {
            var request = new FavoriteDeleteCommand { UserId = userId, EventId = eventId };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize]
        [HttpDelete("{userId}/{eventId}/soft")]
        public async Task<IActionResult> SoftDeleteFavoriteAsync([FromRoute] Guid userId, [FromRoute] Guid eventId)
        {
            var request = new FavoriteSoftDeleteCommand { UserId = userId, EventId = eventId };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize]
        [HttpPatch("{userId}/{eventId}")]
        public async Task<IActionResult> RestoreFavoriteAsync([FromRoute] Guid userId, [FromRoute] Guid eventId)
        {
            var request = new FavoriteRestoreCommand { UserId = userId, EventId = eventId };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }
    }
}
