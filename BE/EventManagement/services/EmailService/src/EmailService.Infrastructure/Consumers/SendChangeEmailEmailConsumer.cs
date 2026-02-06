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
    public class SendChangeEmailEmailConsumer : IConsumer<SendChangeEmailEmailEvent>
    {
        private readonly EmailSender _emailSender;
        public SendChangeEmailEmailConsumer(EmailSender emailSender)
        {
            _emailSender = emailSender;
        }
        public async Task Consume(ConsumeContext<SendChangeEmailEmailEvent> context)
        {
            var msg = context.Message;
            Console.WriteLine($"[RabbitMQ] Received request to send email to: {msg.ToEmail}");
            try
            {
                string subject = "Reset your password - Event Management";
                string htmlBody = $@"
                <div style='font-family: Helvetica, Arial, sans-serif; min-width:1000px; overflow:auto; line-height:2'>
                  <div style='margin:50px auto; width:70%; padding:20px 0'>
                    <div style='border-bottom:1px solid #eee'>
                      <a href='' style='font-size:1.4em; color: #00466a; text-decoration:none; font-weight:600'>Event Management</a>
                    </div>
                    <p style='font-size:1.1em'>Xin chào,</p>
                    <p>Bạn đang thay đổi email cho tài khoản của bạn trong hệ thống EventManagement. Sử dụng mã OTP sau để hoàn tất quá trình đổi email của bạn. Mã có hiệu lực trong 5 phút.</p>
                    <h2 style='background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;'>{msg.OTP}</h2>
                    <p style='font-size:0.9em;'>Xin cảm ơn,<br />Event Management Team</p>
                    <hr style='border:none;border-top:1px solid #eee' />
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
