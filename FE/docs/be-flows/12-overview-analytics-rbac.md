# 12. Overview Analytics & Phân quyền RBAC

Tài liệu yêu cầu Backend tạo các endpoint phân tích dữ liệu (analytics) cho phần Overview/Dashboard và quy định phân quyền theo role cho các page và API.

---

## 1. Roles trong hệ thống

| Role ID | Tên | Mô tả |
|---------|-----|-------|
| 1 | ADMIN | Quản trị viên hệ thống |
| 2 | USER | Người dùng thường |
| 3 | ORGANIZER | Nhà tổ chức (User có `isOrganizer: true` + organizer đã verify) |
| 4 | GUEST | Khách (chưa đăng nhập) |

**Lưu ý:** Token JWT chỉ có `Role: "1" | "2"`. Organizer = User có `IsOrgainizer: "true"` trong JWT.

---

## 2. Yêu cầu Endpoint Analytics cho Overview

### 2.1. Admin Dashboard Overview

**Route:** `GET /api/analytics/admin/overview`  
**Phân quyền:** Chỉ `Role = ADMIN`

**Response mẫu:**

```json
{
  "totalUsers": 1250,
  "usersGrowthPercent": 12.5,
  "totalOrganizers": 45,
  "pendingOrganizers": 3,
  "totalEvents": 180,
  "activeEvents": 42,
  "pendingEvents": 8,
  "totalRevenue": 125000000,
  "avgOrderValue": 250000,
  "revenueGrowthPercent": 8.2,
  "totalResaleRevenue": 15000000,
  "activeListings": 25,
  "totalListings": 120,
  "totalResaleTransactions": 85,
  "revenueTrend": [
    { "date": "2025-03-01", "revenue": 4200000, "orders": 18 },
    { "date": "2025-03-02", "revenue": 5100000, "orders": 22 }
  ],
  "orderStatusBreakdown": [
    { "status": "Paid", "count": 450, "percent": 75 },
    { "status": "Pending", "count": 100, "percent": 17 },
    { "status": "Cancelled", "count": 50, "percent": 8 }
  ]
}
```

**Tham số query (tùy chọn):**
- `fromDate` (string, ISO): Bắt đầu khoảng thời gian
- `toDate` (string, ISO): Kết thúc khoảng thời gian
- `period` (string): `7d` | `30d` | `90d` — mặc định `30d`

---

### 2.2. Organizer Dashboard Overview

**Route:** `GET /api/analytics/organizer/overview`  
**Phân quyền:** `Role = USER` + `IsOrgainizer = true` + Chỉ lấy dữ liệu của organizerId của user

**Response mẫu:**

```json
{
  "organizerId": "uuid",
  "totalRevenue": 25000000,
  "revenueGrowthPercent": 15.3,
  "ticketsSold": 1250,
  "ticketsSoldGrowthPercent": 8.5,
  "occupancyRate": 72.5,
  "occupancyGrowthPercent": 3.2,
  "openedEventsCount": 5,
  "upcomingPublishedCount": 3,
  "chartData": [
    { "name": "T2", "sales": 120, "capacity": 200, "occupancy": 60 },
    { "name": "T3", "sales": 180, "capacity": 200, "occupancy": 90 }
  ],
  "recentEvents": [
    {
      "id": "uuid",
      "name": "Concert A",
      "startTime": "2025-03-20T19:00:00Z",
      "status": 4,
      "revenue": 5000000,
      "soldCount": 250,
      "totalCapacity": 300,
      "occupancyPercent": 83
    }
  ]
}
```

**Tham số query:**
- `organizerId` (string, required): Lấy từ JWT hoặc truyền — BE phải verify organizerId thuộc user
- `period` (string): `7d` | `30d` — mặc định `30d`

---

### 2.3. User Dashboard Overview (Tùy chọn)

**Route:** `GET /api/analytics/user/overview`  
**Phân quyền:** `Role = USER`

**Response mẫu:**

```json
{
  "userId": "uuid",
  "totalTicketsOwned": 5,
  "totalResaleListings": 2,
  "recentBookingsCount": 3,
  "recentResaleTransactionsCount": 1
}
```

**Ghi chú:** User dashboard hiện FE đang dùng các API riêng lẻ (bookings, tickets, ticketlistings). Có thể tạo endpoint tổng hợp để giảm số request.

---

## 3. Phân quyền Page (Frontend Routes)

### 3.1. Bảng ánh xạ Route → Role

| Route prefix | Roles được phép | Điều kiện bổ sung |
|--------------|------------------|-------------------|
| `/admin/*` | ADMIN | — |
| `/organizer/*` | USER | `IsOrgainizer = true` (trong JWT) |
| `/user/dashboard/*` | USER | — |
| `/home`, `/events/*`, `/resale/*` | USER, GUEST | Một số route cần login (booking, resale trade) |
| `/login`, `/register` | Public | — |

### 3.2. Chi tiết Admin Pages

| Page | Route | Role | API cần phân quyền |
|------|-------|------|---------------------|
| Dashboard | `/admin/dashboard` | ADMIN | `GET /api/analytics/admin/overview` |
| Users | `/admin/users` | ADMIN | `GET /api/users` (role filter) |
| Organizers | `/admin/organizers` | ADMIN | `GET /api/organizers` |
| Events | `/admin/events` | ADMIN | `GET /api/events` |
| Categories | `/admin/categories` | ADMIN | `GET /api/categories` |
| Revenue | `/admin/revenue` | ADMIN | `GET /api/bookings` |
| Resale | `/admin/resale` | ADMIN | `GET /api/ticketlistings`,  |
| Profile | `/admin/profile` | ADMIN | `GET /api/users/{id}` |

