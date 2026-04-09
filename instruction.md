# Hướng dẫn tạo Notification SignalR khi xác thực Organizer

Dựa vào kiến trúc hiện tại của dự án (Microservices, CQRS, MassTransit đã có sẵn, SignalR mẫu ở `TicketService`), dưới đây là hướng giải quyết chi tiết nhất để khi `Organizer` được verify thì bắn tín hiệu SignalR về cho user (người tạo ra Organizer) mở khóa tính năng đăng sự kiện.

## Tóm tắt luồng hoạt động
1. Khi gọi endpoint `/api/organizers/verify`, `OrganizerVerifyCommandHandler` trong `EventService` sẽ xử lý cập nhật trạng thái `IsVerified=true`.
2. Sau khi lưu vào Database thành công, Handler này publish một sự kiện là `OrganizerVerifiedEvent` bằng `IMessageProducer` qua MassTransit.
3. Ở 1 Service có cấu hình SignalR Hub (bạn có thể dựng `NotificationService` hoặc thêm thẳng cấu hình vào `EventService` / `ApiGateway`), tạo 1 Consumer lắng nghe event này. Consumer nhận được sẽ dùng `IHubContext` bắn tín hiệu SignalR tới **điểm đích danh là User đã tạo Organizer**.
4. Frontend nhận tín hiệu và mở khóa UI.

Dưới đây là các bước triển khai code chi tiết:

---

## Bước 1: Khai báo Event dùng chung trong lớp Shared
Hệ thống bạn đang dùng `SharedContracts.Events` cho các events giữa các service. Khởi tạo file mới dưới đường dẫn `BE/EventManagement/shared/SharedContracts/Events/OrganizerVerifiedEvent.cs`:

```csharp
using System;

namespace SharedContracts.Events
{
    public class OrganizerVerifiedEvent : IntegrationEvent
    {
        public Guid OrganizerId { get; set; }
        
        // Chứa ID của User (người tạo ra Organizer) cần nhận Push Notification
        public Guid UserId { get; set; } 
    }
}
```

---

## Bước 2: Publish Event sau khi Verify Organizer thành công
Mở file `BE\EventManagement\services\EventService\src\EventService.Application\CQRS\Handler\Organizer\OrganizerVerifyCommandHandler.cs` và tiến hành các cập nhật:

1. **Inject `IMessageProducer`** vào constructor:
```csharp
using SharedContracts.Interfaces;
using SharedContracts.Events;
// ... các using khác

public class OrganizerVerifyCommandHandler : IRequestHandler<OrganizerVerifyCommand, OrganizerVerifyResponse>
{
    private readonly IEventUnitOfWork _unitOfWork;
    private readonly IMessageProducer _messageProducer;

    public OrganizerVerifyCommandHandler(IEventUnitOfWork unitOfWork, IMessageProducer messageProducer)
    { 
        _unitOfWork = unitOfWork;
        _messageProducer = messageProducer;
    }
    // ...
```

2. **Publish event** bên trong block `try`, TRƯỚC dòng `return` khi lưu DB thành công:
```csharp
try
{
    organizer.IsVerified = true;
    organizer.Status = Domain.Enum.OrganizerStatusEnum.Verified;
    _unitOfWork.Organizers.UpdateAsync(organizer);
    await _unitOfWork.CommitTransactionAsync();

    // ---- ĐOẠN ĐƯỢC THÊM VÀO ----
    // Ta lấy CreatedBy (kế thừa từ AuditableEntity) đây chính là Id của user tạo organizer
    if (organizer.CreatedBy.HasValue)
    {
        var verifiedEvent = new OrganizerVerifiedEvent
        {
            OrganizerId = organizer.Id,
            UserId = organizer.CreatedBy.Value
        };
        // Gửi sang RabbitMQ
        await _messageProducer.PublishAsync(verifiedEvent, cancellationToken);
    }
    // ----------------------------

    return new OrganizerVerifyResponse
    {
        IsSuccess = true,
        Message = "Update Organizer Successfully",
        // ... Code trả về DTO giữ nguyên
    };
}
```

