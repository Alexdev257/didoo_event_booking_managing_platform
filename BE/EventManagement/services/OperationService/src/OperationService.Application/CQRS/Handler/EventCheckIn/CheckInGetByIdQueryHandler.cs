using MediatR;
using OperationService.Application.CQRS.Query.EventCheckIn;
using OperationService.Application.DTOs.Response.EventCheckIn;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OperationService.Application.CQRS.Handler.EventCheckIn
{
    public class CheckInGetByIdQueryHandler : IRequestHandler<CheckInGetByIdQuery, CheckInGetByIdResponse>
    {
        public Task<CheckInGetByIdResponse> Handle(CheckInGetByIdQuery request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
