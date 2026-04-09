using EventService.Application.DTOs.Response.FavoriteEvent;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.CQRS.Command.FavoriteEvent
{
    public class FavoriteSoftDeleteCommand : IRequest<FavoriteSoftDeleteResponse>
    {
        public Guid UserId { get; set; }
        public Guid EventId { get; set; }
    }
}
