using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OperationService.Application.CQRS.Command.Notification;
using OperationService.Application.CQRS.Query.Notification;

namespace OperationService.Api.Controllers
{
    [Route("api/notifications")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly IMediator _mediator;
        public NotificationController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllNotificationsAsync([FromQuery] NotificationGetListQuery request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            else return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetNotificationByIdAsync([FromRoute] Guid id, [FromQuery] NotificationGetByIdQuery request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            else return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateNotificationAsync([FromBody] NotificationCreateCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status201Created, result);
            else return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNotificationAsync([FromRoute] Guid id, [FromBody] NotificationUpdateCommand request)
        {
            request.Id = id;
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            else return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotificationAsync([FromRoute] Guid id)
        {
            var request = new NotificationDeleteCommand { Id = id };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            else return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> RestoreNotificationAsync([FromRoute] Guid id)
        {
            var request = new NotificationRestoreCommand { Id = id };
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            else return StatusCode(StatusCodes.Status400BadRequest, result);
        }
    }
}
