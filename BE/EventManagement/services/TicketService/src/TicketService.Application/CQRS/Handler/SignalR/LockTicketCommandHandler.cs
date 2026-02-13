using MediatR;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Application.CQRS.Command.SignalR;
using TicketService.Application.Interfaces.Repositories;
using TicketService.Application.Interfaces.SignalRServices;
using TicketService.Domain.Enum;

namespace TicketService.Application.CQRS.Handler.SignalR
{
    public class LockTicketCommandHandler : IRequestHandler<LockTicketCommand, bool>
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        private readonly ITicketHubService _ticketHubService;
        public LockTicketCommandHandler(ITicketUnitOfWork unitOfWork, ITicketHubService ticketHubService)
        {
            _unitOfWork = unitOfWork;
            _ticketHubService = ticketHubService;
        }
        public async Task<bool> Handle(LockTicketCommand request, CancellationToken cancellationToken)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 1. Tìm 'Quantity' số lượng vé đang Available
                // Lưu ý: Take(request.Quantity) để lấy đúng số lượng user muốn
                var availableTickets = await _unitOfWork.Tickets
                    .GetAllAsync() // Giả sử repo của bạn có hàm trả về IQueryable
                    .Where(x => x.EventId == request.EventId &&
                                x.TicketTypeId == request.TicketTypeId &&
                                x.Status == TicketStatusEnum.Available)
                    .Take(request.Quantity)
                    .ToListAsync(cancellationToken);

                // 2. Kiểm tra có đủ vé không
                if (availableTickets.Count < request.Quantity)
                {
                    // Không đủ vé => Rollback và báo lỗi (hoặc return false)
                    await _unitOfWork.RollbackTransactionAsync();
                    return false; // Hoặc throw Exception("Không đủ vé")
                }

                // 3. Update trạng thái sang LOCKED
                var lockExpiryTime = DateTime.UtcNow.AddMinutes(10); // Giữ vé 10 phút
                foreach (var ticket in availableTickets)
                {
                    ticket.Status = TicketStatusEnum.Locked;
                    ticket.OwnerId = request.UserId; // Gán tạm cho user này
                    ticket.LockExpiration = lockExpiryTime; // Nếu Entity có field này

                    _unitOfWork.Tickets.UpdateAsync(ticket);
                }

                await _unitOfWork.CommitTransactionAsync();

                // ======================================================
                // 4. LOGIC SIGNALR (REAL-TIME)
                // ======================================================

                // Tính lại tổng số vé còn lại (Available) của loại vé này sau khi đã lock
                var remainingCount = await _unitOfWork.Tickets
                    .GetAllAsync()
                    .CountAsync(x => x.EventId == request.EventId &&
                                     x.TicketTypeId == request.TicketTypeId &&
                                     x.Status == TicketStatusEnum.Available, cancellationToken);

                // Bắn tin cho toàn bộ người đang xem Event này
                await _ticketHubService.SendTicketUpdate(
                    request.EventId.ToString(),
                    request.TicketTypeId,
                    remainingCount
                );

                return true;
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
    }
}
