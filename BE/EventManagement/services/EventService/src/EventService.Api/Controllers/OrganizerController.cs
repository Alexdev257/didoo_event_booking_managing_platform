using EventService.Application.CQRS.Command.Category;
using EventService.Application.CQRS.Command.Organizer;
using EventService.Application.CQRS.Query.Organizer;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EventService.Api.Controllers
{
    [Route("api/organizers")]
    [ApiController]
    public class OrganizerController : ControllerBase
    {
        private readonly IMediator _mediator;
        public OrganizerController(IMediator mediator)
        {
            _mediator = mediator;
        }

        private Guid? GetUserIdFromClaim()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("UserId")?.Value
                ?? User.FindFirst("sub")?.Value;
            return Guid.TryParse(userId, out var id) ? id : null;
        }

        [HttpGet]
        public async Task<IActionResult> GetListOrganizersAsync([FromQuery] OrganizerGetListQuery request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrganizerByIdAsync([FromRoute] Guid id, [FromQuery] OrganizerGetByIdQuery request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize(Policy = "UserOnly")]
        [HttpPost]
        public async Task<IActionResult> CreateOrganizerAsync([FromBody] OrganizerCreateCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status201Created, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize(Policy = "OrganizerOnly")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrganizerAsync([FromRoute] Guid id, [FromBody] OrganizerUpdateCommand request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrganizerAsync([FromRoute] Guid id)
        {
            var request = new OrganizerDeleteCommand { Id = id };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPatch("{id}")]
        public async Task<IActionResult> RestoreOrganizerAsync([FromRoute] Guid id)
        {
            var request = new OrganizerRestoreCommand { Id = id };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPatch("{id}/verify")]
        public async Task<IActionResult> vERIFYOrganizerAsync([FromRoute] Guid id)
        {
            var request = new OrganizerVerifyCommand { Id = id };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }
    }
}
