
using EventService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure.Persistence.Interceptors;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        private readonly AuditableEntityInterceptor _auditableEntityInterceptor;
        public ApplicationDbContext()
        {
        }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options,
            AuditableEntityInterceptor auditableEntityInterceptor): base(options)
        {
            _auditableEntityInterceptor = auditableEntityInterceptor;
        }

        public virtual DbSet<Category> Users { get; set; }
        public virtual DbSet<Event> Events { get; set; }
        public virtual DbSet<EventLocaltion> EventLocations { get; set; }
        public virtual DbSet<EventReview> EventReviews { get; set; }
        public virtual DbSet<FavoriteEvent> FavoriteEvents { get; set; }
        public virtual DbSet<Organizer> Organizers { get; set; }
        public virtual DbSet<UserEventInteraction> UserEventInteractions { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // Kích hoạt Interceptor tự động điền ngày giờ
            optionsBuilder.AddInterceptors(_auditableEntityInterceptor);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Tự động tìm RoleConfig và UserConfig để chạy
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
            base.OnModelCreating(modelBuilder);
        }
    }
}
