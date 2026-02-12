using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc
    (
        "auth", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "Auth Service API",
            Version = "v1",
        }
    );
    c.SwaggerDoc
    (
        "events", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "Event Service API",
            Version = "v1",
        }
    );
    c.SwaggerDoc
    (
        "tickets", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "Ticket Service API",
            Version = "v1",
        }
    );
    c.SwaggerDoc
    (
        "bookings", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "Booking Service API",
            Version = "v1",
        }
    );
    c.SwaggerDoc
    (
        "payments", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "Payment Service API",
            Version = "v1",
        }
    );
});

// Add CORS (Cho phép Frontend g?i)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/auth-service/swagger/v1/swagger.json", "Auth Service API");
        options.SwaggerEndpoint("/event-service/swagger/v1/swagger.json", "Event Service API");
        options.SwaggerEndpoint("/ticket-service/swagger/v1/swagger.json", "Tickets Service API");
        options.SwaggerEndpoint("/booking-service/swagger/v1/swagger.json", "Bookings Service API");
        options.SwaggerEndpoint("/payment-service/swagger/v1/swagger.json", "Payments Service API");
        options.SwaggerEndpoint("/operation-service/swagger/v1/swagger.json", "Operations Service API");
        options.ConfigObject.AdditionalItems["syntaxHighlight"] = false;
    });
}
//app.UseHttpsRedirection();
app.UseCors("AllowAll");

// 2. Kích ho?t YARP Middleware
app.MapReverseProxy();

app.Run();