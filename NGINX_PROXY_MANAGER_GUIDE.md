# 🔐 Hướng Dẫn Setup Nginx Proxy Manager + HTTPS Gateway

## 📋 Tóm Tắt Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                   HTTPS:5443
                       ▼
┌──────────────────────────────────────────────────────────────┐
│          Nginx Proxy Manager (API Gateway)                   │
│          - HTTPS/SSL Management                              │
│          - Port 5443 (external HTTPS)                       │
│          - Port 81 (Admin UI)                                │
└──────────────────┬───────────────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┬──────────────┬─────────────┐
    │              │              │              │             │
   HTTP:80       HTTP:80        HTTP:80        HTTP:80        (no proxy)
    │              │              │              │             │
    ▼              ▼              ▼              ▼             ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────┐
│ Auth   │  │ Event  │  │Ticket  │  │Booking │  │Operation │
│Service │  │Service │  │Service │  │Service │  │Service   │
└────────┘  └────────┘  └────────┘  └────────┘  └──────────┘
```

## ✨ Đặc điểm

| Tính năng | Chi tiết |
|----------|---------|
| **Services** | Chạy HTTP nội bộ (không cần HTTPS) |
| **Gateway** | HTTPS proxy (Let's Encrypt hoặc Self-Signed) |
| **Admin UI** | Web dashboard dễ dùng trên port 81 |
| **Database** | MariaDB lưu trữ cấu hình proxy |
| **SSL Auto-Renewal** | Let's Encrypt tự động renew |

---

## 🚀 Chạy Docker

### 1. Build & Start Services

```bash
cd BE\EventManagement

# Build & start (lần đầu sẽ lâu)
docker-compose up -d

# Check status
docker-compose ps
```

Expected output:
```
NAME               STATUS
api-gateway        Up 2 minutes
npm_db             Up 2 minutes
auth-service       Up 2 minutes
event-service      Up 2 minutes
ticket-service     Up 2 minutes
booking-service    Up 2 minutes
operation-service  Up 2 minutes
email-service      Up 2 minutes
mysql              Up 2 minutes
redis              Up 2 minutes
rabbitmq           Up 2 minutes
```

### 2. Kiểm tra Logs

```bash
# API Gateway (Nginx)
docker logs api-gateway

# Database
docker logs npm_db

# Auth Service
docker logs auth-service
```

---

## 🔐 Nginx Proxy Manager Admin UI

### Truy Cập Admin UI

**URL**: http://localhost:81

**Default Credentials**:
- Email: `admin@example.com`
- Password: `changeme`

> ⚠️ **Quan trọng**: Thay đổi password ngay lần đầu!

### Tạo Proxy Host (Forward HTTP → HTTPS)

Ví dụ: Auth Service tới Auth.localhost

#### Bước 1: Truy cập Admin UI
```
http://localhost:81 → Login
```

#### Bước 2: Tạo Proxy Host
1. Sidebar → **Proxy Hosts**
2. Click **Add Proxy Host**

#### Bước 3: Tab "Details"
```
Domain Names:           auth.localhost
Scheme:                 http
Forward Hostname/IP:    auth-service    ← Tên container
Forward Port:           80              ← Port service nội bộ
Block Common Exploits:  ON
Websockets Support:     ON (nếu dùng SignalR)
```

#### Bước 4: Tab "SSL"
Có 2 tùy chọn:

**Option A: Self-Signed (Dev/Test)**
```
SSL Certificate:    Create Self-Signed Certificate
Force SSL:          ON
HTTP/2 Support:     ON
HSTS Enabled:       OFF (optional)
```

**Option B: Let's Encrypt (Production)**
```
SSL Certificate:    Request a new SSL Certificate
Email Address:      your-email@example.com
Force SSL:          ON
HTTP/2 Support:     ON
HSTS Enabled:       ON (recommended)
```

> ⚠️ Chỉ dùng Let's Encrypt nếu domain thực + DNS resolve

#### Bước 5: Save
Click **Save** → Nginx sẽ tạo SSL certificate (vài giây)

---

## 📝 Tạo Proxy Host cho Tất Cả Services

Lặp lại quy trình trên cho từng service:

### 1. Auth Service
```
Domain:     auth.localhost
Forward:    http://auth-service:80
SSL:        Self-Signed (dev) hoặc Let's Encrypt (prod)
```

### 2. Event Service
```
Domain:     event.localhost
Forward:    http://event-service:80
SSL:        Self-Signed (dev)
```

### 3. Ticket Service
```
Domain:     ticket.localhost
Forward:    http://ticket-service:80
SSL:        Self-Signed (dev)
```

### 4. Booking Service
```
Domain:     booking.localhost
Forward:    http://booking-service:80
SSL:        Self-Signed (dev)
```

### 5. Operation Service
```
Domain:     operation.localhost
Forward:    http://operation-service:80
SSL:        Self-Signed (dev)
```

---

## 🧪 Testing

### 1. Setup Local Hosts (Optional)
Thêm vào `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1   auth.localhost
127.0.0.1   event.localhost
127.0.0.1   ticket.localhost
127.0.0.1   booking.localhost
127.0.0.1   operation.localhost
```

Sau khi save, admin reboot hoặc chạy:
```powershell
ipconfig /flushdns
```

### 2. Test HTTP (Redirect)
```bash
# Sẽ redirect tới HTTPS
curl http://localhost:5000/swagger/index.html
```

### 3. Test HTTPS (Self-Signed)
```bash
# PowerShell
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}

