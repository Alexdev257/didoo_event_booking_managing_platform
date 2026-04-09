# Hướng dẫn tích hợp SignalR cho tính năng Giữ Vé (Ticket Hold) Thời gian thực

File này cung cấp tài liệu chi tiết về cách hoạt động của SignalR bên trong `TicketService` và các hướng dẫn để phía Frontend có thể kết nối, tương tác và hiển thị số lượng vé thay đổi theo thời gian thực.

## 1. Thông tin kết nối & Port

- **Service Port**: `TicketService.Api` hiện đang chạy trên Port **6201** (`http://localhost:6201`).
- **SignalR Hub Endpoint**: `http://localhost:6201/hubs/ticket`
- **Giao thức hỗ trợ**: WebSockets (mặc định của SignalR).

## 2. Mục đích hệ thống (Purpose)

Thay vì thực hiện lệnh gọi API khoá vé (lock) trực tiếp xuống cơ sở dữ liệu mỗi lần người dùng bấm dấu cộng `+` hoặc  `-` (rất chậm và dễ gây quá tải DB), hệ thống mới sử dụng **In-Memory Reservation** kết hợp **SignalR**:
1. **Tốc độ cao**: Giữ vé tức thời trên RAM của Server.
2. **Cập nhật Live**: Khi người dùng A bấm `+` chọn 1 vé, số lượng vé còn lại lập tức được trừ đi trên RAM và kết quả mới nhất được *phóng (broadcast)* tới tất cả màn hình của người dùng B, C, D đang xem chung Event đó. 
3. **Tự động giải phóng**: Nếu người dùng A thoát trang, rớt mạng hoặc đóng Tab, SignalR trên server lập tức nhận diện thông qua hàm `OnDisconnectedAsync`. Nó sẽ trả lại toàn bộ vé mà người dùng A đang giữ (chưa thanh toán) về giỏ chung và thông báo cho người dùng B, C, D biết để hiển thị số lượng tăng lên.

## 3. Các hàm Frontend cần gọi (Từ Client -> Server)

Frontend cần khởi tạo kết nối SignalR (`HubConnectionBuilder()`) trỏ tới Endpoint trên và gọi các hàm sau (sử dụng `.invoke()` hoặc `.send()`):

### 3.1. Theo dõi Event (`JoinEventGroup`)
**Tác dụng:** Khi người dùng mở trang chi tiết một Sự Kiện (Event), Frontend phải gọi hàm này để đăng ký nhận các bản tin thay đổi vé của Event đó.
- **Tên hàm trên Hub:** `JoinEventGroup`
- **Tham số:** `eventId` (string - UUID của Event)
- **Ví dụ JS:**
  ```javascript
  await connection.invoke("JoinEventGroup", "123e4567-e89b-12d3-a456-426614174000");
  ```

### 3.2. Bỏ theo dõi Event (`LeaveEventGroup`)
**Tác dụng:** Khi người dùng rời khỏi trang chi tiết Sự Kiện. Nên gọi API này cho sạch (hoặc Server cũng tự dọn nếu họ ngắt kết nối hoàn toàn).
- **Tên hàm trên Hub:** `LeaveEventGroup`
- **Tham số:** `eventId` (string - UUID của Event)
- **Ví dụ JS:**
  ```javascript
  await connection.invoke("LeaveEventGroup", "123e4567-e89b-12d3-a456-426614174000");
  ```

### 3.3. Tương tác Chọn/Bỏ chọn vé (`SelectTicket`)
**Tác dụng:** Khi người dùng bấm `+` hoặc `-` trên giao diện, Frontend gọi hàm này để báo cho Server biết.
- **Tên hàm trên Hub:** `SelectTicket`
- **Tham số:** 
  1. `eventId` (string - UUID của Event)
  2. `ticketTypeId` (string - UUID của Loại vé, ví dụ: Vé VIP)
  3. `quantityChange` (integer - Số lượng vé cần thay đổi. Truyền **dương** `1` nếu bấm `+`. Truyền **âm** `-1` nếu bấm `-`).
