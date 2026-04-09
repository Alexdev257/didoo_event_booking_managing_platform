# Flow: Tao event va chuyen trang thai

## Muc tieu

Quan ly vong doi su kien tu tao moi (draft) den van hanh.

## Endpoint chinh

- `POST /api/events`
- `PATCH /api/events/{id}/status`
- (CRUD) `GET|PUT|DELETE|PATCH /api/events...`

## Preconditions

- `CategoryId` ton tai.
- `OrganizerId` ton tai va hop le.

## Luong xu ly

1. FE goi `POST /api/events` voi thong tin event.
2. EventService validate category + organizer.
3. Tao event trong trang thai ban dau (thuong la Draft), co the kem location.
4. Admin/organizer goi `PATCH /api/events/{id}/status` de doi trang thai.
5. FE truy van danh sach/chi tiet event de hien thi theo status.

## Du lieu lien quan

- `Events`
- `EventLocations`
- `Categories`
- `Organizers`

## Loi thuong gap

- Category hoac organizer khong ton tai/da xoa mem.
- Khong tim thay event khi update status.
- Loi transaction khi luu event + location.

## Cach FE goi nhanh

- Tach ro form tao event va man hinh quan ly status.
- Khi doi status, cap nhat UI theo optimistic update + rollback neu API fail.
