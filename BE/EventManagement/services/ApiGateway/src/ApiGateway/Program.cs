using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using MMLib.SwaggerForOcelot.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);


builder.Configuration.SetBasePath(builder.Environment.ContentRootPath)
                     .AddJsonFile("appsettings.json", true, true)
                     .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", true, true)
                     .AddJsonFile("Configuration/ocelot.global.json", false, true)
                     .AddJsonFile($"Configuration/Routes/ocelot.auth.json", false, true)
                     .AddJsonFile($"Configuration/Routes/ocelot.events.json", false, true)
                     .AddJsonFile($"Configuration/ocelot.SwaggerEndPoints.json", false, true)
                     .AddEnvironmentVariables();

builder.Services.AddSwaggerForOcelot(builder.Configuration);

//builder.Services.AddSharedSwagger();

builder.Services.AddControllers();
builder.Services.AddOcelot(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});

var app = builder.Build();
app.UseCors("CorsPolicy");

app.UseSwaggerForOcelotUI(opt =>
{
    opt.PathToSwaggerGenerator = "/swagger/docs";
    //opt.ReConfigureUpstreamSwaggerJson = VirtualPathExtensions.OcelotSwaggerSupport;
    //opt.DownstreamSwaggerHeaders = new[]
    //{
    //    new KeyValuePair<string, string>("Accept", "application/json"),
    //};
});
await app.UseOcelot();
//app.UseOcelot().Wait();
app.Run();