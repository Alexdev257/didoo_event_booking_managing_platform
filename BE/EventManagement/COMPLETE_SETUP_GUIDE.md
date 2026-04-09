# Complete Setup Guide: .NET Microservices + Nginx Proxy Manager with HTTPS

**Mục tiêu**: Chạy toàn bộ hệ thống microservices với HTTPS gateway từ đầu đến cuối.

---

## 📋 Yêu cầu

- Docker Desktop (hoặc Docker + Docker Compose)
- Quyền truy cập cổng: `5000`, `5001`, `5443`, `81`, `3306`, `6002`, `6100`, `6200`, `6300`, `6500`
- Không có service khác chạy trên các cổng này
- Terminal/PowerShell với quyền Administrator

---

## 📁 Cấu trúc File

```
BE/EventManagement/
├── docker-compose.yml           # Main services (Auth, Event, Ticket, Booking, Operation, etc)
├── docker-compose.nginx.yml     # Nginx Proxy Manager + Database
├── services/
│   ├── AuthService/
│   ├── EventService/
│   ├── TicketService/
│   ├── BookingService/
│   ├── OperationService/
│   └── ... (other services)
└── shared/
    ├── SharedContracts/
    ├── SharedInfrastructure/
    └── SharedKernel/
```

**Đảm bảo bạn có cả 2 file:**
- ✅ `docker-compose.yml`
- ✅ `docker-compose.nginx.yml`

---

## 🚀 Bước 1: Khởi động Services Chính

Mở **PowerShell** hoặc **Terminal** tại thư mục `BE/EventManagement`:

```powershell
# Điều hướng đến thư mục
cd D:\code_PRN232\Didoo\BE\EventManagement

# Dừng các container cũ (nếu có)
docker-compose down

# Khởi động tất cả services
docker-compose up -d

# Chờ ~30 giây để database khởi động
Start-Sleep -Seconds 30

# Kiểm tra status
docker-compose ps
```

**Kết quả mong đợi:**
```
CONTAINER ID   IMAGE                              COMMAND                  STATUS
...
xxxxxx         mysql:8.0                          "docker-entrypoint..."   Up 35s (healthy)
xxxxxx         rabbitmq:latest                    "docker-entrypoint..."   Up 30s
xxxxxx         redis:latest                       "redis-server"           Up 30s
xxxxxx         authservice:latest                 "dotnet AuthSer..."      Up 25s
xxxxxx         eventservice:latest                "dotnet EventSer..."     Up 25s
xxxxxx         ticketservice:latest               "dotnet TicketSer..."    Up 25s
xxxxxx         bookingservice:latest              "dotnet BookingSer..."   Up 25s
xxxxxx         operationservice:latest            "dotnet OpSer..."        Up 25s
xxxxxx         emailservice:latest                "dotnet EmailSer..."     Up 25s
xxxxxx         apigateway:latest                  "dotnet ApiGate..."      Up 25s
```

✅ **Tất cả services phải có status "Up"**

**Test YARP Gateway:**
```powershell
Invoke-WebRequest -Uri "http://localhost:5000" -UseBasicParsing
# Kết quả: StatusCode 200 hoặc 404 (tùy endpoint) - không quan trọng, chỉ cần connect được
```

---

## 🚀 Bước 2: Khởi động Nginx Proxy Manager

**Trong cùng thư mục**, chạy:

```powershell
# Khởi động Nginx PM (trong terminal khác)
docker-compose -f docker-compose.nginx.yml up -d

# Chờ 15 giây
Start-Sleep -Seconds 15

# Kiểm tra status
docker-compose -f docker-compose.nginx.yml ps
```

**Kết quả mong đợi:**
```
CONTAINER ID   IMAGE                                    STATUS
xxxxxx         mysql:8.0                                Up 20s (healthy)
xxxxxx         jc21/nginx-proxy-manager:latest          Up 15s
```

✅ **Cả 2 container phải "Up"**

**Kiểm tra Nginx PM Admin UI:**
```powershell
Invoke-WebRequest -Uri "http://localhost:81" -UseBasicParsing
# StatusCode: 200 = Có phản hồi, UI sẵn sàng
```

---

## 🔑 Bước 3: Truy cập Nginx PM Admin UI

