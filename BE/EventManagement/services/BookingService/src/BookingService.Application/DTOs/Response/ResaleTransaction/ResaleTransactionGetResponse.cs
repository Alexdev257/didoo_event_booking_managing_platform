using SharedContracts.Common.Wrappers;

namespace BookingService.Application.DTOs.Response.ResaleTransaction
{
    public class ResaleTransactionGetByIdResponse : CommonResponse<object>
    {
    }

    public class ResaleTransactionGetListResponse : CommonResponse<PaginationResponse<object>>
    {
    }
}
