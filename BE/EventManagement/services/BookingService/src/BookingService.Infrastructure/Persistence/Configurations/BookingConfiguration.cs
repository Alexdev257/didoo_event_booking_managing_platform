﻿using BookingService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookingService.Infrastructure.Persistence.Configurations
{
    public class BookingConfiguration : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            builder.ToTable("Booking");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Id)
                .HasColumnName("id")
                .HasMaxLength(255)
                .HasConversion<string>();

            builder.Property(x => x.UserId)
                .HasColumnName("user_id")
                .HasConversion<string>();

            builder.Property(x => x.EventId)
                .HasColumnName("event_id")
                .HasConversion<string>();

            builder.Property(x => x.Fullname)
                .HasColumnName("fullname")
                .HasMaxLength(255);

            builder.Property(x => x.Email)
                .HasColumnName("email")
                .HasMaxLength(255);

            builder.Property(x => x.Phone)
                .HasColumnName("phone")
                .HasMaxLength(20);

            builder.Property(x => x.Amount)
                .HasColumnName("amount");

            builder.Property(x => x.TotalPrice)
                .HasColumnName("total_price")
                .HasPrecision(18, 2);

            builder.Property(x => x.Status)
                .HasColumnName("status")
                .HasConversion<string>()
                .HasMaxLength(100);

            builder.Property(x => x.PaidAt)
                .HasColumnName("paid_at");

            builder.Property(x => x.BookingType)
                .HasColumnName("booking_type")
                .HasConversion<string>()
                .HasMaxLength(50)
                .HasDefaultValue(BookingService.Domain.Enum.BookingTypeEnum.Normal);

            // Relationships
            builder.HasMany(x => x.BookingDetails)
                .WithOne(x => x.Booking)
                .HasForeignKey(x => x.BookingId)
                .OnDelete(DeleteBehavior.Restrict);

            // Auditable fields
            builder.Property(x => x.CreatedAt).HasColumnName("created_at");
            builder.Property(x => x.CreatedBy).HasColumnName("created_by");
            builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            builder.Property(x => x.IsDeleted).HasColumnName("is_deleted");
            builder.Property(x => x.DeletedAt).HasColumnName("deleted_at");

            builder.Ignore(x => x.DomainEvents);
        }
    }
}
