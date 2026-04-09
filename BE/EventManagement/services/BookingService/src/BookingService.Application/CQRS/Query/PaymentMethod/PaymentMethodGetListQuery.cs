using BookingService.Application.DTOs.Response.PaymentMethod;
using BookingService.Domain.Enum;
using MediatR;
using SharedContracts.Common.Wrappers.Requests;

namespace BookingService.Application.CQRS.Query.PaymentMethod
{
    public class PaymentMethodGetListQuery : PaginationRequest, IRequest<PaymentMethodGetListResponse>
    {
        public string? Name { get; set; }
        public PaymentMethodStatusEnum? Status { get; set; }
        public string? Fields { get; set; }
        public bool? IsDescending { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
