using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using SharedContracts.Protos;
using SharedInfrastructure;
using TicketService.Api.Grpc;
using TicketService.Api.Hubs;
using TicketService.Api.SignalRServices;
using TicketService.Application.Interfaces.SignalRServices;
using TicketService.Infrastructure.DependencyInjection;
using TicketService.Infrastructure.Persistence;

AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);
var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    bool isRunningInDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";
    if (isRunningInDocker)
    {
        options.ListenAnyIP(80, o => o.Protocols = HttpProtocols.Http1AndHttp2);
    }
    else
    {
        //options.ListenLocalhost(6200, o =>
        //{
        //    o.Protocols = HttpProtocols.Http1;
        //});

        //options.ListenLocalhost(6201, o =>
        //{
        //    o.UseHttps();
        //    o.Protocols = HttpProtocols.Http2;
        //});
        options.ListenLocalhost(6201, o => o.Protocols = HttpProtocols.Http1);
    }
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("SignalRPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Thay b?ng URL Frontend c?a b?n
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // B?t bu?c ph?i c� d�ng n�y cho SignalR
    });
});

var redisConnection = builder.Configuration.GetConnectionString("Redis");
builder.Services.AddSignalR()
    .AddStackExchangeRedis(redisConnection, options =>
    {
        options.Configuration.ChannelPrefix = "TicketService_SignalR";
    });

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddGrpc();
builder.Services.AddSharedInfrastructure(builder.Configuration);
builder.Services.AddTicketServiceInfrastructure(builder.Configuration);
builder.Services.AddScoped<ITicketHubService, TicketHubService>();
builder.Services.AddGrpcClient<EventGrpc.EventGrpcClient>(o =>
{
    // L?y URL t? bi?n m�i tr??ng (Docker)
    var url = Environment.GetEnvironmentVariable("GrpcSettings__EventServiceUrl");

    // N?u kh�ng c�, l?y t? appsettings.json (Local)
    if (string.IsNullOrEmpty(url))
    {
        url = builder.Configuration["GrpcSettings:EventServiceUrl"];
    }

    // Fallback n?u v?n null (M?c ??nh Docker)
    if (string.IsNullOrEmpty(url))
    {
        url = "http://event-service:80";
    }

    Console.WriteLine($"--> TicketService connecting to EventGrpc at: {url}");
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

app.UseCors("SignalRPolicy");
app.UseCors("AllowAll");

app.MapHub<TicketHub>("/hubs/ticket");

app.UseAuthentication();
app.UseAuthorization();


app.MapGrpcService<TicketGrpcService>();
app.MapControllers();

app.Run();
