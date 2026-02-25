using BookingService.Application.DTOs.Response.Resale;
using MediatR;

namespace BookingService.Application.CQRS.Query.Resale
{
    public class ResaleGetAllQuery : IRequest<GetAllResaleResponse>
    {
    }
}
