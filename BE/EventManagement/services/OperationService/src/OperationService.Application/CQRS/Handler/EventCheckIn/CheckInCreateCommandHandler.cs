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
    public class CheckInCreateCommandHandler : IRequestHandler<CheckInCreateCommand, CheckInCreateResponse>
    {
        public Task<CheckInCreateResponse> Handle(CheckInCreateCommand request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
