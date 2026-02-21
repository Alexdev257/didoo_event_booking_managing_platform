using BookingService.Application.DTOs.Response.ResaleTransaction;
using MediatR;

namespace BookingService.Application.CQRS.Query.ResaleTransaction
{
    public class ResaleTransactionGetAllQuery : IRequest<GetAllResaleTransactionResponse>
    {
    }
}
