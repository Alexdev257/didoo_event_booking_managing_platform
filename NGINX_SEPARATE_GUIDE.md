# 🔐 Hướng Dẫn: Nginx Proxy Manager + Docker Compose (Separated)

## 📋 Cấu Trúc

```
┌─────────────────┐
│  docker-compose.yml
├─────────────────┤
│ Services (HTTP)│
│ - auth-service    (port 6002:80)
│ - event-service   (port 6100:80)
│ - ticket-service  (port 6200:80)
│ - booking-service (port 6300:80)
│ - operation-service (port 6500:80)
│ - api-gateway (YARP) (port 5000:80) ← Does routing
│ - mysql, redis, rabbitmq, email-service
└─────────────────┘
          ↑
          │ HTTP calls (localhost:5000)
          │
┌──────────────────────┐
│docker-compose.nginx.yml
├──────────────────────┤
│ Nginx Proxy Manager   │
│ - Admin UI (port 81) │
│ - HTTP (port 5000)   │
│ - HTTPS (port 5443)  │
│ - MariaDB database   │
└──────────────────────┘
          ↑
          │ HTTPS (api.localhost:5443)
          │
    ┌─────────────┐
    │   Browser   │
    └─────────────┘

Flow:
Browser → HTTPS (Nginx) → HTTP (YARP Gateway) → Services
```

## ✨ Kiến Trúc Lợi Thế

- **1 Proxy Host**: Chỉ `api.localhost` (đơn giản!)
- **YARP Routing**: YARP gateway xử lý routing tới các services
- **1 SSL Certificate**: Chỉ cần 1 cert cho api.localhost
- **Clean Separation**: Nginx (HTTPS) | YARP (Routing) | Services (HTTP)

## 🚀 Chạy Services

### Terminal 1: Services (YARP Gateway)

```bash
cd BE\EventManagement
docker-compose up -d

# Verify
docker-compose ps
```

Expected:
```
NAME                STATUS
api-gateway         Up   (YARP on port 5000)
auth-service        Up
event-service       Up
ticket-service      Up
booking-service     Up
operation-service   Up
email-service       Up
mysql               Up
redis               Up
rabbitmq            Up
```

---

### Terminal 2: Nginx Proxy Manager

```bash
cd BE\EventManagement
docker-compose -f docker-compose.nginx.yml up -d

# Verify
docker-compose -f docker-compose.nginx.yml ps
```

Expected:
```
NAME                  STATUS
api-gateway-nginx     Up   (Nginx on port 5001)
npm_db                Up
```

---

## 📊 Ports After Setup

| Component | Port | Purpose |
|-----------|------|---------|
| **YARP Gateway** | `http://localhost:5000` | Direct to YARP (dev testing) |
| **Nginx HTTP** | `http://localhost:5001` | Forward to YARP (redirects to HTTPS) |
| **Nginx HTTPS** | `https://localhost:5443` | HTTPS reverse proxy (production) |
| **Nginx Admin UI** | `http://localhost:81` | Manage proxy hosts |
| **Auth Service** | `http://localhost:6002` | Direct access (dev) |
| **Event Service** | `http://localhost:6100` | Direct access (dev) |
| **Ticket Service** | `http://localhost:6200` | Direct access (dev) |
| **Booking Service** | `http://localhost:6300` | Direct access (dev) |
| **Operation Service** | `http://localhost:6500` | Direct access (dev) |

---

## 🔐 Setup Nginx Proxy Hosts (Admin UI)

### Truy Cập Admin
```
URL: http://localhost:81
Email: admin@example.com
Password: changeme
```

⚠️ **Thay đổi password ngay!**

---

## 📝 Tạo 1 Proxy Host duy nhất cho API Gateway

### Single Proxy Host: API Gateway (YARP)

**Proxy Hosts** → **Add Proxy Host**

**Details Tab:**
```
Domain Names:           api.localhost
Scheme:                 http              ← HTTP (forward)
Forward Hostname/IP:    host.docker.internal
Forward Port:           5000              ← YARP Gateway port (on host)
Block Common Exploits:  ON
Websockets Support:     ON
```

**SSL Tab:**
```
SSL Certificate:        Self-Signed Certificate  (dev)
                        hoặc Let's Encrypt (production)
Force SSL:              ON
HTTP/2 Support:         ON
```

**Save**

---

### 🎯 Đó là tất cả!

**Flow:**
```
Browser 
  ↓ (HTTPS)
api.localhost:5443 
  ↓ (Nginx proxy)
host.docker.internal:5000 (YARP Gateway)
  ↓ (YARP routing)
  ├→ http://auth-service:80
  ├→ http://event-service:80
  ├→ http://ticket-service:80
  ├→ http://booking-service:80
  └→ http://operation-service:80
```

