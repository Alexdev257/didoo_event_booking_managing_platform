using BookingService.Application.CQRS.Query.Resale;
using BookingService.Application.DTOs.Response.Resale;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;

namespace BookingService.Application.CQRS.Handler.Resale
{
    public class ResaleGetByIdQueryHandler : IRequestHandler<ResaleGetByIdQuery, ResaleGetByIdResponse>
    {
        private readonly IResaleUnitOfWork _unitOfWork;
        public ResaleGetByIdQueryHandler(IResaleUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ResaleGetByIdResponse> Handle(ResaleGetByIdQuery request, CancellationToken cancellationToken)
        {
            var resale = await _unitOfWork.Resales
                .GetAllAsync()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (resale == null)
            {
                return new ResaleGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Resale is not found"
                };
            }
            if (resale.IsDeleted)
            {
                return new ResaleGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Resale is deleted"
                };
            }

            var dto = new ResaleDTO
            {
                Id = resale.Id.ToString(),
                SalerUserId = resale.SalerUserId.ToString(),
                BookingDetailId = resale.BookingDetailId.ToString(),
                Description = resale.Description,
                Price = resale.Price,
                Status = resale.Status.ToString(),
                CreatedAt = resale.CreatedAt,
                UpdatedAt = resale.UpdatedAt,
                IsDeleted = resale.IsDeleted,
                DeletedAt = resale.DeletedAt
            };

            var shapedData = DataShaper.ShapeData(dto, request.Fields);
            return new ResaleGetByIdResponse
            {
                IsSuccess = true,
                Message = "Retrieve Resale Successfully",
                Data = shapedData
            };
        }
    }
}
