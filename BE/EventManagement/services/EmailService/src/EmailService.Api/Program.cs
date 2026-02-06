using EmailService.Infrastructure.Consumers;
using EmailService.Infrastructure.Services;
using MassTransit;
using SharedInfrastructure.Bus;

var builder = WebApplication.CreateBuilder(args);

// 1. Register EmailSender
builder.Services.AddScoped<EmailSender>();

// 2. Register MassTransit (RabbitMQ) with Consumer Assembly
builder.Services.AddMessageBus(builder.Configuration, typeof(SendOtpRegisterConsumer).Assembly);

var app = builder.Build();

app.MapGet("/", () => "Notification Service is Running...");

app.Run();
