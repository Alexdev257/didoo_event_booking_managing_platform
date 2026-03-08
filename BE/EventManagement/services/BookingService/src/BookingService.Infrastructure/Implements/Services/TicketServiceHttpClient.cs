using BookingService.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
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
                string jsonString = response.Content.ToString()!;
                JObject json = JObject.Parse(jsonString);
                string message = json["message"]?.ToString()!;

                return new TicketDecrementResult
                {
                    IsAvailable = false,
                    Message = $"TicketService returned {(int)response.StatusCode} with Message : {message}"
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

        public async Task<TicketListingValidateResult> ValidateListingAsync(Guid listingId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync($"/api/ticketlistings/{listingId}/validate", cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return new TicketListingValidateResult
                {
                    IsAvailable = false,
                    Message = $"TicketService returned {(int)response.StatusCode} for listing validation."
                };
            }

            var raw = await response.Content.ReadFromJsonAsync<TicketListingValidateHttpResponse>(cancellationToken: cancellationToken);

            if (raw?.Data == null)
            {
                return new TicketListingValidateResult
                {
                    IsAvailable = false,
                    Message = raw?.Message ?? "Invalid response from TicketService"
                };
            }

            return new TicketListingValidateResult
            {
                IsAvailable = raw.Data.IsAvailable,
                Message = raw.Data.Message,
                TicketId = raw.Data.TicketId,
                EventId = raw.Data.EventId,
                AskingPrice = raw.Data.AskingPrice,
            };
        }

        public async Task<bool> MarkListingSoldAsync(Guid listingId, Guid newOwnerUserId, CancellationToken cancellationToken = default)
        {
            var body = JsonSerializer.Serialize(new { NewOwnerUserId = newOwnerUserId });
            var content = new StringContent(body, Encoding.UTF8, "application/json");

            var response = await _httpClient.PatchAsync($"/api/ticketlistings/{listingId}/mark-sold", content, cancellationToken);
            return response.IsSuccessStatusCode;
        }

        public async Task<BulkCreateTicketsResult> BulkCreateTicketsAsync(BulkCreateTicketsRequest bulkRequest, CancellationToken cancellationToken = default)
        {
            var body = JsonSerializer.Serialize(new
            {
                ticketTypeId = bulkRequest.TicketTypeId,
                eventId = bulkRequest.EventId,
                ownerId = bulkRequest.OwnerId,
                quantity = bulkRequest.Quantity,
                zone = bulkRequest.Zone,
            });
            var content = new StringContent(body, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/api/tickets/internal/bulk-create", content, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                return new BulkCreateTicketsResult
                {
                    IsSuccess = false,
                    Message = $"TicketService returned {(int)response.StatusCode} for bulk-create."
                };
            }

            var raw = await response.Content.ReadFromJsonAsync<BulkCreateTicketsHttpResponse>(cancellationToken: cancellationToken);
            if (raw == null)
            {
                return new BulkCreateTicketsResult { IsSuccess = false, Message = "Invalid response from TicketService." };
            }

            return new BulkCreateTicketsResult
            {
                IsSuccess = raw.IsSuccess,
                Message = raw.Message,
                CreatedTicketIds = raw.Data ?? new List<string>()
            };
        }

        // Internal DTOs matching TicketService response shapes
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

        private class TicketListingValidateHttpResponse
        {
            [JsonPropertyName("isSuccess")] public bool IsSuccess { get; set; }
            [JsonPropertyName("message")] public string? Message { get; set; }
            [JsonPropertyName("data")] public TicketListingValidateDataDTO? Data { get; set; }
        }

        private class TicketListingValidateDataDTO
        {
            [JsonPropertyName("isAvailable")] public bool IsAvailable { get; set; }
            [JsonPropertyName("message")] public string? Message { get; set; }
            [JsonPropertyName("ticketId")] public string? TicketId { get; set; }
            [JsonPropertyName("eventId")] public string? EventId { get; set; }
            [JsonPropertyName("askingPrice")] public decimal AskingPrice { get; set; }
        }

        private class BulkCreateTicketsHttpResponse
        {
            [JsonPropertyName("isSuccess")] public bool IsSuccess { get; set; }
            [JsonPropertyName("message")] public string? Message { get; set; }
            [JsonPropertyName("data")] public List<string>? Data { get; set; }
        }
    }
}
