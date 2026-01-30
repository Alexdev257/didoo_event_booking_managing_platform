# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy Service Projects
COPY ["services/BookingService/src/BookingService.Api/BookingService.Api.csproj", "services/BookingService/src/BookingService.Api/"]
COPY ["services/BookingService/src/BookingService.Application/BookingService.Application.csproj", "services/BookingService/src/BookingService.Application/"]
COPY ["services/BookingService/src/BookingService.Domain/BookingService.Domain.csproj", "services/BookingService/src/BookingService.Domain/"]
COPY ["services/BookingService/src/BookingService.Infrastructure/BookingService.Infrastructure.csproj", "services/BookingService/src/BookingService.Infrastructure/"]

# 2. Copy Shared Libraries
COPY ["shared/SharedContracts/SharedContracts.csproj", "shared/SharedContracts/"]
COPY ["shared/SharedInfrastructure/SharedInfrastructure.csproj", "shared/SharedInfrastructure/"]
COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]

# 3. Restore & Build
RUN dotnet restore "services/BookingService/src/BookingService.Api/BookingService.Api.csproj"
COPY . .
WORKDIR "/src/services/BookingService/src/BookingService.Api"
RUN dotnet build "BookingService.Api.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "BookingService.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BookingService.Api.dll"]