# Backend Flows (EventManagement)

Tai lieu nay tong hop cac flow chinh de FE tich hop BE trong `Be_exe/BE/EventManagement/services`.

Pham vi da bo qua theo yeu cau:
- `ResaleService`
- `PaymentService`

## Danh sach flow

1. `01-auth-register-verify.md` - Dang ky tai khoan + xac thuc OTP
2. `02-auth-login-refresh-logout.md` - Dang nhap, refresh token, dang xuat
3. `03-auth-account-recovery.md` - Quen mat khau, doi mat khau, doi email
4. `04-organizer-onboarding.md` - Tao organizer, verify organizer, lien ket user
5. `05-event-lifecycle.md` - Tao event va chuyen trang thai
6. `06-tickettype-inventory.md` - Quan ly loai ve va giam ton kho
7. `07-booking-normal-payment-callback.md` - Booking thuong + callback thanh toan
8. `08-trade-booking-flow.md` - Mua ve resale (trade booking)
9. `09-ticket-listing-lifecycle.md` - Vong doi ticket listing
10. `10-event-engagement.md` - Favorite, interaction, review
11. `11-operations-checkin-notification.md` - Check-in va notification (trang thai hien tai)
12. `12-overview-analytics-rbac.md` - Overview/Analytics endpoints va phan quyen RBAC (pages + API)

## Luu y chung khi tich hop

- Route goc theo controller la `/api/...` (di qua gateway thi van giu path nay).
- JWT da duoc cau hinh trong BE, nhung khong phai tat ca endpoint deu gan `[Authorize]`.
- Nen xu ly retry/co che fallback cho cac flow co goi service cheo (Booking <-> Ticket).
