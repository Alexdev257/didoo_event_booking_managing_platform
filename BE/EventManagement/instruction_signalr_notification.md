# Hướng dẫn tích hợp SignalR cho tính năng Thông báo (Notification)

File này cung cấp tài liệu chi tiết về cách hoạt động của SignalR bên trong hệ thống (cụ thể là `OperationService` / YARP Gateway) và các hướng dẫn để phía Frontend có thể kết nối, tương tác và hiển thị thông báo theo thời gian thực (Real-time).

## 1. Thông tin kết nối & Port

- **API Gateway (YARP)**: Backend đang cấu hình chạy qua API Gateway (`ApiGatewayYarp`). Port tùy thuộc vào khi bạn khởi chạy Gateway (ví dụ `5001` HTTP hoặc `5000` HTTPS).
- **Service Gốc**: `OperationService.Api` hiện đang chạy trên Port **6501** (`http://localhost:6501`).
- **SignalR Hub Endpoint**: Khuyến nghị gọi qua Gateway: `http://localhost:5001/hubs/notification` (Hoặc trực tiếp Port `6501` nếu đang test cục bộ).
- **Giao thức hỗ trợ**: WebSockets (mặc định của SignalR).

## 2. Mục đích & Luồng hoạt động

- **Mục đích**: Chuyển các thông báo quan trọng đến Client (ví dụ: Booking thành công, Vé đã bán xong, Organizer được duyệt/từ chối, v.v.) ngay lập tức mà không cần Client phải load lại trang (F5) hay liên tục polling (gọi API sau mỗi X giây).
- **Hoạt động**: Điểm khác biệt so với Ticket Hub (gửi cho nhiều người cùng xem 1 event) là **Notification Hub chỉ gửi thông báo tới đúng cá nhân người đó**. Backend dùng cơ chế `Clients.User(userId)` của SignalR để gửi, nên **Bắt buộc người dùng phải Đăng nhập (có chuỗi JWT Token)** thì mới kết nối và nhận được thông báo.

## 3. Cách khởi tạo kết nối (Frontend)

Vì SignalR dùng kết nối WebSockets nên nó **không hỗ trợ gửi Header `Authorization: Bearer <token>` chuẩn**. Do đó, Backend đã được cấu hình để đọc Token trực tiếp từ URL Request (Query string `access_token`).

Frontend cần khởi tạo kết nối như sau:

```javascript
import * as signalR from "@microsoft/signalr";

// 1. Lấy token của người dùng đang đăng nhập
const token = localStorage.getItem("access_token"); 

// 2. Cấu hình Hub Connection
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5001/hubs/notification", { 
        // SignalR sẽ tự động gán "?access_token=xxx" vào phía sau URL
        accessTokenFactory: () => token 
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

// 3. Khởi động kết nối
async function startNotificationHub() {
    try {
        await connection.start();
        console.log("Connected to Notification Hub");
    } catch (err) {
        console.error("Error connecting to Notification Hub", err);
    }
}

startNotificationHub();
```

## 4. Bắt sự kiện nhận thông báo (`ReceiveNotification`)

Server sẽ chủ động *Push (Gửi)* dữ liệu xuống cho Client của User thông qua hàm có tên là **`ReceiveNotification`**. Frontend cần thiết lập bộ lắng nghe (listener) sự kiện này.

- **Tên hàm sự kiện:** `ReceiveNotification`
- **Payload nhận về:** Là một Object (JSON) chứa các thông tin của thông báo.

```javascript
connection.on("ReceiveNotification", (notification) => {
    console.log("Bạn có một thông báo mới:", notification);

    // Cấu trúc của tham số 'notification' sẽ như sau:
    // {
    //   "title": "Booking Thành Công",
    //   "message": "Vé của bạn cho sự kiện ABC đã được xác nhận.",
    //   "type": "BookingSuccess", 
    //   "relatedId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", // (Có thể Null) Dùng để FE tạo link bấm vào xem chi tiết
    //   "createdAt": "2026-03-14T10:00:00Z"
    // }

    // TODO: Hiển thị lên Toast notification (ví dụ dùng react-toastify)
    // toast.success(notification.title + ": " + notification.message);

    // TODO: Cập nhật lại biểu tượng "Quả chuông" (tăng số chưa đọc lên +1)
});
```

## 5. Các lưu ý quan trọng

1. **Token hết hạn:** Nếu Token rớt mạng hoặc hết hạn, SignalR có thể sẽ văng lỗi `401 Unauthorized`. Phía Frontend cần bắt lỗi này và yêu cầu Refresh Token, sau đó tạo kết nối SignalR mới.
2. **Khi user Đăng xuất (Logout):** Đừng quên ngắt kết nối SignalR để giải phóng tài nguyên.
   ```javascript
   if (connection) {
       await connection.stop();
   }
   ```
3. **Đồng bộ hóa dữ liệu với REST API:** SignalR chỉ đóng vai trò PUSH (báo ngay thời gian thực). Nếu người dùng lúc đó đang offline (vừa tắt máy tính), họ sẽ không nhận được. Do đó, Frontend thường vẫn phải kết hợp gọi API GET `/api/notifications` mỗi khi User load lại trang lần đầu để đồng bộ toàn bộ giỏ thông báo (bao gồm các notification sinh ra lúc User Offline).
