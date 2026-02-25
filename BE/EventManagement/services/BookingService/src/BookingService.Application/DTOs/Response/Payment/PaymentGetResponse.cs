using SharedContracts.Common.Wrappers;

namespace BookingService.Application.DTOs.Response.Payment
{
    public class PaymentGetByIdResponse : CommonResponse<object>
    {
    }

    public class PaymentGetListResponse : CommonResponse<PaginationResponse<object>>
    {
    }

    public class PaymentDTO
    {
        public string Id { get; set; } = default!;
        public string UserId { get; set; } = default!;
        public string? BookingId { get; set; }
        public string? ResaleTransactionId { get; set; }
        public string? PaymentMethodId { get; set; }
        public decimal Cost { get; set; }
        public string Currency { get; set; } = "VND";
        public string? TransactionCode { get; set; }
        public string? ProviderResponse { get; set; }
        public DateTime PaidAt { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
