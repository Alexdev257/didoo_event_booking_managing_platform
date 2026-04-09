# Flow: Trade booking (mua ve resale)

## Muc tieu

Mua ve duoc dang ban lai (listing), thanh toan thanh cong thi chuyen quyen so huu ve.

## Endpoint chinh

- `POST /api/trade-bookings`
- `GET /api/payments/callback` (dung chung callback)
- Phu thuoc TicketService:
  - `GET /api/ticketlistings/{id}/validate`
  - `PATCH /api/ticketlistings/{id}/mark-sold`

## Preconditions

- Listing ton tai va o trang thai hop le de mua.
- Nguoi mua cung cap thong tin dat mua hop le.

## Luong xu ly

1. FE goi `POST /api/trade-bookings` voi `listingId`.
2. BookingService validate listing qua TicketService.
3. Tao booking type `TradePurchase` + payment URL.
4. User thanh toan; cong thanh toan goi callback.
5. Callback thanh cong -> BookingService goi `mark-sold` de:
   - doi trang thai listing sang `Sold`
   - chuyen owner ticket sang buyer
6. BookingService luu audit giao dich resale (`ResaleTransaction`).

## Du lieu lien quan

- Booking DB: `Bookings`, `BookingDetails` (co lien ket resale), `Payments`, `ResaleTransactions`
- Ticket DB: `TicketListings`, `Tickets`

## Loi thuong gap

- Listing khong ton tai/khong con active.
- Thanh toan that bai.
- Chuyen owner ticket that bai o buoc mark-sold.

## Cach FE goi nhanh

- Luon validate listing lai truoc khi tao trade booking.
- Sau callback, truy van booking detail va listing detail de dong bo UI chinh xac.
