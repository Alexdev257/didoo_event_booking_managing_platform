# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy Service Projects
COPY ["services/ResaleService/src/ResaleService.Api/ResaleService.Api.csproj", "services/ResaleService/src/ResaleService.Api/"]
COPY ["services/ResaleService/src/ResaleService.Application/ResaleService.Application.csproj", "services/ResaleService/src/ResaleService.Application/"]
COPY ["services/ResaleService/src/ResaleService.Domain/ResaleService.Domain.csproj", "services/ResaleService/src/ResaleService.Domain/"]
COPY ["services/ResaleService/src/ResaleService.Infrastructure/ResaleService.Infrastructure.csproj", "services/ResaleService/src/ResaleService.Infrastructure/"]

# 2. Copy Shared Libraries
COPY ["shared/SharedContracts/SharedContracts.csproj", "shared/SharedContracts/"]
COPY ["shared/SharedInfrastructure/SharedInfrastructure.csproj", "shared/SharedInfrastructure/"]
COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]

# 3. Restore & Build
RUN dotnet restore "services/ResaleService/src/ResaleService.Api/ResaleService.Api.csproj"
COPY . .
WORKDIR "/src/services/ResaleService/src/ResaleService.Api"
RUN dotnet build "ResaleService.Api.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "ResaleService.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ResaleService.Api.dll"]