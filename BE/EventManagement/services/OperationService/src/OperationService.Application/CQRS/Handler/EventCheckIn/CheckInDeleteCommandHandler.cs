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
    public class CheckInDeleteCommandHandler : IRequestHandler<CheckInDeleteCommand, CheckInDeleteResponse>
    {
        public Task<CheckInDeleteResponse> Handle(CheckInDeleteCommand request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
