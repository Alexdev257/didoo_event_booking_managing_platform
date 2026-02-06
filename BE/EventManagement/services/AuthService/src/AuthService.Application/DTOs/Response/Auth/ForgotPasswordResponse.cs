using SharedContracts.Common.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.DTOs.Response.Auth
{
    public class ForgotPasswordResponse : CommonResponse<ForgotPasswordResponseDTO> { }

    public class ForgotPasswordResponseDTO
    {
        public string Key { get; set; }
    }
}
