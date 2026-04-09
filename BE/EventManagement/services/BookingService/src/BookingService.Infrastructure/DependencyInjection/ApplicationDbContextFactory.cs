using BookingService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using SharedInfrastructure.Persistence.Interceptors;
using SharedInfrastructure.Services;

namespace BookingService.Infrastructure.DependencyInjection
{
    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseMySql(
                "Server=localhost;Database=booking_db;User=root;Password=root;",
                new MySqlServerVersion(new Version(8, 0, 0))
            );

            var interceptor = new AuditableEntityInterceptor(new DesignTimeCurrentUserService());
            return new ApplicationDbContext(optionsBuilder.Options, interceptor);
        }

        private sealed class DesignTimeCurrentUserService : ICurrentUserService
        {
            public string? UserId => null;
        }
    }
}
