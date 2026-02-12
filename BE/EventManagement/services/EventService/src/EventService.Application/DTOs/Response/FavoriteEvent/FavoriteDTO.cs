using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.DTOs.Response.FavoriteEvent
{
    public class FavoriteDTO
    {
        public string Id { get; set; }
        public FavoriteEventDTO Event { get; set; }
        public FavoriteUserDTO User { get; set; }
    }
}