**YARP xử lý routing**, không cần create proxy host riêng cho từng service.

---

## 💻 Setup Local Hosts (Optional)

Thêm vào `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1   api.localhost
```

Flush DNS:
```powershell
ipconfig /flushdns
```

---

## 🧪 Testing

### Test HTTP (trước SSL)
```bash
# Qua Nginx (redirect HTTPS)
curl -L http://localhost:5000/swagger/index.html
```

### Test HTTPS (sau tạo SSL)
```bash
# Skip certificate check (self-signed)
curl -k https://localhost:5443/swagger/index.html

# Hoặc PowerShell
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
Invoke-WebRequest https://localhost:5443/swagger/index.html `
  -SkipCertificateCheck `
  -Headers @{"Host"="api.localhost"}
```

### Test qua Domain (nếu setup hosts)
```bash
curl -k https://api.localhost:5443/swagger/index.html
```

### Test YARP Routing (các services)
```bash
# Auth Service (qua YARP)
curl -k https://localhost:5443/auth-service/swagger/index.html

# Event Service (qua YARP)
curl -k https://localhost:5443/event-service/swagger/index.html

# Ticket Service (qua YARP)
curl -k https://localhost:5443/ticket-service/swagger/index.html
```

---

## 📊 Ports Overview

| Component | Port | Purpose |
|-----------|------|---------|
| YARP Gateway (Direct) | http://localhost:5000 | Backend YARP Gateway (dev testing) |
| Nginx HTTP | http://localhost:5001 | HTTP access (redirects to HTTPS) |
| Nginx HTTPS | https://localhost:5443 | HTTPS reverse proxy (production) |
| Nginx Admin UI | http://localhost:81 | Manage proxy hosts |
| Auth Service (Direct) | http://localhost:6002 | Direct access (dev) |
| Event Service (Direct) | http://localhost:6100 | Direct access (dev) |
| Ticket Service (Direct) | http://localhost:6200 | Direct access (dev) |
| Booking Service (Direct) | http://localhost:6300 | Direct access (dev) |
| Operation Service (Direct) | http://localhost:6500 | Direct access (dev) |

### Port Mapping Explanation

```
Nginx Container Maps:
  80 (inside) ← 5001 (host HTTP)
  443 (inside) ← 5443 (host HTTPS)

When user accesses https://localhost:5443:
  → Nginx container port 443 (HTTPS)
    → Forwards to host.docker.internal:5000 (YARP)
      → YARP routes to services
```

### Recommended Flow (Production)
```
Client → HTTPS (https://localhost:5443) → Nginx → HTTP (YARP:5000) → Services
```

### Dev/Test Direct Access
```
Dev Client → HTTP → YARP:5000 (bypass Nginx)
Dev Client → Direct → Service:6002, 6100, 6200, etc.
```

---

## 🔄 Logs Management

### Services (docker-compose.yml)

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service
docker-compose logs -f api-gateway  # YARP Gateway

# Last 50 lines
docker-compose logs --tail 50
```

### Nginx (docker-compose.nginx.yml)

```bash
# Nginx database
docker-compose -f docker-compose.nginx.yml logs -f npm_db

# Nginx proxy
docker-compose -f docker-compose.nginx.yml logs -f api-gateway-nginx

# All nginx services
docker-compose -f docker-compose.nginx.yml logs -f
```

---

## 🛠️ Commands Reference

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Start only specific service
docker-compose up -d auth-service

# Stop all
docker-compose down

# Restart
docker-compose restart

# View status
docker-compose ps
```

### Start/Stop Nginx

```bash
# Start Nginx Proxy Manager
docker-compose -f docker-compose.nginx.yml up -d

# Stop Nginx
docker-compose -f docker-compose.nginx.yml down

# Restart database
docker-compose -f docker-compose.nginx.yml restart npm_db

# Restart proxy manager
docker-compose -f docker-compose.nginx.yml restart api-gateway-nginx
```

### Database Management

```bash
# Backup Nginx DB
docker exec npm_db mysqldump \
  -u npm_user \
  -pnpm_user_secret_123 \
  npm_db > npm_backup.sql

# Restore Nginx DB
docker exec -i npm_db mysql \
  -u npm_user \
  -pnpm_user_secret_123 \
  npm_db < npm_backup.sql

# Direct MySQL access
docker exec -it npm_db mysql -u npm_user -pnpm_user_secret_123 npm_db
```

---

