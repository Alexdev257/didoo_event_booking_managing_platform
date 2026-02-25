using BookingService.Application.Interfaces.Repositories;
using BookingService.Domain.Entities;
using BookingService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Storage;
using SharedInfrastructure.Persistence.Repositories;
using SharedKernel.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookingService.Infrastructure.Implements.Repositories
{
    public class ManageUnitOfWork : IManageUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IDbContextTransaction? _currentTransaction;

        public ManageUnitOfWork(ApplicationDbContext context)
        {
            _context = context;
        }

        public IGenericRepository<Booking> Bookings => new GenericRepository<Booking>(_context);

        public IGenericRepository<BookingDetail> BookingDetails => new GenericRepository<BookingDetail>(_context);

        public IGenericRepository<Payment> Payments => new GenericRepository<Payment>(_context);

        public IGenericRepository<PaymentMethod> PaymentMethods => new GenericRepository<PaymentMethod>(_context);

        public IGenericRepository<Resale> Resales => new GenericRepository<Resale>(_context);

        public IGenericRepository<ResaleTransaction> ResaleTransactions => new GenericRepository<ResaleTransaction>(_context);

        public async Task BeginTransactionAsync()
        {
            if (_currentTransaction != null)
            {
                return; // Đã có transaction đang chạy thì không tạo mới
            }

            _currentTransaction = await _context.Database.BeginTransactionAsync();
        }

        public async Task CommitTransactionAsync()
        {
            try
            {
                // Luôn SaveChanges trước khi Commit
                await _context.SaveChangesAsync();

                if (_currentTransaction != null)
                {
                    await _currentTransaction.CommitAsync();
                }
            }
            catch
            {
                await RollbackTransactionAsync();
                throw; // Ném lỗi ra để Middleware xử lý
            }
            finally
            {
                if (_currentTransaction != null)
                {
                    await _currentTransaction.DisposeAsync();
                    _currentTransaction = null;
                }
            }
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        public async Task RollbackTransactionAsync()
        {
            try
            {
                if (_currentTransaction != null)
                {
                    await _currentTransaction.RollbackAsync();
                }
            }
            finally
            {
                if (_currentTransaction != null)
                {
                    await _currentTransaction.DisposeAsync();
                    _currentTransaction = null;
                }
            }
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
