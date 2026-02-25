using SharedContracts.Common.Wrappers;

namespace BookingService.Application.DTOs.Response.ResaleTransaction
{
    public class GetAllResaleTransactionResponse : CommonResponse<List<ResaleTransactionDTO>> { }

    public class ResaleTransactionDTO
    {
        public string Id { get; set; } = default!;
        public string ResaleId { get; set; } = default!;
        public string BuyerUserId { get; set; } = default!;
        public decimal Cost { get; set; }
        public decimal FeeCost { get; set; }
        public string Status { get; set; } = default!;
        public DateTime TransactionDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
