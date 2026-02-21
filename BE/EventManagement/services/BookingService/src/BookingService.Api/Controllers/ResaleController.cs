using BookingService.Application.CQRS.Query.Resale;
using BookingService.Application.CQRS.Query.ResaleTransaction;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BookingService.Api.Controllers
{
    [Route("api/resales")]
    [ApiController]
    public class ResaleController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ResaleController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllResaleAsync()
        {
            var request = new ResaleGetAllQuery();
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            else return StatusCode(StatusCodes.Status400BadRequest, result);
        }
    }
}
