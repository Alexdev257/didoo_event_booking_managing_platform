using EventService.Application.Interfaces.Repositories;
using EventService.Domain.Enum;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace EventService.Infrastructure.BackgroundJobs
{
    public class EventStatusUpdateBackgroundService : BackgroundService
    {
        private readonly ILogger<EventStatusUpdateBackgroundService> _logger;
        private readonly IServiceProvider _serviceProvider;
        // Chạy mỗi ngày một lần (24 hours)
        private readonly TimeSpan _period = TimeSpan.FromMinutes(1);

        public EventStatusUpdateBackgroundService(
            ILogger<EventStatusUpdateBackgroundService> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Event Status Update Job is starting.");

            // Dùng PeriodicTimer để tạo vòng lặp chạy theo chu kỳ mỗi 24 tiếng
            using PeriodicTimer timer = new PeriodicTimer(_period);
            while (
                !stoppingToken.IsCancellationRequested &&
                await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
                {
                    _logger.LogInformation("Event Status Update Job is working at {time}", DateTimeOffset.Now);
                    Console.WriteLine("Event Status Update Job is working at {0}", DateTimeOffset.Now);
                    await UpdateEventStatusAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing Event Status Update Job");
                }
            }
        }

        private async Task UpdateEventStatusAsync()
        {
            // Do BackgroundService là Singleton (sống cùng app), còn IEventUnitOfWork là Scoped
            // Nên ta cần tạo một Scope mới mỗi lần chạy job để lấy ra IEventUnitOfWork
            using var scope = _serviceProvider.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IEventUnitOfWork>();

            // Lấy ra tất cả sự kiện đang "Published"
            var publishedEvents = await unitOfWork.Events.GetAllAsync()
                .Where(e => e.Status == EventStatusEnum.Published && e.IsDeleted == false)
                .ToListAsync();

            if (!publishedEvents.Any())
                return;

            int updatedCount = 0;
            var today = DateTime.UtcNow.Date; // Hoặc dùng múi giờ local nếu bạn lưu StartTime theo local: DateTime.Now.Date

            foreach (var evt in publishedEvents)
            {
                if (evt.StartTime.HasValue && evt.StartTime.Value.Date == today)
                {
                    evt.Status = EventStatusEnum.Opened;
                    unitOfWork.Events.UpdateAsync(evt);
                    updatedCount++;
                }
            }

            if (updatedCount > 0)
            {
                await unitOfWork.BeginTransactionAsync();
                try
                {
                    Console.WriteLine("Successfully updated {0} events to Opened status.", updatedCount);
                    await unitOfWork.CommitTransactionAsync();
                    _logger.LogInformation($"Successfully updated {updatedCount} events to Opened status.");
                }
                catch (Exception ex)
                {
                    await unitOfWork.RollbackTransactionAsync();
                    _logger.LogError(ex, "Failed to commit Event Status Update to Database.");
                    throw;
                }
            }
        }
    }
}
