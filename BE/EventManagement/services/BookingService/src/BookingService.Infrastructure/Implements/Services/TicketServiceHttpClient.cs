using BookingService.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BookingService.Infrastructure.Implements.Services
{
    public class TicketServiceHttpClient : ITicketServiceClient
    {
        private readonly HttpClient _httpClient;

        public TicketServiceHttpClient(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;

            var url = Environment.GetEnvironmentVariable("HttpClientSettings__TicketServiceUrl")
                      ?? configuration["HttpClientSettings:TicketServiceUrl"]
                      ?? "http://ticket-service:80";

            _httpClient.BaseAddress = new Uri(url);
            Console.WriteLine($"--> BookingService HttpClient connecting to TicketService at: {url}");
        }

        public async Task<TicketDecrementResult> CheckAndDecrementAsync(Guid ticketTypeId, int quantity, CancellationToken cancellationToken = default)
        {
            var body = JsonSerializer.Serialize(new { quantity });
            var content = new StringContent(body, Encoding.UTF8, "application/json");

            var response = await _httpClient.PatchAsync($"/api/tickettypes/{ticketTypeId}/decrement", content, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return new TicketDecrementResult
                {
                    IsAvailable = false,
                    Message = $"TicketService returned {(int)response.StatusCode}"
                };
            }

            var raw = await response.Content.ReadFromJsonAsync<TicketDecrementHttpResponse>(cancellationToken: cancellationToken);

            if (raw?.Data == null)
            {
                return new TicketDecrementResult
                {
                    IsAvailable = false,
                    Message = raw?.Message ?? "Invalid response from TicketService"
                };
            }

            return new TicketDecrementResult
            {
                IsAvailable = raw.Data.IsAvailable,
                Message = raw.Data.Message,
                RemainingQuantity = raw.Data.RemainingQuantity,
                PricePerTicket = raw.Data.PricePerTicket
            };
        }

        // Internal DTO matching TicketService response shape
        private class TicketDecrementHttpResponse
        {
            [JsonPropertyName("isSuccess")] public bool IsSuccess { get; set; }
            [JsonPropertyName("message")] public string? Message { get; set; }
            [JsonPropertyName("data")] public TicketDecrementDataDTO? Data { get; set; }
        }

        private class TicketDecrementDataDTO
        {
            [JsonPropertyName("isAvailable")] public bool IsAvailable { get; set; }
            [JsonPropertyName("message")] public string? Message { get; set; }
            [JsonPropertyName("remainingQuantity")] public int RemainingQuantity { get; set; }
            [JsonPropertyName("pricePerTicket")] public decimal PricePerTicket { get; set; }
        }
    }
}
