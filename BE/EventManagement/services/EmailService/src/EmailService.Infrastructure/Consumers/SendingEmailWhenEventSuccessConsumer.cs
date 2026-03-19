using EmailService.Infrastructure.Services;
using MassTransit;
using SharedContracts.Events;
using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace EmailService.Infrastructure.Consumers
{
    public class SendingEmailWhenEventSuccessConsumer : IConsumer<SendingEmailWhenEventSuccess>
    {

        private readonly EmailSender _emailSender;

        public SendingEmailWhenEventSuccessConsumer(EmailSender emailSender)
        {
            _emailSender = emailSender;
        }

        public async Task Consume(ConsumeContext<SendingEmailWhenEventSuccess> context)
        {
            var msg = context.Message;
            Console.WriteLine($"[RabbitMQ] Received successful event email request. Event: {msg.EventName}");

            try
            {
                var sellerSubject = $"[Event Management] Giao dich ve thanh cong - {msg.EventName}";
                var sellerBody = BuildSellerEmailBody(msg);

                if (!string.IsNullOrWhiteSpace(msg.SellerEmail))
                {
                    await _emailSender.SendAsync(msg.SellerEmail, sellerSubject, sellerBody);
                    Console.WriteLine($"[Success] Seller email sent to {msg.SellerEmail}");
                }

                if (msg.IsTrade && !string.IsNullOrWhiteSpace(msg.BuyerEmail))
                {
                    var buyerSubject = $"[Event Management] Ban da mua ve thanh cong - {msg.EventName}";
                    var buyerBody = BuildBuyerEmailBody(msg);

                    await _emailSender.SendAsync(msg.BuyerEmail, buyerSubject, buyerBody);
                    Console.WriteLine($"[Success] Buyer email sent to {msg.BuyerEmail}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Error] Failed to send successful event emails: {ex.Message}");
                throw;
            }
        }

        private static string BuildSellerEmailBody(SendingEmailWhenEventSuccess msg)
        {
            var tradeInfo = msg.IsTrade
                ? "Giao dịch sang nhượng vé đã được xử lý thành công."
                : "Sự kiện đã được xử lý thành công.";

            return BuildEmailLayout(
                title: "Thong bao giao dich thanh cong",
                    greetingName: msg.SellerName,
                intro: tradeInfo,
                roleLabel: "Nguoi ban",
                    eventName: msg.EventName,
                    ticketIds: msg.TicketIds,
                tagLabel: msg.IsTrade ? "Sang nhuong" : "Xu ly su kien"
            );
        }

        private static string BuildBuyerEmailBody(SendingEmailWhenEventSuccess msg)
        {
            return BuildEmailLayout(
                    title: "Xac nhan mua ve thanh cong",
                    greetingName: msg.BuyerName,
                intro: "Ban da mua ve thanh cong. Vui long kiem tra thong tin su kien va ma ve ben duoi.",
                roleLabel: "Nguoi mua",
                    eventName: msg.EventName,
                    ticketIds: msg.TicketIds,
                    tagLabel: "Mua ve thanh cong"
            );
        }

        private static string BuildEmailLayout(
                string title,
                string greetingName,
                string intro,
                string roleLabel,
                string eventName,
                string[] ticketIds,
                string tagLabel)
        {
            var encodedTitle = WebUtility.HtmlEncode(title);
            var encodedName = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(greetingName) ? "ban" : greetingName);
            var encodedIntro = WebUtility.HtmlEncode(intro);
            var encodedRole = WebUtility.HtmlEncode(roleLabel);
            var encodedEventName = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(eventName) ? "Chua cap nhat" : eventName);
            var encodedTag = WebUtility.HtmlEncode(tagLabel);
            var ticketBlock = BuildTicketList(ticketIds);

            return $@"
                                <div style='font-family: Arial, Helvetica, sans-serif; background:#eef3f8; padding:28px 12px;'>
                                    <div style='max-width:640px; margin:0 auto; background:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #d7e3ef;'>
                                        <div style='background:linear-gradient(120deg, #003a66 0%, #005a99 100%); padding:22px 28px; color:#ffffff;'>
                                            <p style='margin:0 0 8px 0; font-size:12px; letter-spacing:0.6px; text-transform:uppercase; opacity:0.9;'>Event Management</p>
                                            <h2 style='margin:0; font-size:24px; line-height:1.3;'>{encodedTitle}</h2>
                                        </div>

                                        <div style='padding:26px 28px 10px 28px; color:#1c2b39;'>
                                            <p style='margin:0 0 10px 0; font-size:16px;'>Xin chao <b>{encodedName}</b>,</p>
                                            <p style='margin:0; font-size:15px; line-height:1.65;'>{encodedIntro}</p>
                                        </div>

                                        <div style='padding:18px 28px;'>
                                            <div style='display:inline-block; background:#e8f2fc; color:#005a99; border:1px solid #bfd9f2; border-radius:999px; font-size:12px; font-weight:700; padding:6px 12px;'>
                                                {encodedTag}
                                            </div>

                                            <div style='margin-top:14px; border:1px solid #e3edf7; border-radius:10px; overflow:hidden;'>
                                                <table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='border-collapse:collapse;'>
                                                    <tr>
                                                        <td style='width:140px; padding:12px 14px; background:#f7fbff; color:#55708a; font-size:13px; border-bottom:1px solid #e3edf7;'>Su kien</td>
                                                        <td style='padding:12px 14px; color:#1f3449; font-size:14px; border-bottom:1px solid #e3edf7;'><b>{encodedEventName}</b></td>
                                                    </tr>
                                                    <tr>
                                                        <td style='width:140px; padding:12px 14px; background:#f7fbff; color:#55708a; font-size:13px;'>Vai tro</td>
                                                        <td style='padding:12px 14px; color:#1f3449; font-size:14px;'><b>{encodedRole}</b></td>
                                                    </tr>
                                                </table>
                                            </div>

                                            <div style='margin-top:16px;'>
                                                <p style='margin:0 0 10px 0; font-size:14px; color:#4a5f73; font-weight:700;'>Danh sach ma ve</p>
                                                <div style='background:#f8fbff; border:1px solid #dfeaf5; border-radius:10px; padding:10px;'>
                                                    {ticketBlock}
                                                </div>
                                            </div>
                                        </div>

                                        <div style='padding:18px 28px 26px 28px;'>
                                            <p style='margin:0; font-size:13px; color:#657a8f; line-height:1.6;'>Cam on ban da su dung Event Management. Neu can ho tro, vui long lien he doi ngu cham soc khach hang.</p>
                                            <p style='margin:10px 0 0 0; font-size:12px; color:#8aa0b5;'>Event Management Team</p>
                                        </div>
                                    </div>
                                </div>";
        }

        private static string BuildTicketList(string[] ticketIds)
        {
            if (ticketIds == null || ticketIds.Length == 0)
            {
                return "<p style='margin:0; color:#7a8ea1; font-size:13px;'>Khong co thong tin ma ve.</p>";
            }

            return string.Join(
                    string.Empty,
                    ticketIds
                            .Where(id => !string.IsNullOrWhiteSpace(id))
                            .Select(id =>
                                    $"<div style='margin-bottom:8px; padding:10px 12px; border:1px dashed #c4d7ea; border-radius:8px; background:#ffffff; color:#20405f; font-size:13px;'><b>Ticket ID:</b> {WebUtility.HtmlEncode(id)}</div>"));
        }
    }
}
