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
    public class SendForgotPasswordEmailConsumer : IConsumer<SendForgotPasswordEmailEvent>
    {
        private readonly EmailSender _emailSender;
        public SendForgotPasswordEmailConsumer(EmailSender emailSender)
        {
            _emailSender = emailSender;
        }
        public async Task Consume(ConsumeContext<SendForgotPasswordEmailEvent> context)
        {
            var msg = context.Message;
            Console.WriteLine($"[RabbitMQ] Received request to send email to: {msg.ToEmail}");
            try
            {
                string subject = "Reset your password - Event Management";
                string htmlBody = $@"
                    <div style='font-family: Helvetica, Arial, sans-serif; background-color:#f4f6f8; padding:40px 0'>
                      <div style='max-width:600px; margin:0 auto; background:#ffffff; padding:30px; border-radius:8px'>

                        <h2 style='color:#00466a; text-align:center'>Reset Password</h2>

                        <p>Xin chào,</p>

                        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>

                        <p>Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>

                        <div style='text-align:center; margin:30px 0'>
                          <a href='http://localhost:3000/confirm?key={msg.Key}'
                             style='background:#00466a; color:#ffffff; padding:14px 28px;
                                    text-decoration:none; border-radius:6px; font-size:16px;
                                    display:inline-block;'>
                            Reset Password
                          </a>
                        </div>

                        <p>Link này sẽ hết hạn sau <b>5 phút</b>.</p>

                        <p>Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.</p>

                        <hr style='border:none;border-top:1px solid #eee;margin:30px 0' />

                        <p style='font-size:12px;color:#888'>
                          Event Management Team<br/>
                          © 2026 Event Management
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