**Mở trình duyệt:**

```
http://localhost:81
```

**Đăng nhập mặc định:**
- Email: `admin@example.com`
- Password: `changeme`

Nếu lỗi, thử:
- Email: `admin`
- Password: `admin`

✅ **Sau đăng nhập, bạn sẽ thấy Dashboard**

---

## 🌐 Bước 4: Tạo Proxy Host

**Trong Admin UI:**

1. **Dashboard** → **Hosts** (menu bên trái) → **Proxy Hosts**
2. Nhấp vào nút **"Add Proxy Host"** (xanh lam)
3. **Điền thông tin:**

   | Field | Giá trị |
   |-------|--------|
   | Domain Names | `localhost` |
   | Scheme | `http` |
   | Forward Hostname/IP | `api-gateway` |
   | Forward Port | `5000` |
   | Access List | (vặc) |
   | Certificate | (vặc) |
   | Block Common Exploits | ✅ Bật |
   | Caching Enabled | (vặc) |
   | Allow WebSocket Upgrade | ✅ Bật |

4. **Nhấp "Save"**

✅ **Proxy host được tạo**

**Test HTTP (chưa HTTPS):**
```powershell
Invoke-WebRequest -Uri "http://localhost:5001" -UseBasicParsing
# StatusCode: 200 = Thành công
```

---

## 🔒 Bước 5: Thêm SSL Certificate (HTTPS)

**Trong Admin UI:**

1. **Hosts** → **Proxy Hosts** → Nhấp vào proxy host vừa tạo để **Edit**
2. Chuyển sang tab **SSL**
3. Nhấp **"Request a new SSL Certificate"**
4. **Điền:**
   - Email: `admin@example.com` (email bất kỳ)
   - ✅ Bật "I Agree to the Let's Encrypt Terms of Service"
5. **Nhấp "Save"**

⏳ **Chờ 30-60 giây** để Let's Encrypt tạo certificate

**Kiểm tra Certificate được tạo:**
- Quay lại **SSL** tab
- Nếu thấy certificate name (như `localhost`) → ✅ Thành công

---

## ✅ Bước 6: Test HTTPS Access

**Test HTTP (qua Nginx proxy):**
```powershell
Invoke-WebRequest -Uri "http://localhost:5001" -UseBasicParsing
# StatusCode: 200
```

**Test HTTPS (với Swagger):**
```powershell
Invoke-WebRequest -Uri "https://localhost:5443/swagger" -SkipCertificateCheck -UseBasicParsing
# StatusCode: 200 = Swagger hoạt động!
```

✅ **Swagger accessible via HTTPS: https://localhost:5443/swagger**

---

## 📊 Tóm tắt Endpoint Sau Setup

| Service | URL | Ghi chú |
|---------|-----|--------|
| **Swagger (HTTP)** | http://localhost:5001/swagger | Qua Nginx HTTP proxy |
| **Swagger (HTTPS)** | https://localhost:5443/swagger | Qua Nginx HTTPS proxy |
| **YARP Gateway** | http://localhost:5000 | Direct (nội bộ) |
| **Nginx Admin** | http://localhost:81 | Admin dashboard |
| **Auth Service** | http://localhost:6002 | Direct (nội bộ) |
| **Event Service** | http://localhost:6100 | Direct (nội bộ) |
| **Ticket Service** | http://localhost:6200 | Direct (nội bộ) |
| **Booking Service** | http://localhost:6300 | Direct (nội bộ) |
| **Operation Service** | http://localhost:6500 | Direct (nội bộ) |

---

## 🛠️ Các Lệnh Hữu ích

### Kiểm tra Status
```powershell
# Services chính
docker-compose ps

# Nginx PM
docker-compose -f docker-compose.nginx.yml ps
```

### Xem Logs
```powershell
# Services chính
docker-compose logs -f

# Nginx PM
docker-compose -f docker-compose.nginx.yml logs api-gateway-nginx

# MySQL của Nginx PM
docker-compose -f docker-compose.nginx.yml logs npm_db
```

### Restart Services
```powershell
# Restart services chính
docker-compose restart

# Restart Nginx PM
docker-compose -f docker-compose.nginx.yml restart
```

