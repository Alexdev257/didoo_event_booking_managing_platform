using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TicketService.Application.CQRS.Query.TicketType;

namespace TicketService.Api.Controllers
{
    [Route("api/tickettypes")]
    [ApiController]
    public class TicketTypeController : ControllerBase
    {
        private readonly IMediator _mediator;
        public TicketTypeController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTicketTypeAsync()
        {
            TicketTypeGetAllQuery request = new TicketTypeGetAllQuery();
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            return StatusCode(StatusCodes.Status400BadRequest, result);
        }
    }
}
