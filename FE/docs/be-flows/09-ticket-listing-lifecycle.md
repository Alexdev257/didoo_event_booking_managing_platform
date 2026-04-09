# Flow: Vong doi ticket listing

## Muc tieu

Quan ly mot listing tu luc tao den luc huy ban hoac ban thanh cong.

## Endpoint chinh

- `POST /api/ticketlistings`
- `GET /api/ticketlistings/{id}/validate`
- `PATCH /api/ticketlistings/{id}/cancel`
- `PATCH /api/ticketlistings/{id}/mark-sold`
- (tham khao) `GET /api/ticketlistings`, `GET /api/ticketlistings/{id}`

## Preconditions

- Ticket goc ton tai va thuoc seller hop le.
- Listing status hop le cho tung thao tac.

## Luong xu ly

1. Seller tao listing qua `POST /api/ticketlistings`.
2. Buyer-side flow goi `validate` truoc khi thanh toan.
3. Neu seller muon dung ban -> goi `cancel`.
4. Khi mua thanh cong -> he thong goi `mark-sold`.
5. `mark-sold` cap nhat status listing + chuyen owner ticket.

## Du lieu lien quan

- `TicketListings`
- `Tickets`

## Loi thuong gap

- Listing khong ton tai/da xoa.
- Trang thai listing khong cho phep mark-sold.
- Ticket khong tim thay khi chuyen quyen so huu.

## Cach FE goi nhanh

- Trong marketplace, luon refresh status listing real-time truoc khi cho phep checkout.
- Khi listing bi sold/cancel, an nut mua ngay lap tuc.