- **Ví dụ JS:**
  ```javascript
  // Người dùng bấm "+" để giữ thêm 1 vé VIP
  await connection.invoke("SelectTicket", "event-uuid", "vip-ticket-uuid", 1);
  
  // Người dùng bấm "-" để bỏ giữ 2 vé Thường
  await connection.invoke("SelectTicket", "event-uuid", "normal-ticket-uuid", -2);
  ```

## 4. Các sự kiện Frontend cần lắng nghe (Do Server phát xuống)

Frontend cần định nghĩa các hàm callback bằng `connection.on(...)` để luôn cập nhật giao diện.

### 4.1. Nhận cập nhật số lượng vé mới (`ReceiveTicketUpdate`)
**Tác dụng:** Server gọi hàm này mỗi khi số lượng khả dụng của 1 vé bị thay đổi do ai đó (hoặc chính user này) chọn vé, bỏ chọn vé, hay rời mạng. Frontend lập tức cập nhật con số hiển thị trên màn hình.
- **Tên hàm phía Client:** `ReceiveTicketUpdate`
- **Tham số nhận về:**
  1. `eventId` (string)
  2. `ticketTypeId` (string)
  3. `remainingCount` (integer - Số lượng vé CÒN LẠI khả dụng tại thời điểm đó)
- **Ví dụ JS:**
  ```javascript
  connection.on("ReceiveTicketUpdate", (eventId, ticketTypeId, remainingCount) => {
      console.log(`Vé ${ticketTypeId} của Event ${eventId} hiện chỉ còn ${remainingCount} vé!`);
      // TODO: Cập nhật DOM (Ví dụ thay đổi thuộc tính `innerText` của ô hiển thị số lượng)
      updateUITicketQuantity(ticketTypeId, remainingCount);
      
      // Nếu remainingCount == 0, disable nút "+" của loại vé này
      if (remainingCount <= 0) {
          disablePlusButton(ticketTypeId);
      } else {
          enablePlusButton(ticketTypeId);
      }
  });
  ```

### 4.2. Nhận thông báo lỗi khi hết vé (`ReceiveTicketUpdateFailed`)
**Tác dụng:** Xảy ra nếu người dùng cố bấm `+` nhưng ở phía Server tính toán là vé đã hết (ai đó đã nhanh tay hơn), lúc này Server sẽ báo lỗi về cho **riêng người dùng đó**.
- **Tên hàm phía Client:** `ReceiveTicketUpdateFailed`
- **Tham số nhận về:**
  1. `ticketTypeId` (string)
  2. `errorMessage` (string)
- **Ví dụ JS:**
  ```javascript
  connection.on("ReceiveTicketUpdateFailed", (ticketTypeId, errorMessage) => {
      alert(`Không thể chọn thêm vé này: ${errorMessage}`);
      // TODO: Đồng bộ lại số lượng trên UI, có thể tự động gọi fetch API lấy số lượng chuẩn nếu cần
  });
  ```

## 5. Tóm tắt Luồng chuẩn Frontend
1. Start Connection.
2. `JoinEventGroup(eventId)`.
3. Lắng nghe `ReceiveTicketUpdate` để thay đổi giao diện realtime. Lắng nghe `ReceiveTicketUpdateFailed` để báo hết vé.
4. User ấn `+`, Frontend chặn nếu số lượng trên UI báo hết, nếu còn thì gọi `SelectTicket(..., 1)`. Tăng số lượng giữ nội bộ của user lên 1.
5. User ấn `-`, Frontend gọi `SelectTicket(..., -1)`. Giảm số lượng giữ nội bộ của user đi 1.
6. Khi user click `Thanh Toán / Booking`, Frontend gọi API POST tới Backend. Lúc này Backend sẽ tổng hợp lượng vé user đang giữ trong bộ nhớ bằng TicketReservationService và tiến tới lock DB chính thức.
7. Thoát trang thì gọi `LeaveEventGroup(eventId)`. (Nếu người dùng đóng trình duyệt, hệ thống tự động xử lý trả vé mà JS không cần làm gì).
