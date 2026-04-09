using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace EmailService.Infrastructure.Services
{
    public class EmailSender
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public EmailSender(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task SendAsync(string to, string subject, string body)
        {
            var apiKey = _configuration["MailJet:ApiKey"] ?? _configuration["Mailjet:ApiKey"];
            var apiSecret = _configuration["MailJet:ApiSecret"] ?? _configuration["Mailjet:ApiSecret"];
            var fromEmail = _configuration["MailJet:FromEmail"] ?? _configuration["Email:From"];
            var displayName = _configuration["MailJet:DisplayName"] ?? _configuration["Email:DisplayName"] ?? "Event Management";
            var endpoint = _configuration["MailJet:SendEndpoint"] ?? "https://api.mailjet.com/v3.1/send";

            if (string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(apiSecret))
            {
                throw new InvalidOperationException("MailJet API credentials are missing.");
            }

            if (string.IsNullOrWhiteSpace(fromEmail))
            {
                throw new InvalidOperationException("Sender email is missing. Configure Email:From or MailJet:FromEmail.");
            }

            var payload = new
            {
                Messages = new[]
                {
                    new
                    {
                        From = new
                        {
                            Email = fromEmail,
                            Name = displayName
                        },
                        To = new[]
                        {
                            new { Email = to }
                        },
                        Subject = subject,
                        HTMLPart = body
                    }
                }
            };

            var authValue = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{apiKey}:{apiSecret}"));
            using var request = new HttpRequestMessage(HttpMethod.Post, endpoint);
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authValue);
            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            using var response = await _httpClient.SendAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"MailJet send failed: {(int)response.StatusCode} - {responseBody}");
            }
        }
    }
}
