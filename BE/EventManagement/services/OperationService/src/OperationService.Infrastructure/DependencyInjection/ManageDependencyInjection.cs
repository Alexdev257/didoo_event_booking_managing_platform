using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using OperationService.Application.Interfaces.Repositories;
using OperationService.Infrastructure.Implements.Repositories;
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

            //services.AddMessageBus(configuration);
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
            service.AddScoped<IOperationUnitOfWork, UnitOfWork>();

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
                    policy => policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader());
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
            ////1 admin
            ////2 teacher
            ////3 sttudent
            //service.AddAuthorization(options =>
            //{
            //    options.AddPolicy("AdminOnly", policy => { policy.RequireClaim("RoleId", "1".ToLower()); });

            //    options.AddPolicy("TeacherOnly", policy => { policy.RequireClaim("RoleId", "2".ToLower()); });

            //    options.AddPolicy("StudentOnly", policy => { policy.RequireClaim("RoleId", "3".ToLower()); });

            //    options.AddPolicy("AdminOrTeacher", policy =>
            //        policy.RequireAssertion(context =>
            //        {
            //            var roleClaim = context.User.FindFirst(c => c.Type == "RoleId")?.Value;
            //            //return roleClaim != "User";
            //            return roleClaim == "1".ToLower() || roleClaim == "2".ToLower();
            //        }));

            //    options.AddPolicy("AdminOrStudent", policy =>
            //        policy.RequireAssertion(context =>
            //        {
            //            var roleClaim = context.User.FindFirst(c => c.Type == "RoleId")?.Value;
            //            //return roleClaim != "User";
            //            return roleClaim == "1".ToLower() || roleClaim == "3".ToLower();
            //        }));

            //    options.AddPolicy("TeacherOrStudent", policy =>
            //        policy.RequireAssertion(context =>
            //        {
            //            var roleClaim = context.User.FindFirst(c => c.Type == "RoleId")?.Value;
            //            //return roleClaim != "User";
            //            return roleClaim == "2".ToLower() || roleClaim == "3".ToLower();
            //        }));

            //    options.AddPolicy("AllRole", policy =>
            //        policy.RequireAssertion(context =>
            //        {
            //            var roleClaim = context.User.FindFirst(c => c.Type == "RoleId")?.Value;
            //            //return roleClaim != "Admin";
            //            return roleClaim == "1".ToLower() || roleClaim == "2".ToLower() || roleClaim == "3".ToLower();
            //        }));
            //});
        }
    }
}
