using AuthService.Application.Interfaces.Helpers;
using AuthService.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace AuthService.Infrastructure.Implements.Helpers
{
    public class JwtHelper : IJwtHelper
    {
        private readonly IConfiguration _configuration;
        private readonly SharedContracts.Protos.EventGrpc.EventGrpcClient _eventGrpcClient;

        public JwtHelper(IConfiguration configuration, SharedContracts.Protos.EventGrpc.EventGrpcClient eventGrpcClient)
        {
            _configuration = configuration;
            _eventGrpcClient = eventGrpcClient;
        }

        public async Task<string> GenerateAccessToken(User user)
        {
            var SecretKey = _configuration["JwtSettings:SecretKey"];
            var Issuer = _configuration["JwtSettings:Issuer"];
            var Audience = _configuration["JwtSettings:Audience"];

            var Key = Encoding.UTF8.GetBytes(SecretKey);
            var TokenHandler = new JwtSecurityTokenHandler();

            bool isVerifiedOrganizer = false;
            if (user.OrganizerId.HasValue)
            {
                try
                {
                    var response = await _eventGrpcClient.GetOrganizerStatusAsync(new SharedContracts.Protos.OrganizerStatusRequest
                    {
                        OrganizerId = user.OrganizerId.ToString()
                    });

                    // Consider verified if is_verified is true and status is Verified (2)
                    Console.WriteLine($"---------------------------------------------IsVerified: {response.IsVerified}");
                    Console.WriteLine($"---------------------------------------------Status: {response.Status}");
                    isVerifiedOrganizer = response.IsVerified && response.Status == 2;
                }
                catch (Exception ex)
                {
                    // Log error if needed, for now assume false
                    Console.WriteLine($"Error calling gRPC: {ex.Message}");
                    isVerifiedOrganizer = false;
                }
            }

            var TokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                new Claim(JwtRegisteredClaimNames.Jti,
                    Math.Abs(BitConverter.ToInt64(Guid.NewGuid().ToByteArray())).ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // REQUIRED for SignalR Context.UserIdentifier
                new Claim("UserId", user.Id.ToString()),
                new Claim("FullName", user.FullName),
                new Claim("Email", user.Email),
                new Claim("Role", ((int)user.Role.Name).ToString()),
                new Claim("IsOrganizer", isVerifiedOrganizer.ToString().ToLower()),
                new Claim("OrganizerId", user.OrganizerId?.ToString() ?? "")
            }),

                // expire in 1 hours
                Expires = DateTime.UtcNow.AddHours(1),
                Issuer = Issuer,
                Audience = Audience,
                SigningCredentials =
                    new SigningCredentials(new SymmetricSecurityKey(Key), SecurityAlgorithms.HmacSha256Signature)
            };

            var Token = TokenHandler.CreateToken(TokenDescriptor);
            var AccessToken = TokenHandler.WriteToken(Token);

            return AccessToken;
        }

        public string GenerateRefreshToken()
        {
            return Guid.NewGuid().ToString("N");
        }

        public bool IsTokenValid(string token)
        {
            throw new NotImplementedException();
        }

        public DateTime ConvertUnixTimeToDateTime(long utcExpiredDate)
        {
            var DateTimeInterval = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
            return DateTimeInterval.AddSeconds(utcExpiredDate).ToLocalTime();
        }

        public (bool, string?) ValidateToken(string AccessToken)
        {
            var SecretKey = _configuration["JwtSettings:SecretKey"];
            var SecretKeyBytes = Encoding.UTF8.GetBytes(SecretKey);
            var TokenHandler = new JwtSecurityTokenHandler();

            var tokenValidateParam = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(SecretKeyBytes),

                ValidateLifetime = false // ko kiem token het han
            };

            //Check: token valid format
            var tokenInVerification = TokenHandler.ValidateToken(AccessToken, tokenValidateParam, out var validatedToken);
            if (validatedToken == null) return (false, "Invalid format token!");

            //Check: algorithm
            if (validatedToken is not JwtSecurityToken jwtSecurityToken ||
                jwtSecurityToken.Header.Alg == null ||
                !jwtSecurityToken.Header.Alg.Equals(
                    SecurityAlgorithms.HmacSha256,
                    StringComparison.InvariantCultureIgnoreCase
                ))
                return (false, "Invalid Token Argorithm!");

            //Check: Access Token expired or not
            //var utcExpiredToken = long.Parse(tokenInVerification.Claims
            //    .FirstOrDefault(t => t.Type == JwtRegisteredClaimNames.Exp).Value);
            //var expiredDate = ConvertUnixTimeToDateTime(utcExpiredToken);

            //if (expiredDate > DateTime.UtcNow) return (false, "Access Token has not expired yet!");s
            return (true, null);
        }
    }
}
