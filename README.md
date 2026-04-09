# Didoo - Hệ thống Quản lý Sự kiện & Quy mô Đặt vé Mạng lưới (Event Management & Ticketing Platform)

---

## 📌 1. Bối cảnh & Nội dung Dự án (Project Overview)

**Didoo** là một nền tảng quản trị luồng sự kiện và bán vé đầu cuối (End-to-End Ticketing Platform). Mục tiêu của dự án là số hóa quy trình tổ chức sự kiện, cung cấp nền tảng giao dịch vé tin cậy và minh bạch. 

Dự án phục vụ 3 nhóm đối tượng người dùng với các luồng tính năng khác biệt:
1.  **Dành cho Khách hàng (User):** 
    *   Khám phá các sự kiện mớ, xem trực tiếp sự kiện thông qua bản đồ định vị địa lý (Map).
    *   Đặt/Mua vé thông qua quy trình Giỏ hàng ảo cực nhanh. Thanh toán trực tuyến.
    *   Nhận và lưu trữ vé điện tử bằng Mã QR/Barcode (E-Ticket).
    *   **Thương mại thứ cấp (Resale):** Có thể an tâm đăng chuyển nhượng vé (Resale) cho người khác ngay trên hệ thống một cách chính thống.
2.  **Dành cho Nhà tổ chức (Organizer):** 
    *   Đăng ký tài khoản và gửi yêu cầu phê duyệt thông tin pháp lý nhà tổ chức.
    *   Tạo mới sự kiện, cấu hình thời gian, địa điểm, tạo nhiều Hạng vé (Ticket Types) khác nhau và quy định giá linh hoạt.
    *   Theo dõi Dashboard (Bảng điều khiển) doanh thu. Mở app Mobile cung cấp luồng **Quét QR Code** Check-in nhanh gọn tại cổng sự kiện.
3.  **Dành cho Quản trị viên (Admin):** 
    *   Phê duyệt Nhà tổ chức, Phê duyệt sự kiện nhạy cảm trước khi Publish.
    *   Kiểm soát các chỉ số tổng quan của toàn bộ nền tảng.

---

## 🏛️ 2. Kiến trúc & Công nghệ (Architecture & Technologies)

Dự án được xây dựng với hệ thống phần mềm cấp doanh nghiệp, chia làm 3 phân hệ cấu trúc khổng lồ:

### ⚙️ 2.1 Backend (Microservices)
Được viết trên **C# / .NET 8**, áp dụng tư tưởng **CQRS, Event-Driven, Database-per-Service** vô cùng chặt chẽ.

*   **API Gateway (YARP)**: Service `ApiGatewayYarp` chạy trên Port 5000 đóng vai trò điều hướng Reverse Proxy, ẩn giấu cấu trúc mạng bên trong khỏi Client.
*   **Giao tiếp Đồng bộ SIÊU NHANH qua gRPC:** 
    *   **Vì sao dùng gRPC?** Các Microservice thường xuyên phải hỏi mượn dữ liệu của nhau (Ví dụ: `BookingService` gọi mượn logic kho vé `TicketService` để check tồn kho).
    *   Thay vì gọi HTTP/REST nặng nề, hệ thống setup **gRPC Server ở port 81** chạy Protocol `HTTP/2`. Client gRPC serialize dữ liệu ra nhị phân (Binary) qua class Protobuf (SharedContracts.Protos), cho hiệu năng vượt trội, không độ trễ nghẽn mạng nội bộ.
*   **Giao tiếp Bất đồng bộ qua RabbitMQ & MassTransit:** 
    *   Đóng vai trò Message Broker (Event Bus). Giảm rủi ro chết dây chuyền khi xử lý luồng phức tạp.
    *   Ví dụ: Verify Organizer thành công ở `EventService`, hệ thống ném `OrganizerVerifiedEvent` lên RabbitMQ rồi End HTTP Request về FE cực kì nhanh. Các hệ thống khác sẽ nhận file message ngầm.
*   **Real-time với SignalR (OperationService):** 
    *   Dùng để Push Notification. SignalR bắt được các sự kiện RabbitMQ và Real-time đẩy Web-socket tới UI / Mobile bằng UserId chính xác để tự động mở khóa UI mà không cần tải lại trang.
