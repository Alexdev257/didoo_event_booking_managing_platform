using SharedContracts.Common.Wrappers;

namespace BookingService.Application.DTOs.Response.Resale
{
    public class ResaleGetByIdResponse : CommonResponse<object>
    {
    }

    public class ResaleGetListResponse : CommonResponse<PaginationResponse<object>>
    {
    }
}
