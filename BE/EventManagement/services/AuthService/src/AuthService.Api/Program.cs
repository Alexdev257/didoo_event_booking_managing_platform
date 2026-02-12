using AuthService.Api.Grpc;
using AuthService.Infrastructure.DependencyInjection;
using AuthService.Infrastructure.Persistence;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using SharedInfrastructure;
using SharedInfrastructure.Bus;
using SharedInfrastructure.Swagger;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    // C�ch ki?m tra: N?u bi?n m�i tr??ng n�y t?n t?i = ?ang ch?y trong Docker
    //bool isRunningInDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";

    //if (isRunningInDocker)
    //{
    //    // === C?U H�NH CHO DOCKER ===
    //    // Port 80: REST API (HTTP 1.1)
    //    options.ListenAnyIP(80, listenOptions =>
    //    {
    //        listenOptions.Protocols = HttpProtocols.Http1;
    //    });

    //    // Port 81: gRPC (HTTP 2)
    //    options.ListenAnyIP(81, listenOptions =>
    //    {
    //        listenOptions.Protocols = HttpProtocols.Http2;
    //    });
    //}
    //else
    //{
    //    // === C?U H�NH CHO LOCALHOST (Visual Studio) ===
    //    // Port 6003: REST API (M?c ??nh HTTP 1.1, config cho ch?c)
    //    options.ListenLocalhost(6003, listenOptions =>
    //    {
    //        listenOptions.Protocols = HttpProtocols.Http1;
    //    });

    //    // Port 6004: gRPC (B?t bu?c �p sang HTTP 2)
    //    options.ListenLocalhost(6004, listenOptions =>
    //    {
    //        listenOptions.Protocols = HttpProtocols.Http2;
    //    });
    //}

    bool isRunningInDocker = Environment.GetEnvironmentVariable("DOTNET_RUNNING_IN_CONTAINER") == "true";

    if (isRunningInDocker)
    {
        // === S?A L?I ?O?N N�Y ===
        // Trong Docker: M? Port 80 cho C? HAI giao th?c (REST v� gRPC ch?y chung)
        options.ListenAnyIP(80, listenOptions =>
        {
            listenOptions.Protocols = HttpProtocols.Http1AndHttp2;
        });

        // B? ?o?n config Port 81 ?i v� kh�ng c?n thi?t n?a n?u g?p chung v�o 80
    }
    else
    {
        // Ch?y Localhost (Gi? nguy�n nh? c? ?? t�ch port n?u mu?n)
        options.ListenLocalhost(6003, listenOptions =>
        {
            listenOptions.Protocols = HttpProtocols.Http1;
        });

        options.ListenLocalhost(6004, listenOptions =>
        {
            listenOptions.Protocols = HttpProtocols.Http2;
        });
    }
});

//builder.WebHost.ConfigureKestrel(options =>
//{
//    // Cho ph�p HTTP1 v� HTTP2 tr�n c�ng m?t c?ng (H? tr? c? REST v� gRPC kh�ng c?n SSL)
//    options.ConfigureEndpointDefaults(listenOptions =>
//    {
//        listenOptions.Protocols = HttpProtocols.Http1AndHttp2;
//    });
//});

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
//builder.Services.AddSharedSwagger();

//builder.Services.AddMessageBus(builder.Configuration);

builder.Services.AddSharedInfrastructure(builder.Configuration);
builder.Services.AddAuthServiceInfrastructure(builder.Configuration);
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

app.MapGrpcService<AuthGrpcService>();
app.MapControllers();

app.Run();
