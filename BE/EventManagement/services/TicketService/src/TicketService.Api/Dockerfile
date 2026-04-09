# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy Service Projects
COPY ["services/TicketService/src/TicketService.Api/TicketService.Api.csproj", "services/TicketService/src/TicketService.Api/"]
COPY ["services/TicketService/src/TicketService.Application/TicketService.Application.csproj", "services/TicketService/src/TicketService.Application/"]
COPY ["services/TicketService/src/TicketService.Domain/TicketService.Domain.csproj", "services/TicketService/src/TicketService.Domain/"]
COPY ["services/TicketService/src/TicketService.Infrastructure/TicketService.Infrastructure.csproj", "services/TicketService/src/TicketService.Infrastructure/"]

# 2. Copy Shared Libraries
COPY ["shared/SharedContracts/SharedContracts.csproj", "shared/SharedContracts/"]
COPY ["shared/SharedInfrastructure/SharedInfrastructure.csproj", "shared/SharedInfrastructure/"]
COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]

# 3. Restore & Build
RUN dotnet restore "services/TicketService/src/TicketService.Api/TicketService.Api.csproj"
COPY . .
WORKDIR "/src/services/TicketService/src/TicketService.Api"
RUN dotnet build "TicketService.Api.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "TicketService.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
EXPOSE 80
EXPOSE 81
ENTRYPOINT ["dotnet", "TicketService.Api.dll"]