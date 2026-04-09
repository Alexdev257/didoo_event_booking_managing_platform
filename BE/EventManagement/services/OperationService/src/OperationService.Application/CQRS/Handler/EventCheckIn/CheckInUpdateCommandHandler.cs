using MediatR;
using OperationService.Application.CQRS.Command.EventCheckIn;
using OperationService.Application.DTOs.Response.EventCheckIn;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.CQRS.Handler.EventCheckIn
{
    public class CheckInUpdateCommandHandler : IRequestHandler<CheckInUpdateCommand, CheckInUpdateResponse>
    {
        public Task<CheckInUpdateResponse> Handle(CheckInUpdateCommand request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
