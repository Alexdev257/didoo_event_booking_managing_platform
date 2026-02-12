using EventService.Application.CQRS.Command.Category;
using EventService.Application.CQRS.Command.Organizer;
using EventService.Application.CQRS.Query.Organizer;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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

        [HttpPost]
        public async Task<IActionResult> CreateOrganizerAsync([FromBody] OrganizerCreateCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status201Created, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrganizerAsync([FromRoute] Guid id, [FromBody] OrganizerUpdateCommand request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrganizerAsync([FromRoute] Guid id)
        {
            var request = new OrganizerDeleteCommand { Id = id };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> RestoreOrganizerAsync([FromRoute] Guid id)
        {
            var request = new OrganizerRestoreCommand { Id = id };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }
    }
}
