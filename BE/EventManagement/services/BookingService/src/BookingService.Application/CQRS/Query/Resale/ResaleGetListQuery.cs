using BookingService.Application.DTOs.Response.Resale;
using BookingService.Domain.Enum;
using MediatR;
using SharedContracts.Common.Wrappers.Requests;

namespace BookingService.Application.CQRS.Query.Resale
{
    public class ResaleGetListQuery : PaginationRequest, IRequest<ResaleGetListResponse>
    {
        public Guid? SalerUserId { get; set; }
        public Guid? BookingDetailId { get; set; }
        public ResaleStatusEnum? Status { get; set; }
        public decimal? FromPrice { get; set; }
        public decimal? ToPrice { get; set; }
        public string? Fields { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
