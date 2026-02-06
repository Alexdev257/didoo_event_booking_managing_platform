using AuthService.Application.CQRS.Command.Auth;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Api.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync([FromBody] LoginCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPost("login-google")]
        public async Task<IActionResult> LoginGoogleAsync([FromBody] LoginGoogleCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshAsync([FromBody] RefreshCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> LogoutAsync([FromBody] LogoutCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync([FromBody] RegisterCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPost("verify-register")]
        public async Task<IActionResult> VerifyRegisterAsync([FromBody] VerifyRegisterCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status201Created, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPasswordAsync([FromBody] ForgotPasswordCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPost("verify-forgot-password")]
        public async Task<IActionResult> VerifyForgotPasswordAsync([FromBody] VerifyForgotPasswordCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPost("change-email")]
        public async Task<IActionResult> ChangeEmailAsync([FromBody] ChangeEmailCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPost("verify-change-email")]
        public async Task<IActionResult> VerifyChangeEmailAsync([FromBody] VerifyChangeEmailCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }

        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePasswordAsync([FromBody] ChangePasswordCommand request)
        {
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }
    }
}
