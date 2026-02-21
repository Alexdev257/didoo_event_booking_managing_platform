using BookingService.Application.DTOs.Response.PaymentMethod;
using MediatR;

namespace BookingService.Application.CQRS.Query.PaymentMethod
{
    public class PaymentMethodGetAllQuery : IRequest<GetAllPaymentMethodResponse>
    {
    }
}
