using BookingService.Application.CQRS.Query.ResaleTransaction;
using BookingService.Application.DTOs.Response.ResaleTransaction;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Extensions;

namespace BookingService.Application.CQRS.Handler.ResaleTransaction
{
    public class ResaleTransactionGetByIdQueryHandler : IRequestHandler<ResaleTransactionGetByIdQuery, ResaleTransactionGetByIdResponse>
    {
        private readonly IResaleUnitOfWork _unitOfWork;
        public ResaleTransactionGetByIdQueryHandler(IResaleUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ResaleTransactionGetByIdResponse> Handle(ResaleTransactionGetByIdQuery request, CancellationToken cancellationToken)
        {
            var transaction = await _unitOfWork.ResaleTransactions
                .GetAllAsync()
                .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

            if (transaction == null)
            {
                return new ResaleTransactionGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Resale transaction is not found"
                };
            }
            if (transaction.IsDeleted)
            {
                return new ResaleTransactionGetByIdResponse
                {
                    IsSuccess = false,
                    Message = "Resale transaction is deleted"
                };
            }

            var dto = new ResaleTransactionDTO
            {
                Id = transaction.Id.ToString(),
                ResaleId = transaction.ResaleId.ToString(),
                BuyerUserId = transaction.BuyerUserId.ToString(),
                Cost = transaction.Cost,
                FeeCost = transaction.FeeCost,
                Status = transaction.Status.ToString(),
                TransactionDate = transaction.TransactionDate,
                CreatedAt = transaction.CreatedAt,
                UpdatedAt = transaction.UpdatedAt,
                IsDeleted = transaction.IsDeleted,
                DeletedAt = transaction.DeletedAt
            };

            var shapedData = DataShaper.ShapeData(dto, request.Fields);
            return new ResaleTransactionGetByIdResponse
            {
                IsSuccess = true,
                Message = "Retrieve Resale Transaction Successfully",
                Data = shapedData
            };
        }
    }
}