Invoke-WebRequest https://localhost:5443/swagger/index.html `
  -SkipCertificateCheck `
  -Headers @{"Host"="auth.localhost"}
```

Hoặc dùng cURL:
```bash
curl -k https://localhost:5443/swagger/index.html \
  -H "Host: auth.localhost"
```

### 4. Test qua Domain (nếu setup hosts)
```bash
# Nếu đã thêm vào hosts file
curl -k https://auth.localhost:5443/swagger/index.html
```

---

## 🔧 Advanced Configuration

### Expose Swagger Documentation

Nếu muốn Swagger accessible qua proxy:

Proxy Host Details:
```
Forward Hostname/IP:    auth-service
Forward Port:           80

# Thêm custom locations (nếu cần)
Custom Locations:
  - Location:    /swagger
    Scheme:      http
    Forward:     auth-service:80
```

### Enable CORS Headers (nếu cần)

Tab "Advanced" → Custom Nginx Configuration:
```nginx
location / {
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    
    if ($request_method = 'OPTIONS') {
        return 204;
    }
    
    proxy_pass http://$upstream;
}
```

### Thay Đổi Admin UI Port

Nếu port 81 bị chiếm, sửa docker-compose.yml:
```yaml
api-gateway:
  ports:
    - '5000:80'
    - '5443:443'
    - '8888:81'   # ← Thay 81 thành 8888
```

Rồi:
```bash
docker-compose restart api-gateway
# Truy cập: http://localhost:8888
```

---

## 📊 Database Management

### MariaDB Credentials
```
Host:       npm-db (docker), localhost:3306 (external)
User:       npm_user
Password:   npm_user_secret_123
Database:   npm_db
```

### Backup Database
```bash
docker exec npm_db mysqldump \
  -u npm_user \
  -pnpm_user_secret_123 \
  npm_db > npm_backup.sql
```

### Restore Database
```bash
docker exec -i npm_db mysql \
  -u npm_user \
  -pnpm_user_secret_123 \
  npm_db < npm_backup.sql
```

---

## 🛠️ Troubleshooting

### Proxy không forward traffic
**Triệu chứng**: 502 Bad Gateway

**Khắc phục**:
1. Verify service đang chạy: `docker-compose ps`
2. Check logs: `docker logs auth-service`
3. Verify Forward Hostname/IP đúng (phải là container name)
4. Restart proxy manager: `docker restart api-gateway`

### SSL Certificate Error
**Triệu chứng**: "SSL_ERROR_BAD_CERT_DOMAIN"