## 🔍 Troubleshooting

### 1. Nginx không tìm thấy services

**Error**: 502 Bad Gateway

**Giải pháp**:
```bash
# Verify host.docker.internal works
docker run --rm curlimages/curl -v telnet host.docker.internal:6002

# Check Nginx logs
docker-compose -f docker-compose.nginx.yml logs api-gateway-nginx | grep error
```

### 2. Admin UI không accessible

```bash
# Check port
docker-compose -f docker-compose.nginx.yml ps

# Verify Nginx started
docker-compose -f docker-compose.nginx.yml logs api-gateway-nginx | grep "listening"

# Restart
docker-compose -f docker-compose.nginx.yml restart api-gateway-nginx
```

### 3. Database connection error

```bash
# Check database health
docker-compose -f docker-compose.nginx.yml ps npm_db

# View database logs
docker-compose -f docker-compose.nginx.yml logs npm_db

# Test connection
docker exec npm_db mysqladmin -u npm_user -pnpm_user_secret_123 ping
```

### 4. SSL Certificate error

**In Admin UI**:
1. SSL Certificates tab → Delete old certificate
2. Recreate proxy host with new SSL option
3. Restart nginx: `docker-compose -f docker-compose.nginx.yml restart api-gateway-nginx`

---

## 🔐 Production Considerations

### 1. Use Real Domain + Let's Encrypt
```
Proxy Host:
Domain:         auth.yourdomain.com
SSL Certificate: Let's Encrypt
Email:          your-email@example.com
Force SSL:      ON
```

### 2. Whitelist Ports (Firewall)
```bash
# Only allow 443 externally
ufw allow 5443/tcp     # HTTPS
ufw deny 5000/tcp      # HTTP (optional)
ufw deny 81/tcp        # Admin UI (internal only!)
```

### 3. Change Credentials

**In docker-compose.nginx.yml**:
```yaml
environment:
  DB_MYSQL_PASSWORD: ${NPM_DB_PASSWORD}  # Use .env file
```

**In .env file**:
```
NPM_DB_PASSWORD=your_strong_password_here
```

---

## 📈 Khi Thêm Service Mới

Khi thêm service mới (e.g., ResaleService):

1. **Service chạy trên port X** (e.g., 6600 cho ResaleService)
2. **Update YARP config** (appsettings.json):
   ```json
   {
     "ReverseProxy": {
       "Clusters": {
         "resale-cluster": {
           "Destinations": {
             "destination1": {
               "Address": "http://resale-service:80"
             }
           }
         }
       }
     }
   }
   ```
3. **Không cần update Nginx!** Vì Nginx chỉ proxy tới YARP
4. **YARP tự động route** đến resale-service

### Lợi ích:
✅ Thêm service mới = chỉ update YARP config, không cần thay đổi Nginx
✅ 1 SSL certificate cho tất cả services
✅ 1 domain (api.localhost) dùng cho mọi service

---

## ✅ Checklist

- [ ] `docker-compose up -d` running successfully
- [ ] All services healthy: `docker-compose ps`
- [ ] YARP Gateway accessible: http://localhost:5000
- [ ] Nginx started: `docker-compose -f docker-compose.nginx.yml ps`
- [ ] Admin UI accessible: http://localhost:81
- [ ] Database connected (check Nginx logs)
- [ ] Password changed (admin@example.com)
- [ ] **1 Proxy Host Created** (api.localhost → host.docker.internal:5000)
- [ ] SSL certificate generated (Self-Signed)
- [ ] HTTPS working: https://localhost:5443
- [ ] Hosts file updated: 127.0.0.1 api.localhost (optional)
- [ ] YARP routing working (test /auth-service, /event-service, etc.)
- [ ] All services accessible via Nginx

---

## 🎓 Architecture Benefits

✅ **Single SSL Certificate**
- 1 certificate cho tất cả services (api.localhost)

✅ **Simplified Nginx Config**
- Chỉ 1 proxy host (thay vì 5)
- Dễ quản lý, dễ update

✅ **YARP Handles Routing**
- YARP xử lý /auth-service, /event-service, v.v.
- Thêm service mới không cần config Nginx

✅ **Separation of Concerns**
- Nginx: HTTPS/TLS termination
- YARP: API Gateway / Routing
- Services: Business logic

✅ **Flexibility**
- Có thể thay YARP bằng service khác mà không cần update Nginx
- Add/remove services mà không cần restart Nginx

✅ **Performance**
- Fewer reverse proxies = less overhead
- Direct routing (Nginx → YARP → Services)

---

**🎉 Setup hoàn thành! Happy proxying!**