### Dừng toàn bộ
```powershell
# Dừng services chính
docker-compose down

# Dừng Nginx PM
docker-compose -f docker-compose.nginx.yml down

# Dừng cả 2 (xóa volumes)
docker-compose down -v
docker-compose -f docker-compose.nginx.yml down -v
```

---

## ⚠️ Troubleshooting

### 1. Nginx Admin UI không respond (http://localhost:81 timeout)

```powershell
# Kiểm tra container running
docker-compose -f docker-compose.nginx.yml ps

# Xem logs
docker-compose -f docker-compose.nginx.yml logs api-gateway-nginx --tail 30

# Nếu container không up, restart
docker-compose -f docker-compose.nginx.yml restart
```

**Giải pháp**: Chờ 30 giây, server cần thời gian khởi động database

### 2. Login vào Nginx Admin bị lỗi "Invalid password"

**Cách reset password:**
```powershell
# Truy cập database
docker exec -it npm_db mysql -u root -pnpm_root_secret_123 npm_db

# Trong MySQL shell, chạy:
UPDATE user SET password = MD5('changeme') WHERE id = 1;
EXIT;
```

Sau đó chạy lại: `http://localhost:81` → Email: `admin@example.com`, Password: `changeme`

### 3. Proxy host không forward traffic đến YARP

**Kiểm tra connectivity:**
```powershell
# Test từ bên trong Nginx container
docker exec api-gateway-nginx curl -v http://api-gateway:5000

# Nếu lỗi, kiểm tra Docker network
docker network ls
docker network inspect event-network
```

**Giải pháp**: Đảm bảo cả 2 docker-compose chạy trên cùng network `event-network`

### 4. HTTPS bị warning về certificate không trusted

**Nguyên nhân**: Let's Encrypt certificate hợp lệ nhưng browser cảnh báo (normal)

**Giải pháp**: 
- Click "Advanced" rồi "Proceed" (Chrome)
- Hoặc dùng flag `-SkipCertificateCheck` khi test bằng PowerShell

### 5. Certificate request bị lỗi

```powershell
# Check Nginx PM logs
docker-compose -f docker-compose.nginx.yml logs api-gateway-nginx | grep -i "ssl\|certificate\|error"
```

**Giải pháp phổ biến**:
- Đảm bảo domain name hợp lệ (không dùng IP)
- Chờ đủ 30-60 giây
- Nếu vẫn fail, thử request lại hoặc dùng self-signed certificate

---

## 📋 Checklist Hoàn thành Setup

- [ ] **Bước 1**: Services chính up (`docker-compose ps` - tất cả "Up")
- [ ] **Bước 2**: Nginx PM up (`docker-compose -f docker-compose.nginx.yml ps`)
- [ ] **Bước 3**: Login Admin UI thành công (http://localhost:81)
- [ ] **Bước 4**: Proxy host tạo thành công
- [ ] **Bước 5**: SSL certificate được tạo (Let's Encrypt)
- [ ] **Bước 6**: HTTPS Swagger respond (https://localhost:5443/swagger)

✅ **Khi hoàn tất cả 6 điểm = System Ready!**

---

## 🔗 Test Endpoints

```powershell
# Test mỗi endpoint này để đảm bảo toàn bộ hoạt động

# 1. HTTP proxy
curl http://localhost:5001

# 2. HTTPS proxy
curl https://localhost:5443 -k

# 3. HTTPS Swagger
curl https://localhost:5443/swagger -k

# 4. Nginx Admin
curl http://localhost:81

# 5. Direct YARP (nội bộ)
curl http://localhost:5000

# PowerShell equivalents:
Invoke-WebRequest http://localhost:5001 -UseBasicParsing
Invoke-WebRequest https://localhost:5443 -SkipCertificateCheck -UseBasicParsing
Invoke-WebRequest http://localhost:81 -UseBasicParsing
```

---

## 📞 Liên hệ/Support

Nếu gặp vấn đề:

1. Kiểm tra logs: `docker-compose logs -f`
2. Kiểm tra network: `docker network inspect event-network`
3. Kiểm tra ports: `netstat -ano | findstr :5000` (Windows)
4. Restart: `docker-compose down && docker-compose up -d`

---

**Version**: 1.0  
**Last Updated**: March 2026  
**Status**: ✅ Production Ready