### 3.3. Chi tiết Organizer Pages

| Page | Route | Role | API cần phân quyền |
|------|-------|------|---------------------|
| Dashboard | `/organizer/dashboard` | USER + isOrganizer | `GET /api/analytics/organizer/overview` |
| Events | `/organizer/events` | USER + isOrganizer | `GET /api/events?organizerId={id}` |
| Orders | `/organizer/orders` | USER + isOrganizer | `GET /api/bookings` (filter theo event của organizer) |
| Earnings | `/organizer/earnings` | USER + isOrganizer | Dữ liệu từ bookings |
| Profile | `/organizer/profile` | USER + isOrganizer | `GET /api/organizers/{id}` |

### 3.4. Chi tiết User Pages

| Page | Route | Role | API cần phân quyền |
|------|-------|------|---------------------|
| Dashboard | `/user/dashboard` | USER | `GET /api/bookings`, `GET /api/tickets`, `GET /api/ticketlistings` |
| Tickets | `/user/dashboard/tickets` | USER | `GET /api/tickets?ownerId={userId}` |
| History | `/user/dashboard/history` | USER | `GET /api/bookings?userId={userId}` |
| Resales | `/user/dashboard/resales` | USER | `GET /api/ticketlistings?sellerUserId={userId}` |
| Profile | `/user/dashboard/profile` | USER | `GET /api/users/{id}` |

---

## 4. Phân quyền API (Backend)

### 4.1. Bảng ánh xạ API → Role

| API Group | Endpoint pattern | ADMIN | USER | ORGANIZER (USER+isOrg) | Ghi chú |
|-----------|------------------|-------|------|------------------------|---------|
| **Analytics** | `GET /api/analytics/admin/*` | ✅ | ❌ | ❌ | Chỉ admin |
| | `GET /api/analytics/organizer/*` | ❌ | ❌ | ✅ | Chỉ organizer, verify organizerId |
| | `GET /api/analytics/user/*` | ❌ | ✅ | ✅ | Chỉ data của userId |
| **Users** | `GET /api/users` (list) | ✅ | ❌ | ❌ | Admin xem tất cả |
| | `GET /api/users/{id}` | ✅ | Own only | Own only | User chỉ xem chính mình |
| **Organizers** | `GET /api/organizers` (list) | ✅ | ❌ | ❌ | Admin xem tất cả |
| | `GET /api/organizers/{id}` | ✅ | Public | Own | Organizer xem chi tiết mình |
| | `PATCH /api/organizers/{id}/verify` | ✅ | ❌ | ❌ | Chỉ admin verify |
| **Events** | `GET /api/events` | ✅ | ✅ | ✅ | Filter theo role |
| | `POST /api/events` | ❌ | ❌ | ✅ | Chỉ organizer tạo |
| | `PATCH /api/events/{id}` | ✅ | ❌ | Own | Admin hoặc organizer sở hữu |
| **Bookings** | `GET /api/bookings` | ✅ | Own | Own events | Admin: all; User: userId; Org: eventId in organizer |
| **Ticket Listings** | `GET /api/ticketlistings` | ✅ | Own | ✅ | Admin: all; User/Org: sellerUserId |
| **Notifications** | `GET /api/notifications/me` | ✅ | ✅ | ✅ | Mỗi user chỉ xem của mình |

### 4.2. Middleware / Authorize Attributes (gợi ý BE)

- `[Authorize(Roles = "Admin")]` — Chỉ ADMIN
- `[Authorize(Roles = "User")]` — USER hoặc ORGANIZER (vì Organizer dùng role User)
- Custom: `[AuthorizeOrganizer]` — Verify JWT có `IsOrgainizer = true` và resource thuộc organizerId của user
- Custom: `[AuthorizeOwner]` — Verify resource thuộc userId trong JWT

---

## 5. Tóm tắt Endpoint cần BE triển khai

| # | Method | Endpoint | Role | Mô tả |
|---|--------|----------|------|-------|
| 1 | GET | `/api/analytics/admin/overview` | ADMIN | Tổng quan hệ thống: users, organizers, events, revenue, resale, charts |
| 2 | GET | `/api/analytics/organizer/overview` | ORGANIZER | Tổng quan nhà tổ chức: revenue, vé bán, chart 7 ngày, sự kiện gần đây |
| 3 | GET | `/api/analytics/user/overview` | USER | (Tùy chọn) Tổng hợp vé, đơn hàng, resale của user |

---

## 6. Lưu ý tích hợp

1. **FE hiện tại:** Admin và Organizer dashboard đang gọi nhiều API riêng lẻ (users, organizers, events, bookings, ticketlistings...) rồi aggregate ở client. Endpoint analytics giúp:
   - Giảm số request
   - BE tính toán chính xác (growth %, trend)
   - Thống nhất logic phân quyền

2. **Proxy/Middleware FE:** Đã có `rolePermissions` và check `IsOrganizer` cho `/organizer`. BE cần đảm bảo API trả 403 khi role không đủ.

3. **JWT Claims:** Backend cần đảm bảo khi refresh token, JWT mới có `IsOrganizer` cập nhật theo DB (khi user được verify organizer).
