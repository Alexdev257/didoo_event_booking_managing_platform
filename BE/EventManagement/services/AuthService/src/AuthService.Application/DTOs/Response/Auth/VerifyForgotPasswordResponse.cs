using SharedContracts.Common.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.DTOs.Response.Auth
{
    public class VerifyForgotPasswordResponse : CommonResponse<VerifyForgotPasswordResponseDTO> { }
    public class VerifyForgotPasswordResponseDTO
    {
        public string Id { get; set; }
        public string Email { get; set; }
    }
}
