using MediatR;
using OperationService.Application.DTOs.Response.EventCheckIn;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.CQRS.Command.EventCheckIn
{
    public class CheckInDeleteCommand : IRequest<CheckInDeleteResponse>
    {
        public Guid Id { get; set; }
    }
}
