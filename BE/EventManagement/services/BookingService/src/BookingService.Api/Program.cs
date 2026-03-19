using BookingService.Api.Grpc;
using BookingService.Infrastructure.DependencyInjection;
using BookingService.Infrastructure.Persistence;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure;

AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);
var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    bool isDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";
    if (isDocker)
    {
        // Port 80: REST API (HTTP 1.1)
        options.ListenAnyIP(80, o => o.Protocols = HttpProtocols.Http1);
        
        // Port 81: gRPC (HTTP 2)
        options.ListenAnyIP(81, o => o.Protocols = HttpProtocols.Http2);
    }
    else
    {
        // Port 6301: REST API / Swagger
        options.ListenLocalhost(6301, o => o.Protocols = HttpProtocols.Http1);

        // Port 6302: gRPC Server
        options.ListenLocalhost(6302, o => o.Protocols = HttpProtocols.Http2);
    }
});

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddGrpc();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSharedInfrastructure(builder.Configuration);
builder.Services.AddBookingServiceInfrastructure(builder.Configuration);

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
          ?? builder.Configuration["GrpcSettings__EventServiceUrl"]
          ?? "http://event-service:81";
    Console.WriteLine($"--> BookingService connecting to EventGrpc at: {url}");
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

app.MapControllers();
app.MapGrpcService<BookingGrpcService>();

app.Run();
