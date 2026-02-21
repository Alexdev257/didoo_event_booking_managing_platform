using BookingService.Application.CQRS.Query.ResaleTransaction;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BookingService.Api.Controllers
{
    [Route("api/resaletransactions")]
    [ApiController]
    public class ResaleTransactionController : ControllerBase
    {
        private readonly IMediator _mediator;
        public ResaleTransactionController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllResaleTransactionAsync()
        {
            var request = new ResaleTransactionGetAllQuery();
            var result = await _mediator.Send(request);
            if (result.IsSuccess) return StatusCode(StatusCodes.Status200OK, result);
            else return StatusCode(StatusCodes.Status400BadRequest, result);
        }
    }
}