**Khắc phục**:
1. Admin UI → SSL Certificates tab
2. Delete certificate cũ
3. Create lại (Self-Signed hoặc Let's Encrypt)

### Admin UI không accessible
**Triệu chứng**: "Connection refused" trên port 81

**Khắc phục**:
```bash
# Check container status
docker logs api-gateway | grep "listening"

# Restart
docker restart api-gateway

# Verify port
docker ps | grep api-gateway
```

### Nginx không load (Crashed)
**Triệu chứng**: `docker logs api-gateway` → errors

**Khắc phục**:
1. Check database:
```bash
docker logs npm_db
docker exec npm_db mysql -u root -pnpm_root_secret_123 -e "SHOW DATABASES;"
```

2. Nếu database bị corrupt:
```bash
docker-compose down
docker volume rm eventmanagement_npm_data
docker-compose up -d

# Tạo lại proxy hosts
```

---

## 📝 Cheatsheet Commands

```bash
# View logs
docker logs api-gateway
docker logs npm_db
docker logs auth-service

# Restart services
docker restart api-gateway
docker restart npm_db

# Check network
docker network inspect event-network

# Shell access
docker exec -it npm_db bash
docker exec -it api-gateway bash

# Reload Nginx (áp dụng config)
docker exec api-gateway /usr/local/openresty/nginx/sbin/nginx -s reload

# View Nginx config
docker exec api-gateway cat /etc/nginx/conf.d/default.conf
```

---

## 🎯 Best Practices

### ✅ DO's
- ✅ Thay đổi default admin password
- ✅ Dùng Let's Encrypt cho CA-signed cert (production)
- ✅ Enable "Force SSL" cho tất cả proxy hosts
- ✅ Backup database thường xuyên
- ✅ Monitor logs: `docker logs api-gateway`

### ❌ DON'Ts
- ❌ Không expose port 81 lên internet (admin UI)
- ❌ Không dùng self-signed cert cho production
- ❌ Không hard-code credentials trong docker-compose
- ❌ Không sửa nginx config cứng (dùng UI)

---

## 🚀 Production Deployment

### 1. Setup Domain Name
```
Chỉ A record về public IP của server:
auth.yourdomain.com A 203.0.113.45
```

### 2. Update Proxy Host
Admin UI:
```
Domain Names:       auth.yourdomain.com
SSL Certificate:    Let's Encrypt
Force SSL:          ON
```

### 3. Whitelist Ports (Firewall)
```bash
# Open HTTPS (production)
ufw allow 5443/tcp

# Close HTTP (hoặc redirect)
ufw allow 5000/tcp   # optional
```

### 4. Use Environment Variables (Credentials)
```yaml
# docker-compose.yml
environment:
  DB_MYSQL_PASSWORD: ${NPM_DB_PASSWORD}
```

```bash
# .env file
NPM_DB_PASSWORD=strong_random_password_here
```

---

## 📊 Monitoring

### Enable Logs
Admin UI → Settings → Logs

### View Nginx Error
```bash
docker exec api-gateway cat /data/logs/error.log
docker exec api-gateway cat /data/logs/access.log
```

### Check Certificate Expiry
Admin UI → SSL Certificates tab

---

## ❓ FAQ

**Q: Tại sao services vẫn HTTP?**
A: Services chạy HTTP trong docker network (an toàn nội bộ), chỉ gateway phơi HTTPS ra ngoài.

**Q: Có thể dùng wildcard domain không?**
A: Có, Let's Encrypt hỗ trợ `*.yourdomain.com`, nhưng cần DNS validation.

**Q: Performance có bị ảnh hưởng?**
A: Nginx rất nhanh (reverse proxy overhead minimal), không đáng kể.

**Q: Có thể proxy gRPC không?**
A: Có, nhưng cần cấu hình custom Nginx (không support qua UI).

**Q: Cách reset admin password?**
A: Không có cách direct, cần reset database hoặc dùng API.

---

## ✅ Checklist Hoàn Thành

- [ ] `docker-compose up -d` chạy thành công
- [ ] Tất cả services healthy (`docker-compose ps`)
- [ ] Admin UI accessible (http://localhost:81)
- [ ] Password admin thay đổi
- [ ] MariaDB healthy (database created)
- [ ] Proxy host cho Auth Service tạo thành công
- [ ] SSL certificate generated (Self-Signed)
- [ ] HTTPS accessible (https://localhost:5443)
- [ ] Swagger docs forward đúng
- [ ] Hosts file updated (optional)

---

**🎉 Setup hoàn thành! Nginx Proxy Manager giờ đã sẵn sàng**

