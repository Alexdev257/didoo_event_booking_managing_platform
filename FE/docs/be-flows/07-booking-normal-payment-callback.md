# Flow: Booking thuong va callback thanh toan

## Muc tieu

Dat ve thuong, tao payment, va phat hanh ticket sau khi thanh toan thanh cong.

## Endpoint chinh

- `POST /api/bookings`
- `GET /api/payments/callback`
- (tham khao) `GET /api/bookings`, `GET /api/bookings/{id}`

## Preconditions

- Ticket type ton tai va con ton kho.
- Payload booking day du thong tin user/contact.

## Luong xu ly

1. FE goi `POST /api/bookings`.
2. BookingService goi TicketService decrement ton kho (`PATCH /api/tickettypes/{id}/decrement`).
3. Tao `Booking` + `BookingDetail` (status `Pending` neu can thanh toan).
4. Tao payment URL (MoMo) va luu ban ghi `Payment`.
5. FE redirect user sang cong thanh toan.
6. Cong thanh toan goi `GET /api/payments/callback`.
7. Callback thanh cong -> BookingService danh dau booking da thanh toan + goi TicketService tao ve that (`POST /api/tickets/internal/bulk-create`).
8. Callback that bai -> booking bi danh dau cancel/fail theo logic BE.

## Du lieu lien quan

- Booking DB: `Bookings`, `BookingDetails`, `Payments`
- Ticket DB: `Tickets` (duoc tao sau callback thanh cong)

## Loi thuong gap

- Decrement ton kho that bai.
- Tao payment URL that bai.
- Callback ket qua that bai.
- Tao ticket that bai sau khi booking da tao (can monitor va bo sung co che bu tru).

## Cach FE goi nhanh

- Sau khi tao booking, luu `bookingId` va `paymentUrl`.
- Sau khi quay lai tu cong thanh toan, goi `GET /api/bookings/{id}` de dong bo trang thai cuoi cung.
- Ho tro trang "Dang xu ly thanh toan..." de tranh user refresh lien tuc.
