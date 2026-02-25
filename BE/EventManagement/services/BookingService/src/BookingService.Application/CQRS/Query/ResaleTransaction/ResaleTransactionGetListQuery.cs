using BookingService.Application.DTOs.Response.ResaleTransaction;
using BookingService.Domain.Enum;
using MediatR;
using SharedContracts.Common.Wrappers.Requests;

namespace BookingService.Application.CQRS.Query.ResaleTransaction
{
    public class ResaleTransactionGetListQuery : PaginationRequest, IRequest<ResaleTransactionGetListResponse>
    {
        public Guid? ResaleId { get; set; }
        public Guid? BuyerUserId { get; set; }
        public ResaleTransactionStatusEnum? Status { get; set; }
        public string? Fields { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
