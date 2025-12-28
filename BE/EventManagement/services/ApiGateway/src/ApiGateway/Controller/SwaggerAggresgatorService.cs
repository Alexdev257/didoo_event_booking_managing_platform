//using Microsoft.OpenApi;
//using Microsoft.OpenApi.Readers;

//namespace ApiGateway.Services
//{
//    public class SwaggerAggregatorService
//    {
//        private readonly IHttpClientFactory _httpClientFactory;
//        private readonly IConfiguration _configuration;

//        public SwaggerAggregatorService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
//        {
//            _httpClientFactory = httpClientFactory;
//            _configuration = configuration;
//        }

//        public async Task<string> GetAggregatedSwaggerAsync()
//        {
//            var swaggerEndpoints = _configuration.GetSection("SwaggerEndPoints").Get<List<SwaggerEndPoint>>();

//            if (swaggerEndpoints == null || !swaggerEndpoints.Any())
//                return "{}";

//            OpenApiDocument mergedDocument = null;

//            foreach (var endpoint in swaggerEndpoints)
//            {
//                foreach (var config in endpoint.Config)
//                {
//                    var swaggerDoc = await FetchSwaggerDocumentAsync(config.Url);

//                    if (swaggerDoc != null)
//                    {
//                        if (mergedDocument == null)
//                        {
//                            mergedDocument = swaggerDoc;
//                            mergedDocument.Info.Title = "All Services API";
//                            mergedDocument.Info.Description = "Aggregated API documentation for all microservices";
//                        }
//                        else
//                        {
//                            MergeDocuments(mergedDocument, swaggerDoc, config.Name);
//                        }
//                    }
//                }
//            }

//            if (mergedDocument == null)
//                return "{}";

//            return SerializeDocument(mergedDocument);
//        }

//        private async Task<OpenApiDocument> FetchSwaggerDocumentAsync(string url)
//        {
//            try
//            {
//                var handler = new HttpClientHandler
//                {
//                    ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
//                };
//                var httpClient = new HttpClient(handler)
//                {
//                    Timeout = TimeSpan.FromSeconds(10)
//                };

//                var response = await httpClient.GetAsync(url);

//                if (!response.IsSuccessStatusCode)
//                    return null;

//                var stream = await response.Content.ReadAsStreamAsync();
//                var openApiDocument = new OpenApiDocument().Read(stream, out var diagnostic);

//                return openApiDocument;
//            }
//            catch (Exception ex)
//            {
//                Console.WriteLine($"Error fetching swagger from {url}: {ex.Message}");
//                return null;
//            }
//        }

//        private void MergeDocuments(OpenApiDocument target, OpenApiDocument source, string serviceTag)
//        {
//            // Merge Paths
//            foreach (var path in source.Paths)
//            {
//                var pathKey = path.Key;

//                if (target.Paths.ContainsKey(pathKey))
//                {
//                    // Nếu path đã tồn tại, merge operations
//                    foreach (var operation in path.Value.Operations)
//                    {
//                        if (!target.Paths[pathKey].Operations.ContainsKey(operation.Key))
//                        {
//                            AddServiceTag(operation.Value, serviceTag);
//                            target.Paths[pathKey].Operations.Add(operation.Key, operation.Value);
//                        }
//                    }
//                }
//                else
//                {
//                    // Thêm path mới
//                    foreach (var operation in path.Value.Operations)
//                    {
//                        AddServiceTag(operation.Value, serviceTag);
//                    }
//                    target.Paths.Add(pathKey, path.Value);
//                }
//            }

//            // Merge Components/Schemas
//            if (source.Components?.Schemas != null)
//            {
//                if (target.Components == null)
//                    target.Components = new OpenApiComponents();

//                if (target.Components.Schemas == null)
//                    target.Components.Schemas = new Dictionary<string, OpenApiSchema>();

//                foreach (var schema in source.Components.Schemas)
//                {
//                    var schemaKey = $"{serviceTag}_{schema.Key}";

//                    if (!target.Components.Schemas.ContainsKey(schemaKey))
//                    {
//                        target.Components.Schemas.Add(schemaKey, schema.Value);
//                    }
//                }
//            }

//            // Merge Tags - SỬA LẠI PHẦN NÀY
//            if (source.Tags != null && source.Tags.Count > 0)
//            {
//                if (target.Tags == null)
//                    target.Tags = new HashSet<OpenApiTag>();

//                var targetTagsList = target.Tags.ToHashSet(); // Convert sang List để dễ thao tác

//                foreach (var tag in source.Tags)
//                {
//                    if (!targetTagsList.Any(t => t.Name == tag.Name))
//                    {
//                        targetTagsList.Add(tag);
//                    }
//                }

//                target.Tags = targetTagsList; // Gán lại
//            }
//        }

//        private void AddServiceTag(OpenApiOperation operation, string serviceTag)
//        {
//            if (operation.Tags == null)
//                operation.Tags = new HashSet<OpenApiTagReference>();

//            var tagsList = operation.Tags.ToHashSet(); // Convert sang List

//            if (!tagsList.Any(t => t.Name == serviceTag))
//            {
//                //tagsList.Add(new OpenApiTagReference { Name = serviceTag });
//            }

//            operation.Tags = tagsList; // Gán lại
//        }

//        private string SerializeDocument(OpenApiDocument document)
//        {
//            using var outputString = new StringWriter();
//            var writer = new OpenApiJsonWriter(outputString);
//            document.SerializeAsV3(writer);
//            return outputString.ToString();
//        }
//    }

//    // Models cho configuration
//    public class SwaggerEndPoint
//    {
//        public string Key { get; set; } = string.Empty;
//        public List<SwaggerConfig> Config { get; set; } = new();
//    }

//    public class SwaggerConfig
//    {
//        public string Name { get; set; } = string.Empty;
//        public string Version { get; set; } = string.Empty;
//        public string Url { get; set; } = string.Empty;
//    }
//}