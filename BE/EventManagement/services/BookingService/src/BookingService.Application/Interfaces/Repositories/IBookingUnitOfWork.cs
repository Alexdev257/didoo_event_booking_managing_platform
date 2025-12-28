using BookingService.Domain.Entities;
using SharedKernel.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookingService.Application.Interfaces.Repositories
{
    public interface IBookingUnitOfWork : IUnitOfWork
    {
        IGenericRepository<Booking> Bookings { get; }
        IGenericRepository<BookingDetail> BookingDetails { get; }
    }
}
