using EventService.Api.Grpc;
using EventService.Infrastructure.DependencyInjection;
using EventService.Infrastructure.Persistence;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using SharedContracts.Protos;
using SharedInfrastructure;
using SharedInfrastructure.Swagger;


//AppContext.SetSwitch("System.Net.Http.SocketsHttpHandler.Http2UnencryptedSupport", true);

//var builder = WebApplication.CreateBuilder(args);
//builder.WebHost.ConfigureKestrel(options =>
//{
//    options.ConfigureEndpointDefaults(listenOptions =>
//    {
//        listenOptions.Protocols = HttpProtocols.Http1AndHttp2;
//    });
//});


//builder.Services.AddGrpcClient<AuthGrpc.AuthGrpcClient>(o =>
//{
//    var url = builder.Configuration["GrpcSettings:AuthServiceUrl"];
//    if (string.IsNullOrEmpty(url))
//    {
//        url = "http://auth-service:81";
//    }

//    // 3. G�n ??a ch? v�o
//    o.Address = new Uri(url);
//});

//builder.Services.AddGrpcClient<AuthGrpc.AuthGrpcClient>(o =>
//{
//    // 1. ?u ti�n l?y t? bi?n m�i tr??ng (Docker Compose set c�i n�y)
//    var url = Environment.GetEnvironmentVariable("GrpcSettings__AuthServiceUrl");

//    // 2. N?u kh�ng c�, l?y t? appsettings.json (Ch?y Local)
//    if (string.IsNullOrEmpty(url))
//    {
//        url = builder.Configuration["GrpcSettings:AuthServiceUrl"];
//    }

//    // 3. Fallback c?ng n?u null (ph�ng h?)
//    if (string.IsNullOrEmpty(url))
//    {
//        // Trong Docker, auth-service ch?y port 80 (do ta ?� config Kestrel Http1AndHttp2 ? port 80)
//        url = "http://auth-service:80";
//    }

//    Console.WriteLine($"--> Connecting to AuthGrpc at: {url}");
//    o.Address = new Uri(url);
//});

// 1. B?T BU?C: Cho ph�p gRPC qua HTTP th??ng (kh�ng b?o m?t)
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
        // === THÊM ĐOẠN NÀY CHO LOCALHOST ===
        // Port 6101: REST API / Swagger
        options.ListenLocalhost(6101, o => o.Protocols = HttpProtocols.Http1);

        // Port 6102: gRPC Server (Để TicketService gọi vào)
        options.ListenLocalhost(6102, o => o.Protocols = HttpProtocols.Http2);
    }
});

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//builder.Services.AddSharedSwagger();

builder.Services.AddSharedInfrastructure(builder.Configuration);
builder.Services.AddEventServiceInfrastructure(builder.Configuration);

//builder.Services.AddGrpcClient<AuthGrpc.AuthGrpcClient>(o =>
//{
//    var url = builder.Configuration["GrpcSettings:AuthServiceUrl"];
//    if (string.IsNullOrEmpty(url))
//    {
//        url = "http://auth-service:81";
//    }

//    // 3. G�n ??a ch? v�o
//    o.Address = new Uri(url);
//});

// 3. S?a logic l?y URL k?t n?i gRPC
builder.Services.AddGrpcClient<AuthGrpc.AuthGrpcClient>(o =>
{
    // ?u ti�n l?y t? bi?n m�i tr??ng Docker tr??c (GrpcSettings__AuthServiceUrl)
    var url = Environment.GetEnvironmentVariable("GrpcSettings__AuthServiceUrl");

    // N?u kh�ng c� (ch?y local), l?y t? appsettings.json
    if (string.IsNullOrEmpty(url))
    {
        url = builder.Configuration["GrpcSettings:AuthServiceUrl"];
    }

    // Fallback cu?i c�ng n?u v?n null
    if (string.IsNullOrEmpty(url))
    {
        // M?c ??nh trong Docker n?u kh�ng config g� c?
        url = "http://auth-service:80";
    }

    Console.WriteLine($"--> EventService connecting to AuthGrpc at: {url}");
    o.Address = new Uri(url);
});


builder.Services.AddGrpc();




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
app.MapGrpcService<EventGrpcService>();

app.MapControllers();

app.Run();
