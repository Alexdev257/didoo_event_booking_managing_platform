using BookingService.Application.CQRS.Query.ResaleTransaction;
using BookingService.Application.DTOs.Response.ResaleTransaction;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace BookingService.Application.CQRS.Handler.ResaleTransaction
{
    public class ResaleTransactionGetAllQueryHandler : IRequestHandler<ResaleTransactionGetAllQuery, GetAllResaleTransactionResponse>
    {
        private readonly IManageUnitOfWork _unitOfWork;
        public ResaleTransactionGetAllQueryHandler(IManageUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<GetAllResaleTransactionResponse> Handle(ResaleTransactionGetAllQuery request, CancellationToken cancellationToken)
        {
            var result = _unitOfWork.ResaleTransactions.GetAllAsync();
            var dto = await result.Select(d => new ResaleTransactionDTO
            {
                Id = d.Id.ToString(),
                ResaleId = d.ResaleId.ToString(),
                BuyerUserId = d.BuyerUserId.ToString(),
                Cost = d.Cost,
                FeeCost = d.FeeCost,
                Status = d.Status.ToString(),
                TransactionDate = d.TransactionDate,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
                IsDeleted = d.IsDeleted,
                DeletedAt = d.DeletedAt
            }).ToListAsync(cancellationToken);

            return new GetAllResaleTransactionResponse
            {
                IsSuccess = true,
                Message = "Retrieve resale transactions successfully",
                Data = dto
            };
        }
    }
}
