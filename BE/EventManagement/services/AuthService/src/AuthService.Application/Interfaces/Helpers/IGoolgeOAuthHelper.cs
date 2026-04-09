using AuthService.Application.DTOs.Response.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Application.Interfaces.Helpers
{
    public interface IGoolgeOAuthHelper
    {
        Task<GoogleTokenValidationResponse> ValidateGoogleTokenAsync(string googleToken);
    }
}
