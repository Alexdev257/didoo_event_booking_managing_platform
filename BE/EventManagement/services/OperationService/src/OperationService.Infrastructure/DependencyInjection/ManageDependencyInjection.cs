using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using OperationService.Application.Interfaces.Repositories;
using OperationService.Infrastructure.Implements.Repositories;
//using OperationService.Infrastructure.Consumers;
using OperationService.Infrastructure.Persistence;
using SharedContracts.Common.Wrappers;
using SharedInfrastructure.Bus;
using SharedInfrastructure.Swagger;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using SharedContracts.Protos;
using OperationService.Infrastructure.MessageConsumers;

namespace OperationService.Infrastructure.DependencyInjection
{
    public static class ManageDependencyInjection
    {
        public static IServiceCollection AddOperationServiceInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDatabase(configuration);
            services.AddScopedInterface();
            services.AddMediatRInfrastructure(configuration);
            services.AddCorsExtentions();
            services.AddJwtAuthentication(configuration);
            services.AddAuthorizationRole();
            services.AddSharedSwaggerGen("Operation Service API");

            services.AddMessageBus(configuration, typeof(BookingSuccessEventConsumer).Assembly);

            services.AddGrpcClient<global::SharedContracts.Protos.AuthGrpc.AuthGrpcClient>(o =>
            {
                var url = GetServiceUrl(configuration, "AuthServiceUrl", "http://auth-service:81");
                o.Address = new Uri(url);
            });
            services.AddGrpcClient<global::SharedContracts.Protos.EventGrpc.EventGrpcClient>(o =>
            {
                var url = GetServiceUrl(configuration, "EventServiceUrl", "http://event-service:81");
                o.Address = new Uri(url);
            });
            services.AddGrpcClient<global::SharedContracts.Protos.BookingGrpc.BookingGrpcClient>(o =>
            {
                var url = GetServiceUrl(configuration, "BookingServiceUrl", "http://booking-service:81");
                o.Address = new Uri(url);
            });
            
            return services;
        }

        private static string GetServiceUrl(IConfiguration configuration, string serviceKey, string defaultUrl)
        {
            // Check multiple possible config keys / env var patterns used across compose files
            var envHttpClient = Environment.GetEnvironmentVariable($"HttpClientSettings__{serviceKey}");
            if (!string.IsNullOrEmpty(envHttpClient)) return envHttpClient;

            var envGrpc = Environment.GetEnvironmentVariable($"GrpcSettings__{serviceKey}");
            if (!string.IsNullOrEmpty(envGrpc)) return envGrpc;

            var cfgHttpClient = configuration[$"HttpClientSettings:{serviceKey}"];
            if (!string.IsNullOrEmpty(cfgHttpClient)) return cfgHttpClient;

            var cfgGrpc = configuration[$"GrpcSettings:{serviceKey}"];
            if (!string.IsNullOrEmpty(cfgGrpc)) return cfgGrpc;

            return defaultUrl;
        }

        private static void AddDatabase(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseMySql(configuration.GetConnectionString("DefaultConnection"),
                    ServerVersion.AutoDetect(configuration.GetConnectionString("DefaultConnection")));
            });

            services.AddScoped<DbContext>(provider => provider.GetService<ApplicationDbContext>()!);
        }

        private static void AddScopedInterface(this IServiceCollection service)
        {
            service.AddScoped<IOperationUnitOfWork, UnitOfWork>();
            service.AddScoped<OperationService.Application.Interfaces.Services.IExternalGrpcService, OperationService.Infrastructure.Services.ExternalGrpcService>();
        }


        private static void AddMediatRInfrastructure(this IServiceCollection service, IConfiguration config)
        {
            var applicationAssembly = Assembly.Load("OperationService.Application");

            service.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(applicationAssembly);
            });
        }

        private static void AddCorsExtentions(this IServiceCollection service)
        {
            service.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    policy => policy.SetIsOriginAllowed(origin => true)
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
            });
        }

        private static void AddJwtAuthentication(this IServiceCollection service, IConfiguration configuration)
        {
            var jwtSettings = configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]!);

            service.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.SaveToken = true;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = true,
                        ValidIssuer = jwtSettings["Issuer"],
                        ValidateAudience = true,
                        ValidAudience = jwtSettings["Audience"],
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero,

                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];
                            var path = context.HttpContext.Request.Path;
                            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                            {
                                context.Token = accessToken;
                            }
                            return Task.CompletedTask;
                        },
                        OnAuthenticationFailed = context =>
                        {
                            if (context.Exception.GetType() == typeof(SecurityTokenExpiredException))
                                context.Response.Headers.Add("Token-Expired", "true");
                            return Task.CompletedTask;
                        },
                        // 1. Xử lý khi chưa đăng nhập hoặc Token sai (401 Unauthorized)
                        OnChallenge = context =>
                        {
                            // Ngăn chặn hành vi mặc định (trả về rỗng)
                            context.HandleResponse();

                            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                            context.Response.ContentType = "application/json";

                            var response = new
                            {
                                isSuccess = false,
                                message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại hoặc làm mới Token.",
                                data = (object?)null,
                                listErrors = Array.Empty<object>()
                            };

                            return context.Response.WriteAsync(JsonSerializer.Serialize(response));
                        },

                        // 2. Xử lý khi đã đăng nhập nhưng không đủ quyền (403 Forbidden)
                        OnForbidden = context =>
                        {
                            context.Response.StatusCode = StatusCodes.Status403Forbidden;
                            context.Response.ContentType = "application/json";

                            var response = new
                            {
                                isSuccess = false,
                                message = "You are not allowed to access this endpoint.",
                                data = (object?)null,
                                listErrors = Array.Empty<object>()
                            };

                            return context.Response.WriteAsync(JsonSerializer.Serialize(response));
                        }
                    };
                });
        }

        private static void AddAuthorizationRole(this IServiceCollection service)
        {
            service.AddAuthorization(options =>
            {
                options.AddPolicy("AdminOnly", policy => policy.RequireClaim("Role", "1"));
                options.AddPolicy("UserOnly", policy => policy.RequireClaim("Role", "2"));
                options.AddPolicy("OrganizerOnly", policy => policy.RequireClaim("IsOrganizer", "true"));
                options.AddPolicy("AdminOrOrganizer", policy =>
                    policy.RequireAssertion(context =>
                        context.User.HasClaim(c => c.Type == "Role" && c.Value == "1") ||
                        context.User.HasClaim(c => c.Type == "IsOrganizer" && c.Value == "true")
                    ));
            });
        }
    }
}
