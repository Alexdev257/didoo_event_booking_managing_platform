using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OperationService.Application.Interfaces.Services;
using SharedContracts.Common.Wrappers;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace OperationService.Api.Controllers
{
    [ApiController]
    [Route("api/analytics")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IExternalGrpcService _grpcService;

        public AnalyticsController(IExternalGrpcService grpcService)
        {
            _grpcService = grpcService;
        }

        [HttpGet("admin/overview")]
        //[Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> GetAdminOverview()
        {
            var userCountTask = _grpcService.GetUserCountAsync();
            var eventOverviewTask = _grpcService.GetAdminOverviewAsync();
            var bookingAnalyticsTask = _grpcService.GetBookingAnalyticsAsync(null);

            await Task.WhenAll(userCountTask, eventOverviewTask, bookingAnalyticsTask);

            var response = new
            {
                TotalUsers = userCountTask.Result?.TotalUsers ?? 0,
                TotalEvents = eventOverviewTask.Result?.TotalEvents ?? 0,
                TotalOrganizers = eventOverviewTask.Result?.TotalOrganizers ?? 0,
                TotalBookings = bookingAnalyticsTask.Result?.TotalBookings ?? 0,
                TotalRevenue = bookingAnalyticsTask.Result?.TotalRevenue ?? 0
            };

            //return Ok(new CommonResponse<object>(response, true, "Admin overview retrieved successfully"));
            return Ok(new CommonResponse<object>
            {
                IsSuccess = true,
                Message = "Admin overview retrieved successfully",
                Data = response
            });
        }

        [HttpGet("organizer/overview")]
        [Authorize(Policy = "OrganizerOnly")]
        public async Task<IActionResult> GetOrganizerOverview()
        {
            var organizerId = User.FindFirst("OrganizerId")?.Value;
            if (string.IsNullOrEmpty(organizerId))
            {
                //return BadRequest(new CommonResponse<object>(null, false, "Organizer ID not found in claims"));
                return BadRequest(new CommonResponse<object>
                {
                    IsSuccess = false,
                    Message = "Organizer ID not found in claims"
                });
            }

            var eventOverviewTask = _grpcService.GetOrganizerOverviewAsync(organizerId);
            var eventIdsTask = _grpcService.GetEventIdsByOrganizerAsync(organizerId);

            await Task.WhenAll(eventOverviewTask, eventIdsTask);

            var eventIds = eventIdsTask.Result?.EventIds?.ToList() ?? new List<string>();
            var bookingAnalytics = await _grpcService.GetBookingAnalyticsAsync(eventIds);

            var response = new
            {
                TotalEvents = eventOverviewTask.Result?.TotalEvents ?? 0,
                TotalBookings = bookingAnalytics?.TotalBookings ?? 0,
                TotalRevenue = bookingAnalytics?.TotalRevenue ?? 0
            };

            //return Ok(new BaseResponse<object>(response, true, "Organizer overview retrieved successfully"));
            return Ok(new CommonResponse<object>
            {
                IsSuccess = true,
                Message = "Organizer overview retrivved successfully",
                Data = response
            });
        }
    }
}