*   **Cơ sở dữ liệu (Database):** Toàn bộ sử dụng **MySQL 8** phân luồng bằng Entity Framework Core cùng Caching tốc độ cao qua **Redis 7**. Phân rã 5 DB: `AuthDb`, `EventDb`, `TicketDb`, `BookingDb`, `OperationDb`.

### 💻 2.2 Frontend (Web Application)
Bản quản trị và Cổng thông tin cho User. Chạy ở nền tảng Web có chuẩn SEO cao và tối ưu Rendering.

*   **Core Framework:** Sử dụng **Next.js 16** (Server-Side Rendering) kèm **React 19** phân tách theo **App Router**.
    *   Module Admin/Organizer: Thư mục `/src/app/(dashboard)`
    *   Module User (Events, Booking, Map, Resale): Thư mục `/src/app/(user)`
*   **UI/UX (Giao diện):** Cực kỳ đầu tư dựa trên framework tiện ích **Tailwind CSS v4** và nền móng không định hình **Radix-UI / Shadcn UI**. Hỗ trợ UX qua **Framer Motion**, cực kỳ mượt mà.
*   **Quản lý State & Gọi API (State Management):** 
    *   Thay cho Redux Boilerplate mệt mỏi, sử dụng **Zustand** quản lý Token và Settings cục bộ web cực kỳ vi diệu và nhanh.
    *   Tất cả thao tác HTTP Fetch được bao bọc nhờ **@tanstack/react-query** xử lý Background Caching, Loading State.
*   **Interactive Maps:** Tích hợp các thư viện chuyên ngành `react-map-gl`, `maplibre-gl` đáp ứng nhu cầu xem Venue Sự Kiện trực tiếp.
*   **Render E-Ticket:** Tạo và in Mã Vạch E-Ticket thông qua `react-qr-code`, `react-barcode`. Xử lý Form bằng `react-hook-form` & validate bởi `Zod`.

### 📱 2.3 Mobile (Cross-platform App)
Ứng dụng dành cho User / Organizer sử dụng khi đang di chuyển, kiểm soát vé Offline và trải nghiệm di động gốc.

*   **Core Framework:** **React Native (0.81.5)** với **Expo SDK 54**.
*   **Điều hướng thông thái (Navigation):** Triển khai luồng cấu trúc thư mục mới của **Expo Router** (các folders `/app/(tabs)`, `/app/(main)/event`, `/app/(main)/booking`, `ticket`, `resale`) thay vì code Navigation tay.
*   **Data layer (State):** Copy toàn bộ sự linh hoạt của Web qua ngõ **Zustand** + **TanStack Query** + **Axios Interceptor** để tái sử dụng kiến thức tư duy.
*   **Trải nghiệm API Device Gốc (Native APIs):**
    *   `@react-native-google-signin` & `expo-auth-session`: Đăng nhập bằng tài khoản Google.
    *   `expo-secure-store`: Giữ khóa an toàn Token JWT.
    *   Tận dụng sức mạnh thiết bị bằng quét thẻ (Camera Scanner for Tickets), Lấy Vị Trí Hiện Tại (`expo-location`), Tạo Xúc Giác (`expo-haptics`).

---

## 🚀 3. Hướng dẫn Triển khai (Start Project)

Hệ thống cung cấp giải pháp Dockerize toàn vẹn cho hạ tầng phức tạp.

### Khởi chạy Backend và Infrastructure
Cài đặt Docker Desktop. Mở thư mục gốc và đổi vào `BE/EventManagement`:
```bash
docker-compose up --build -d
```
Hệ thống tự động thiết lập MySQL, RabbitMQ, Redis, 8 Microservices và Gateway. API Gateway cung ứng tại Cổng `localhost:5000`.

### Khởi chạy System Web (Frontend Next.js)
```bash
cd FE
npm install
npm run dev
```
Truy cập `http://localhost:3000`

### Khởi chạy Mobile App (Expo / React Native)
Yêu cầu thiết bị di động có ứng dụng **Expo Go**.
```bash
cd Mobile
npm install 
npm run start
```
Scanner mã QR trên terminal bằng cục Camera của điện thoại (hoặc xài app Expo Go cho Android) để khởi sự Test App.