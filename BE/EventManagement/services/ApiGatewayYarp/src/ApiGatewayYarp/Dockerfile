# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy file .csproj
COPY ["services/ApiGatewayYarp/src/ApiGatewayYarp/ApiGatewayYarp.csproj", "services/ApiGatewayYarp/src/ApiGatewayYarp/"]

# 2. Copy Shared (Đề phòng Gateway có dùng logic chung, nếu không dùng có thể bỏ qua dòng này để build nhanh hơn)
COPY ["shared/SharedContracts/SharedContracts.csproj", "shared/SharedContracts/"]
COPY ["shared/SharedInfrastructure/SharedInfrastructure.csproj", "shared/SharedInfrastructure/"]

# 3. Restore
RUN dotnet restore "services/ApiGatewayYarp/src/ApiGatewayYarp/ApiGatewayYarp.csproj"

# 4. Copy Source & Publish
COPY . .
WORKDIR "/src/services/ApiGatewayYarp/src/ApiGatewayYarp"
RUN dotnet build "ApiGatewayYarp.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "ApiGatewayYarp.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Run
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "ApiGatewayYarp.dll"]