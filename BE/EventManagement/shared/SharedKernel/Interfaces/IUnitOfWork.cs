using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SharedKernel.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
        // Bắt đầu một giao dịch
        Task BeginTransactionAsync();

        // Chốt giao dịch (Mọi thứ OK mới lưu vào DB thật)
        Task CommitTransactionAsync();

        // Quay xe (Nếu có lỗi, hủy bỏ mọi thao tác trước đó)
        Task RollbackTransactionAsync();
    }
}
