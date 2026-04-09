# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. Copy file .csproj (Giả định cấu trúc có Infrastructure để xử lý MailKit)
COPY ["services/EmailService/src/EmailService.Api/EmailService.Api.csproj", "services/EmailService/src/EmailService.Api/"]
COPY ["services/EmailService/src/EmailService.Infrastructure/EmailService.Infrastructure.csproj", "services/EmailService/src/EmailService.Infrastructure/"]

# 2. Copy Shared Libraries (Cần thiết vì dùng Event từ SharedContracts)
COPY ["shared/SharedContracts/SharedContracts.csproj", "shared/SharedContracts/"]
COPY ["shared/SharedInfrastructure/SharedInfrastructure.csproj", "shared/SharedInfrastructure/"]
COPY ["shared/SharedKernel/SharedKernel.csproj", "shared/SharedKernel/"]

# 3. Restore
RUN dotnet restore "services/EmailService/src/EmailService.Api/EmailService.Api.csproj"

# 4. Copy Source & Publish
COPY . .
WORKDIR "/src/services/EmailService/src/EmailService.Api"
RUN dotnet build "EmailService.Api.csproj" -c Release -o /app/build
FROM build AS publish
RUN dotnet publish "EmailService.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Run
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "EmailService.Api.dll"]