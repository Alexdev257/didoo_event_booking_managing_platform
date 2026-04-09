# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy Service Projects
COPY ["services/PaymentService/src/PaymentService.Api/PaymentService.Api.csproj", "services/PaymentService/src/PaymentService.Api/"]
COPY ["services/PaymentService/src/PaymentService.Application/PaymentService.Application.csproj", "services/PaymentService/src/PaymentService.Application/"]
COPY ["services/PaymentService/src/PaymentService.Domain/PaymentService.Domain.csproj", "services/PaymentService/src/PaymentService.Domain/"]
COPY ["services/PaymentService/src/PaymentService.Infrastructure/PaymentService.Infrastructure.csproj", "services/PaymentService/src/PaymentService.Infrastructure/"]

# 2. Copy Shared Libraries
COPY ["shared/SharedContracts/SharedContracts.csproj", "shared/SharedContracts/"]
COPY ["shared/SharedInfrastructure/SharedInfrastructure.csproj", "shared/SharedInfrastructure/"]
COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]

# 3. Restore & Build
RUN dotnet restore "services/PaymentService/src/PaymentService.Api/PaymentService.Api.csproj"
COPY . .
WORKDIR "/src/services/PaymentService/src/PaymentService.Api"
RUN dotnet build "PaymentService.Api.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "PaymentService.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PaymentService.Api.dll"]