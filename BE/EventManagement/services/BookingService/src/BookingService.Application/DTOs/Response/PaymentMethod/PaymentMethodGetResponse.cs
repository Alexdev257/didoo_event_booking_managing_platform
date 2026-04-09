using SharedContracts.Common.Wrappers;

namespace BookingService.Application.DTOs.Response.PaymentMethod
{
    public class PaymentMethodGetByIdResponse : CommonResponse<object>
    {
    }

    public class PaymentMethodGetListResponse : CommonResponse<PaginationResponse<object>>
    {
    }
}
