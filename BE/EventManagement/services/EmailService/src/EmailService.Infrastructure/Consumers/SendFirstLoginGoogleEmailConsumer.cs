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
    public class SendFirstLoginGoogleEmailConsumer : IConsumer<SendFirstLoginGoogleEmailEvent>
    {
        private readonly EmailSender _emailSender;
        public SendFirstLoginGoogleEmailConsumer(EmailSender emailSender)
        {
            _emailSender = emailSender;
        }
        public async Task Consume(ConsumeContext<SendFirstLoginGoogleEmailEvent> context)
        {
            var msg = context.Message;
            Console.WriteLine($"[RabbitMQ] Received request to send email to: {msg.ToEmail}");
            try
            {
                string subject = "First Login to system by Google - Event Management";
                string htmlBody = $@"
                    <div style='font-family: Helvetica, Arial, sans-serif; background-color:#f4f6f8; padding:40px 0'>
                      <div style='max-width:600px; margin:0 auto; background:#ffffff; padding:30px; border-radius:8px'>

                        <div style='text-align:center; margin-bottom:20px'>
                          <img src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                               width='40' alt='Google' />
                        </div>

                        <h2 style='color:#00466a; text-align:center'>
                          Welcome to Event Management
                        </h2>

                        <p>Xin chào <b>{msg.Fullname}</b>,</p>

                        <p>
                          Bạn đã <b>đăng nhập lần đầu tiên</b> vào hệ thống bằng tài khoản
                          <b>Google</b>.
                        </p>
                        <p>
                          Mật khẩu mặc định của bạn là : <b>{msg.BasePassword}</b>
                        </p>

                        <div style='background:#f0f4f8; padding:15px; border-radius:6px; margin:20px 0'>
                          <p style='margin:0'><b>Thời gian đăng nhập:</b> {msg.LoginAt:dd/MM/yyyy HH:mm}</p>
                          <p style='margin:0'><b>Phương thức:</b> Google Sign-In</p>
                        </div>

                        <p>
                          Nếu đây là bạn, bạn không cần làm gì thêm 🎉
                        </p>

                        <p>
                          Nếu bạn <b>không thực hiện</b> đăng nhập này, vui lòng:
                        </p>
                        <ul>
                          <li>Đổi mật khẩu ngay lập tức</li>
                          <li>Liên hệ đội ngũ hỗ trợ</li>
                        </ul>

                        <hr style='border:none;border-top:1px solid #eee;margin:30px 0' />

                        <p style='font-size:12px;color:#888'>
                          Email này được gửi tự động để bảo vệ tài khoản của bạn.<br/>
                          Event Management Team
                        </p>

                      </div>
                    </div>";
                await _emailSender.SendAsync(msg.ToEmail, subject, htmlBody);
                Console.WriteLine($"[Success] Email sent to {msg.ToEmail}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error] Failed to send email: {ex.Message}");
                throw;
            }
        }
    }
}
