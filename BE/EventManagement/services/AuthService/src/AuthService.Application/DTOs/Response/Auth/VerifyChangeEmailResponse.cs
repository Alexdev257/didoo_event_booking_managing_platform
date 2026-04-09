using SharedContracts.Common.Wrappers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.DTOs.Response.Auth
{
    public class VerifyChangeEmailResponse : CommonResponse<VerifyChangeEmailResponseDTO> { }

    public class VerifyChangeEmailResponseDTO
    {
        public string? NewEmail { get; set; }
        public string? Otp { get; set; }
    }
}
