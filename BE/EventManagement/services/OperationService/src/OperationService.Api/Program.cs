using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using OperationService.Api.Hubs;
using OperationService.Api.SignalRServices;
using OperationService.Application.Interfaces.SignalRServices;
using OperationService.Infrastructure.DependencyInjection;
using OperationService.Infrastructure.Persistence;
using SharedInfrastructure;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    bool isRunningInDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";
    if (isRunningInDocker)
    {
        // Port 80: REST API (HTTP 1.1)
        options.ListenAnyIP(80, o => o.Protocols = HttpProtocols.Http1);

        // Port 81: gRPC (HTTP 2)
        options.ListenAnyIP(81, o => o.Protocols = HttpProtocols.Http2);
    }
    else
    {
        // Port 6501: REST API / SignalR
        options.ListenLocalhost(6501, o => o.Protocols = HttpProtocols.Http1);

        // Port 6502: gRPC Server (if any)
        options.ListenLocalhost(6502, o => o.Protocols = HttpProtocols.Http2);
    }
});

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


var redisConnection = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConnection))
{
    builder.Services.AddSignalR()
        .AddStackExchangeRedis(redisConnection, options =>
        {
            options.Configuration.ChannelPrefix = "OperationService_SignalR";
        });
}
else
{
    builder.Services.AddSignalR();
}

builder.Services.AddSharedInfrastructure(builder.Configuration);
builder.Services.AddOperationServiceInfrastructure(builder.Configuration);

builder.Services.AddScoped<INotificationHubService, NotificationHubService>();

AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);
builder.Services.AddGrpc();
builder.Services.AddGrpcClient<SharedContracts.Protos.AuthGrpc.AuthGrpcClient>(o =>
{
    var url = Environment.GetEnvironmentVariable("GrpcSettings__AuthServiceUrl") 
              ?? builder.Configuration["GrpcSettings:AuthServiceUrl"] 
              ?? "http://auth-service:80";
    Console.WriteLine($"--> OperationService connecting to AuthGrpc at: {url}");
    o.Address = new Uri(url);
});

builder.Services.AddGrpcClient<SharedContracts.Protos.EventGrpc.EventGrpcClient>(o =>
{
    var url = Environment.GetEnvironmentVariable("GrpcSettings__EventServiceUrl") 
              ?? builder.Configuration["GrpcSettings:EventServiceUrl"] 
              ?? "http://event-service:80";
    Console.WriteLine($"--> OperationService connecting to EventGrpc at: {url}");
    o.Address = new Uri(url);
});

var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var conn = db.Database.GetConnectionString();
    Console.WriteLine($"?? Connection string: {conn}");

    var pending = db.Database.GetPendingMigrations().ToList();
    Console.WriteLine($"?? Pending migrations: {pending.Count}");

    if (pending.Any())
    {
        Console.WriteLine("?? Running database migrations...");
        db.Database.Migrate();
        Console.WriteLine("? Migration completed.");
    }
    else
    {
        Console.WriteLine("? No pending migrations.");
    }
}

app.UseSharedInfrastructure();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();


app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapHub<NotificationHub>("/hubs/notification");

app.MapControllers();

app.Run();
