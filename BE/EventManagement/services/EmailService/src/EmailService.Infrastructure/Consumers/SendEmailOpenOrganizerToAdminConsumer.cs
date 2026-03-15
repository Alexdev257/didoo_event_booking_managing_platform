using EmailService.Infrastructure.Services;
using MassTransit;
using SharedContracts.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EmailService.Infrastructure.Consumers
{
    public class SendEmailOpenOrganizerToAdminConsumer : IConsumer<SendEmailOpenOrganizerToAdminEvent>
    {
        private readonly EmailSender _emailSender;
        public SendEmailOpenOrganizerToAdminConsumer(EmailSender emailSender)
        {
            _emailSender = emailSender;
        }

        public async Task Consume(ConsumeContext<SendEmailOpenOrganizerToAdminEvent> context)
        {
            var data = context.Message;

            Console.WriteLine($"[RabbitMQ] Nhận yêu cầu gửi email thông báo tạo Organizer: {data.OrganizerName}");

            // 1. Chuẩn bị Tiêu đề và Nội dung HTML
            string subject = $"[Didoo System] Yêu cầu duyệt Ban tổ chức mới: {data.OrganizerName}";

            string htmlBody = $@"
            <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;'>
                
                <div style='background-color: #2c3e50; padding: 20px; text-align: center;'>
                    <h2 style='margin: 0; color: #ffffff;'>Có Đơn Đăng Ký Organizer Mới</h2>
                </div>
                
                <div style='padding: 25px;'>
                    <p>Chào Ban Quản Trị,</p>
                    <p>Hệ thống vừa nhận được một yêu cầu mở tài khoản Ban Tổ Chức (Organizer) cần được xét duyệt.</p>
                    
                    <h3 style='border-bottom: 2px solid #3498db; padding-bottom: 5px; color: #2980b9;'>Thông Tin Chi Tiết</h3>
                    <table style='width: 100%; border-collapse: collapse;'>
                        <tr>
                            <td style='padding: 8px 0; width: 35%;'><strong>Tên Organizer:</strong></td>
                            <td style='padding: 8px 0; font-size: 16px; font-weight: bold;'>{data.OrganizerName}</td>
                        </tr>
                        <tr>
                            <td style='padding: 8px 0;'><strong>Người đại diện (Owner):</strong></td>
                            <td style='padding: 8px 0;'>{data.OwnerName}</td>
                        </tr>
                    </table>

                    <div style='text-align: center; margin-top: 35px; margin-bottom: 20px;'>
                        <a href='https://didoo-events.vercel.app/admin/organizers/{data.OrganizerId}' 
                           style='background-color: #27ae60; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;'>
                           Kiểm Tra & Xét Duyệt
                        </a>
                    </div>
                </div>
                
                <div style='background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d;'>
                    <p style='margin: 0;'>Email tự động từ hệ thống Didoo. Vui lòng không trả lời email này.</p>
                </div>
            </div>";

            // 2. Lặp qua danh sách Admin để gửi mail
            if (data.ToEmail != null && data.ToEmail.Any())
            {
                foreach (var adminEmail in data.ToEmail)
                {
                    try
                    {
                        // Gọi hàm gửi mail thực tế của bạn
                        await _emailSender.SendAsync(adminEmail, subject, htmlBody);
                        Console.WriteLine($"[RabbitMQ] Đã gửi email thông báo cho Admin: {adminEmail}");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[RabbitMQ] Lỗi khi gửi email cho {adminEmail}: {ex.Message}");
                    }
                }
            }
            else
            {
                Console.WriteLine("[RabbitMQ] Cảnh báo: Danh sách email Admin trống, không có ai được thông báo.");
            }
        }
    }
}
