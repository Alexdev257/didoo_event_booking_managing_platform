# Flow: Quan ly ticket type va ton kho

## Muc tieu

Tao cac loai ve cho event va giam so luong con lai khi dat mua.

## Endpoint chinh

- `POST /api/tickettypes`
- `PATCH /api/tickettypes/{id}/decrement`
- (CRUD) `GET|PUT|DELETE|PATCH /api/tickettypes...`

## Preconditions

- Event ton tai (TicketService goi gRPC EventService de xac minh).
- So luong decrement hop le.

## Luong xu ly

1. FE/Backoffice tao ticket type bang `POST /api/tickettypes`.
2. TicketService xac minh event qua gRPC.
3. Luu ticket type vao DB.
4. Khi booking, BookingService goi `PATCH /api/tickettypes/{id}/decrement`.
5. TicketService cap nhat ton kho, bao loi neu vuot so luong.

## Du lieu lien quan

- `TicketTypes`

## Loi thuong gap

- Event khong ton tai (gRPC not found).
- Ticket type khong ton tai/da xoa.
- Khong du ton kho de giam.

## Cach FE goi nhanh

- Luon lay so luong con lai truoc khi cho user thanh toan.
- Xu ly thong bao "het ve" ngay tai checkout neu decrement fail.
