# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy Service Projects
COPY ["services/EventService/src/EventService.Api/EventService.Api.csproj", "services/EventService/src/EventService.Api/"]
COPY ["services/EventService/src/EventService.Application/EventService.Application.csproj", "services/EventService/src/EventService.Application/"]
COPY ["services/EventService/src/EventService.Domain/EventService.Domain.csproj", "services/EventService/src/EventService.Domain/"]
COPY ["services/EventService/src/EventService.Infrastructure/EventService.Infrastructure.csproj", "services/EventService/src/EventService.Infrastructure/"]

# 2. Copy Shared Libraries
COPY ["shared/SharedContracts/SharedContracts.csproj", "shared/SharedContracts/"]
COPY ["shared/SharedInfrastructure/SharedInfrastructure.csproj", "shared/SharedInfrastructure/"]
COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]

# 3. Restore & Build
RUN dotnet restore "services/EventService/src/EventService.Api/EventService.Api.csproj"
COPY . .
WORKDIR "/src/services/EventService/src/EventService.Api"
RUN dotnet build "EventService.Api.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "EventService.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 80
EXPOSE 81
ENTRYPOINT ["dotnet", "EventService.Api.dll"]