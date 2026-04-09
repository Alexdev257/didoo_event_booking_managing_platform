using BookingService.Application.DTOs.Response.Payment;
using MediatR;
using SharedContracts.Common.Wrappers.Requests;

namespace BookingService.Application.CQRS.Query.Payment
{
    public class PaymentGetListQuery : PaginationRequest, IRequest<PaymentGetListResponse>
    {
        public Guid? UserId { get; set; }
        public Guid? BookingId { get; set; }
        public Guid? PaymentMethodId { get; set; }
        public string? TransactionCode { get; set; }
        public string? Fields { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
