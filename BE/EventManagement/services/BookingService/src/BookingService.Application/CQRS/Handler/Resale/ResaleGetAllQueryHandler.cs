using BookingService.Application.CQRS.Query.Resale;
using BookingService.Application.DTOs.Response.Resale;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BookingService.Application.CQRS.Handler.Resale
{
    public class ResaleGetAllQueryHandler : IRequestHandler<ResaleGetAllQuery, GetAllResaleResponse>
    {
        private readonly IManageUnitOfWork _unitOfWork;
        public ResaleGetAllQueryHandler(IManageUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<GetAllResaleResponse> Handle(ResaleGetAllQuery request, CancellationToken cancellationToken)
        {
            var result = _unitOfWork.Resales.GetAllAsync();
            var dto = await result.Select(d => new ResaleDTO
            {
                Id = d.Id.ToString(),
                SalerUserId = d.SalerUserId.ToString(),
                BookingDetailId = d.BookingDetailId.ToString(),
                Description = d.Description,
                Price = d.Price,
                Status = d.Status.ToString(),
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
                IsDeleted = d.IsDeleted,
                DeletedAt = d.DeletedAt
            }).ToListAsync(cancellationToken);

            return new GetAllResaleResponse
            {
                IsSuccess = true,
                Message = "Retrieve resales successfully",
                Data = dto
            };
        }
    }
}
