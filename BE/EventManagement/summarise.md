# Tóm Tắt Source Code - EventManagement System

## Tổng Quan
Dự án Microservices (.NET 8).

## Cấu Hình RabbitMQ
- **Đã Sửa**: SharedInfrastructure hỗ trợ scan consumer, Email Service đã đăng ký Consumer.
- **Trạng Thái**: ✅ Email sẽ được gửi khi có sự kiện.

## Logic Đăng Ký (`Register` & `VerifyRegister`)
- **Wiring (Kết Nối)**: ✅ Đã sửa `AuthController`, gọi đúng `VerifyRegisterCommand`.
- **Logic Lưu Dữ Liệu**: ⚠️ **CẢNH BÁO LỖI ID**.

**Chi tiết lỗi ID:**
Trong `RegisterCommandHandler`, dòng code gán `Id = Guid.NewGuid()` đang bị comment.
Trong `User` và `BaseEntity`, `Id` không được khởi tạo giá trị default.
-> Khi lưu vào DB, tất cả User sẽ có Id là `00000000-0000-0000-0000-000000000000` (Guid.Empty).
-> **Hậu quả**:
    - User đầu tiên đăng ký: Thành công.
    - User thứ hai đăng ký: **Lỗi Duplicate Key** (do trùng Id 0000...).

**Khuyến nghị ngay**:
Uncomment dòng `Id = Guid.NewGuid(),` trong `RegisterCommandHandler.cs`.
