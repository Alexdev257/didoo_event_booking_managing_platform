# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy Service Projects
COPY ["services/AuthService/src/AuthService.Api/AuthService.Api.csproj", "services/AuthService/src/AuthService.Api/"]
COPY ["services/AuthService/src/AuthService.Application/AuthService.Application.csproj", "services/AuthService/src/AuthService.Application/"]
COPY ["services/AuthService/src/AuthService.Domain/AuthService.Domain.csproj", "services/AuthService/src/AuthService.Domain/"]
COPY ["services/AuthService/src/AuthService.Infrastructure/AuthService.Infrastructure.csproj", "services/AuthService/src/AuthService.Infrastructure/"]

# 2. Copy Shared Libraries
COPY ["shared/SharedContracts/SharedContracts.csproj", "shared/SharedContracts/"]
COPY ["shared/SharedInfrastructure/SharedInfrastructure.csproj", "shared/SharedInfrastructure/"]
COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]

# 3. Restore & Build
RUN dotnet restore "services/AuthService/src/AuthService.Api/AuthService.Api.csproj"
COPY . .
WORKDIR "/src/services/AuthService/src/AuthService.Api"
RUN dotnet build "AuthService.Api.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "AuthService.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AuthService.Api.dll"]