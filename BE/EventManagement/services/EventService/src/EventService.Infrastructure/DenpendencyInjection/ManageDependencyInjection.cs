using EventService.Application.Interfaces.Repositories;
using EventService.Infrastructure.Implements.Repositories;
using EventService.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using SharedContracts.Common.Wrappers;
using SharedInfrastructure.Bus;
using SharedInfrastructure.Swagger;
using System.Reflection;
using System.Text;
using System.Text.Json;
using EventService.Infrastructure.BackgroundJobs;
using SharedContracts.Common.Wrappers;

namespace EventService.Infrastructure.DependencyInjection
{
    public static class ManageDependencyInjection
    {

        public static IServiceCollection AddEventServiceInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDatabase(configuration);
            services.AddScopedInterface();
            services.AddMediatRInfrastructure(configuration);
            services.AddCorsExtentions();
            services.AddJwtAuthentication(configuration);
            services.AddAuthorizationRole();
            services.AddSharedSwaggerGen("Event Service API");
            services.AddMessageBus(configuration);
            
            // Đăng ký Background Service chạy CronJob
            services.AddHostedService<EventStatusUpdateBackgroundService>();
            
            return services;        
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
            service.AddScoped<IEventUnitOfWork, UnitOfWork>();

        }

        private static void AddMediatRInfrastructure(this IServiceCollection service, IConfiguration config)
        {
            var applicationAssembly = Assembly.Load("EventService.Application");

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

                            string errorMessage = "Bạn chưa đăng nhập. Vui lòng cung cấp Token hợp lệ.";
                            string errorCode = "UNAUTHORIZED";

                            // 2. Phân tích chi tiết nguyên nhân lỗi
                            if (context.AuthenticateFailure != null)
                            {
                                if (context.AuthenticateFailure is SecurityTokenExpiredException)
                                {
                                    errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại hoặc làm mới Token.";
                                    errorCode = "TOKEN_EXPIRED";
                                }
                                else if (context.AuthenticateFailure is SecurityTokenInvalidSignatureException)
                                {
                                    errorMessage = "Token không hợp lệ (Chữ ký bị sai).";
                                    errorCode = "INVALID_SIGNATURE";
                                }
                                else
                                {
                                    errorMessage = "Token không hợp lệ. Vui lòng đăng nhập lại.";
                                    errorCode = "INVALID_TOKEN";
                                }
                            }
                            // Trường hợp không có header Authorization
                            else if (!context.Request.Headers.ContainsKey("Authorization"))
                            {
                                errorMessage = "Không tìm thấy thông tin xác thực (Missing Authorization Header).";
                                errorCode = "MISSING_TOKEN";
                            }

                            var response = new
                            {
                                isSuccess = false,
                                message = errorMessage,
                                data = new { errorCode },
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