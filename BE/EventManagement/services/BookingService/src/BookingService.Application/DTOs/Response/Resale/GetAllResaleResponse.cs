using SharedContracts.Common.Wrappers;

namespace BookingService.Application.DTOs.Response.Resale
{
    public class GetAllResaleResponse : CommonResponse<List<ResaleDTO>> { }

    public class ResaleDTO
    {
        public string Id { get; set; } = default!;
        public string SalerUserId { get; set; } = default!;
        public string BookingDetailId { get; set; } = default!;
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}
