# Flow: Tao organizer, verify organizer, lien ket user

## Muc tieu

Onboard organizer moi trong EventService va dong bo lien ket sang AuthService.

## Endpoint chinh

- `POST /api/organizers`
- `PATCH /api/organizers/{id}/verify`
- (truy van/quan ly) `GET|PUT|DELETE|PATCH /api/organizers...`

## Preconditions

- User owner ton tai (EventService goi gRPC AuthService de kiem tra).
- Email/phone organizer chua bi trung.

## Luong xu ly

1. FE goi `POST /api/organizers` voi thong tin organizer.
2. EventService validate du lieu + check user owner qua gRPC AuthService.
3. EventService luu organizer vao DB (transaction).
4. EventService publish `OrganizerCreatedEvent`.
5. AuthService consume event va cap nhat `Users.OrganizerId`.
6. (Neu co) EventService publish email thong bao admin.
7. Admin/ops goi `PATCH /api/organizers/{id}/verify` de xac minh organizer.

## Du lieu lien quan

- Event DB: `Organizers`.
- Auth DB: `Users` (truong lien ket organizer).

## Loi thuong gap

- Trung email/phone organizer.
- Khong tim thay user owner (gRPC).
- Verify organizer da o trang thai verified.

## Cach FE goi nhanh

- Sau khi tao organizer, poll/truy van lai organizer detail de cap nhat trang thai.
- Neu app can check quyen organizer ngay, luu y co do tre nho do message bus.
