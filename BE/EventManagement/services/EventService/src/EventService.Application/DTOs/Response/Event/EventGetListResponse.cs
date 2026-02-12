using EventService.Domain.Entities;
using EventService.Domain.Enum;
using SharedContracts.Common.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EventService.Application.DTOs.Response.Event
{
    public class EventGetListResponse : CommonResponse<PaginationResponse<object>> { }

}
