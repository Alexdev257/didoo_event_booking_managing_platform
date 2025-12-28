using EmailService.Infrastructure.Consumers;
using EmailService.Infrastructure.Services;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);

// 1. ??ng ký EmailSender
builder.Services.AddScoped<EmailSender>();

// 2. ??ng ký MassTransit (RabbitMQ)
builder.Services.AddMassTransit(x =>
{
    // ??ng ký Consumer ?? l?ng nghe
    x.AddConsumer<SendOtpRegisterConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        // C?u hình k?t n?i RabbitMQ (L?y t? appsettings ho?c hardcode lúc dev)
        cfg.Host(builder.Configuration["RabbitMQ:Host"], "/", h => {
            h.Username(builder.Configuration["RabbitMQ:Username"]!);
            h.Password(builder.Configuration["RabbitMQ:Password"]!);
        });

        // T? ??ng t?o Queue d?a trên tên Consumer
        cfg.ConfigureEndpoints(context);
    });
});

var app = builder.Build();

app.MapGet("/", () => "Notification Service is Running...");

app.Run();