//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using System.Text.Json;

//namespace ApiGateway.Controller
//{
//    [Route("swagger")]
//    [ApiController]
//    public class SwaggerAggregatorController : ControllerBase
//    {
//        private readonly IHttpClientFactory _httpClientFactory;
//        public SwaggerAggregatorController(IHttpClientFactory httpClientFactory)
//        {
//            _httpClientFactory = httpClientFactory;
//        }

//        [HttpGet("v1/swagger.json")]
//        public async Task<IActionResult> GetAggregatedSwagger()
//        {
//            var client = _httpClientFactory.CreateClient();

//            var authSwagger = await client.GetStringAsync("https://localhost:6002/swagger/v1/swagger.json");
//            var eventSwagger = await client.GetStringAsync("https://localhost:6100/swagger/v1/swagger.json");

//            var authDoc = JsonDocument.Parse(authSwagger);
//            var eventDoc = JsonDocument.Parse(eventSwagger);

//            // Merge swagger documents
//            var merged = MergeSwaggerDocuments(authDoc, eventDoc);

//            return Content(merged, "application/json");
//        }

//        private string MergeSwaggerDocuments(JsonDocument doc1, JsonDocument doc2)
//        {
//            // Logic để merge 2 swagger documents
//            // Bạn cần implement logic này dựa trên cấu trúc OpenAPI
//            // Hoặc sử dụng thư viện như Microsoft.OpenApi

//            return "{}"; // Placeholder
//        }
//    }
//}