---

## Bước 3: Đẩy thông báo qua SignalR Context

Giả định bạn sử dụng một Service (hoặc tạo ra 1 Hub chuyên thông báo như `NotificationHub`), bạn cần một Consumer để đón `OrganizerVerifiedEvent` từ RabbitMQ và đẩy bằng SignalR `IHubContext`.

Tạo file Consumer (Có thể đặt ở `NotificationService` hoặc Service nào đang host Notification Hub của bạn):

```csharp
using MassTransit;
using Microsoft.AspNetCore.SignalR;
using SharedContracts.Events;
// Import namespace của Hub bạn muốn dùng, ví dụ: using NotificationService.Hubs;

namespace NotificationService.Consumers
{
    public class OrganizerVerifiedEventConsumer : IConsumer<OrganizerVerifiedEvent>
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public OrganizerVerifiedEventConsumer(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task Consume(ConsumeContext<OrganizerVerifiedEvent> context)
        {
            var message = context.Message;
            
            // Gửi đích danh tới duy nhất user đó dựa vào chuỗi ID
            // SignalR hiểu userId thông qua thuộc tính ClaimTypes.NameIdentifier khi user thực hiện Auth Token lúc setup connection.
            await _hubContext.Clients.User(message.UserId.ToString())
                .SendAsync("OnOrganizerVerified", new 
                { 
                    OrganizerId = message.OrganizerId,
                    Message = "Tài khoản Nhà tổ chức của bạn đã được xác thực thành công. Bạn có thể bắt đầu đăng sự kiện!"
                });
        }
    }
}
```

*(Lưu ý khi config Service: Đảm bảo đăng ký Consumer này trong config MassTransit bên `Program.cs` giống như cách bạn đã cấu hình EmailConsumer).*

---

## Bước 4: Client Lắng nghe & Mở khóa UI

Tại Frontend (ReactJS/NextJS...), khi User đăng nhập và tham gia khởi tạo cấu hình SignalR, cần tuân thủ 2 việc sau:
1. **Truyền AccessToken** (JWT) chứa user `Id` lên SignalR Server để Hub phân giải được `Clients.User()`.
2. Lắng nghe event `OnOrganizerVerified` để tác động mở khóa UI.

```javascript
import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("YOUR_GATEWAY_URL/notificationHub", {
        // Access token bắt buộc phải được đẩy lên để BE định danh UserId
        accessTokenFactory: () => "<Access_Token_Của_User>" 
    })
    .withAutomaticReconnect()
    .build();

// Lắng nghe tín hiệu verify
connection.on("OnOrganizerVerified", (data) => {
    console.log("Xác thực thành công cho Organizer: ", data.OrganizerId);
    
    // CODE UI: Hành động khi xác thực
    // 1. Alert / Toast báo xác định thành công cho người dùng
    // 2. Cập nhật Redux Store / App Context để "Unlock" nút Đăng Sự kiện
    // 3. Hoặc có thể tự trigger 1 hàm fetch API để làm mới profile/role của current user
});

await connection.start();
```

## Tóm gọn mấu chốt
Lý do giải quyết như cách trên:
- **`AuditableEntity`** của bạn lưu trữ trường `CreatedBy`, nên luôn biết Organizer được tạo bởi user ID nào. Dùng ID này làm ID bắn SignalR cực kì bảo mật.
- Kết hợp **MassTransit** đảm bảo `EventService` chỉ làm duy nhất việc `Verify` và không bị quá tải khi phải quản lý Hub Connections.
- Dùng cấu trúc **Clients.User(userId)** của SignalR thay vì `Clients.All` hay `Group` giúp tin nhắn đi đích danh chỉ báo cho duy nhất người thiết lập ra tính năng đó.
