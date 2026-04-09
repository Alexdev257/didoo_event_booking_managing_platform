using AuthService.Application.DTOs.Response.Auth;
using AuthService.Application.Interfaces.Helpers;
using Google.Apis.Auth;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Infrastructure.Implements.Helpers
{
    public class GoogleOAuthHelper : IGoolgeOAuthHelper
    {
        private readonly IConfiguration _configuration;
        public GoogleOAuthHelper(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public async Task<GoogleTokenValidationResponse> ValidateGoogleTokenAsync(string googleToken)
        {
            var ClientID = _configuration["GoogleOAuth:ClientID"] ?? "";
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new List<string> { ClientID }
                };
                var payloads = await GoogleJsonWebSignature.ValidateAsync(googleToken, settings);

                if (payloads == null)
                    return new GoogleTokenValidationResponse
                    {
                        IsValid = false,
                        ErrorMessage = "Invalid or expired Google token"
                    };

                return new GoogleTokenValidationResponse
                {
                    IsValid = true,
                    Email = payloads.Email,
                    Name = payloads.Name,
                    Picture = payloads.Picture,
                    EmailVerified = payloads.EmailVerified
                };
            }
            catch (Exception ex)
            {
                return new GoogleTokenValidationResponse
                {
                    IsValid = false,
                    ErrorMessage = $"Google token validation failed: {ex.Message}"
                };
            }
        }
    }
}
