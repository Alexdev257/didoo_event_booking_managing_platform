using MediatR;
using PaymentService.Application.DTOs.Response.PaymentMethod;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PaymentService.Application.CQRS.Query.PaymentMethod
{
    public class PaymentMethodGetAllQuery : IRequest<GetAllPaymentMethodResponse>
    {
    }
}
