﻿using BookingService.Domain.Enum;
using SharedKernel.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookingService.Domain.Entities
{
    public class Booking : AuditableEntity
    {
        public Guid UserId { get; set; }
        public Guid EventId { get; set; }
        public string? Fullname { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public int Amount { get; set; }
        public decimal TotalPrice { get; set; }
        public BookingStatusEnum Status { get; set; } = BookingStatusEnum.Pending;
        public BookingTypeEnum BookingType { get; set; } = BookingTypeEnum.Normal;
        public DateTime? PaidAt { get; set; }
        public virtual ICollection<BookingDetail> BookingDetails { get; set; } = new List<BookingDetail>();
    }
}
