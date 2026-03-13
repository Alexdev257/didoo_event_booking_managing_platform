using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. C?u hình CORS (Ch? khai báo 1 l?n duy nh?t ? ?ây)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true) // Cho phép t?t c? Frontend
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // B?t bu?c cho SignalR
    });
});

// 2. Add Reverse Proxy
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

builder.Services.AddEndpointsApiExplorer();

// 3. Add Swagger Gen (G?P T?T C? VÀO ?ÂY)
builder.Services.AddSwaggerGen(c =>
{
    // --- KHAI BÁO CÁC DOCUMENT ---
    c.SwaggerDoc("auth", new OpenApiInfo { Title = "Auth Service API", Version = "v1" });
    c.SwaggerDoc("events", new OpenApiInfo { Title = "Event Service API", Version = "v1" });
    c.SwaggerDoc("tickets", new OpenApiInfo { Title = "Ticket Service API", Version = "v1" });
    c.SwaggerDoc("bookings", new OpenApiInfo { Title = "Booking Service API", Version = "v1" });
    c.SwaggerDoc("payments", new OpenApiInfo { Title = "Payment Service API", Version = "v1" });
    c.SwaggerDoc("resales", new OpenApiInfo { Title = "Resale Service API", Version = "v1" });
    c.SwaggerDoc("operation", new OpenApiInfo { Title = "Operations Service API", Version = "v1" });

    // --- C?U HÌNH SECURITY (AUTHORIZE BUTTON) ---
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nh?p token theo ??nh d?ng: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http, // ??i sang Http cho chu?n Bearer
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });

    // Fix l?i trùng tên Schema n?u có
    c.CustomSchemaIds(type => type.FullName);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        // Khai báo Endpoint ?? UI bi?t load file JSON nào
        options.SwaggerEndpoint("/auth-service/swagger/v1/swagger.json", "Auth Service API");
        options.SwaggerEndpoint("/event-service/swagger/v1/swagger.json", "Event Service API");
        options.SwaggerEndpoint("/ticket-service/swagger/v1/swagger.json", "Tickets Service API");
        options.SwaggerEndpoint("/booking-service/swagger/v1/swagger.json", "Bookings Service API");
        options.SwaggerEndpoint("/payment-service/swagger/v1/swagger.json", "Payments Service API");
        options.SwaggerEndpoint("/operation-service/swagger/v1/swagger.json", "Operations Service API");
        options.SwaggerEndpoint("/resale-service/swagger/v1/swagger.json", "Resales Service API");

        // T?t highlight code ?? load nhanh h?n (tùy ch?n)
        options.ConfigObject.AdditionalItems["syntaxHighlight"] = false;
    });
}

// Kích ho?t WebSockets cho SignalR
app.UseWebSockets();

// Kích ho?t CORS
app.UseCors("AllowAll");

// Kích ho?t YARP
app.MapReverseProxy();

app.Run();
