using SharedContracts.Common.Wrappers;

namespace BookingService.Application.DTOs.Response.PaymentMethod
{
    public class GetAllPaymentMethodResponse : CommonResponse<List<PaymentMethodDTO>> { }

    public class PaymentMethodDTO
    {
        public string Id { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
    }
}
