using BookingService.Application.CQRS.Query.ResaleTransaction;
using BookingService.Application.DTOs.Response.ResaleTransaction;
using BookingService.Application.Interfaces.Repositories;
using MediatR;
using SharedInfrastructure.Extensions;

namespace BookingService.Application.CQRS.Handler.ResaleTransaction
{
    public class ResaleTransactionGetListQueryHandler : IRequestHandler<ResaleTransactionGetListQuery, ResaleTransactionGetListResponse>
    {
        private readonly IManageUnitOfWork _unitOfWork;
        public ResaleTransactionGetListQueryHandler(IManageUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ResaleTransactionGetListResponse> Handle(ResaleTransactionGetListQuery request, CancellationToken cancellationToken)
        {
            var transactions = _unitOfWork.ResaleTransactions.GetAllAsync().AsQueryable();

            if (request.IsDeleted.HasValue)
            {
                transactions = request.IsDeleted.Value
                    ? transactions.Where(x => x.IsDeleted)
                    : transactions.Where(x => !x.IsDeleted);
            }

            if (request.ResaleId.HasValue && request.ResaleId.Value != Guid.Empty)
                transactions = transactions.Where(x => x.ResaleId == request.ResaleId.Value);

            if (request.BuyerUserId.HasValue && request.BuyerUserId.Value != Guid.Empty)
                transactions = transactions.Where(x => x.BuyerUserId == request.BuyerUserId.Value);

            if (request.Status.HasValue)
                transactions = transactions.Where(x => x.Status == request.Status.Value);

            transactions = (request.IsDescending.HasValue && request.IsDescending.Value)
                ? transactions.OrderByDescending(x => x.CreatedAt)
                : transactions.OrderBy(x => x.CreatedAt);

            var pagedList = await QueryableExtensions.ToPagedListAsync(
                transactions,
                request.PageNumber,
                request.PageSize,
                t => new ResaleTransactionDTO
                {
                    Id = t.Id.ToString(),
                    ResaleId = t.ResaleId.ToString(),
                    BuyerUserId = t.BuyerUserId.ToString(),
                    Cost = t.Cost,
                    FeeCost = t.FeeCost,
                    Status = t.Status.ToString(),
                    TransactionDate = t.TransactionDate,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt,
                    IsDeleted = t.IsDeleted,
                    DeletedAt = t.DeletedAt
                },
                request.Fields);

            return new ResaleTransactionGetListResponse
            {
                IsSuccess = true,
                Message = "Retrieve Resale Transactions Successfully",
                Data = pagedList
            };
        }
    }
}
