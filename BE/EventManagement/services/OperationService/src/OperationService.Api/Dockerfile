# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy Service Projects
COPY ["services/OperationService/src/OperationService.Api/OperationService.Api.csproj", "services/OperationService/src/OperationService.Api/"]
COPY ["services/OperationService/src/OperationService.Application/OperationService.Application.csproj", "services/OperationService/src/OperationService.Application/"]
COPY ["services/OperationService/src/OperationService.Domain/OperationService.Domain.csproj", "services/OperationService/src/OperationService.Domain/"]
COPY ["services/OperationService/src/OperationService.Infrastructure/OperationService.Infrastructure.csproj", "services/OperationService/src/OperationService.Infrastructure/"]

# 2. Copy Shared Libraries
COPY ["shared/SharedContracts/SharedContracts.csproj", "shared/SharedContracts/"]
COPY ["shared/SharedInfrastructure/SharedInfrastructure.csproj", "shared/SharedInfrastructure/"]
COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]

# 3. Restore & Build
RUN dotnet restore "services/OperationService/src/OperationService.Api/OperationService.Api.csproj"
COPY . .
WORKDIR "/src/services/OperationService/src/OperationService.Api"
RUN dotnet build "OperationService.Api.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "OperationService.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "OperationService.Api.dll"]