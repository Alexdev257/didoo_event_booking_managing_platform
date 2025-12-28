using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TicketService.Application.CQRS.Query.TicketType;
using TicketService.Application.DTOs.Response.TicketType;
using TicketService.Application.Interfaces.Repositories;

namespace TicketService.Application.CQRS.Handler.TicketType
{
    public class TicketTypeGetAllQueryHandler : IRequestHandler<TicketTypeGetAllQuery, GetAllTicketTypeResponse>
    {
        private readonly ITicketUnitOfWork _unitOfWork;
        public TicketTypeGetAllQueryHandler(ITicketUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<GetAllTicketTypeResponse> Handle(TicketTypeGetAllQuery request, CancellationToken cancellationToken)
        {
            var result = _unitOfWork.TicketTypes.GetAllAsync();
            var dto = await result.Select(d => new TicketTypeDTO
            {
                Id = d.Id.ToString(),
                EventId = d.EventId.ToString(),
                Name = d.Name,
                Price = d.Price,
                TotalQuantity = d.TotalQuantity,
                AvailableQuantity = d.AvailableQuantity,
                Description = d.Description,
                CreatedAt = d.CreatedAt,
                UpdatedAt = d.UpdatedAt,
                IsDeleted = d.IsDeleted,
                DeletedAt = d.DeletedAt
            }).ToListAsync();

            return new GetAllTicketTypeResponse
            {
                IsSuccess = true,
                Message = "Retrieve Ticket Type Successfully!",
                Data = dto,
            };
        }
    }
}
