# Flow: Check-in va Notification (OperationService)

## Muc tieu

Mo ta cach dung cac API van hanh va trang thai thuc te hien tai.

## Endpoint chinh

### Check-in
- `GET /api/checkins`
- `GET /api/checkins/{id}`
- `POST /api/checkins`
- `PUT /api/checkins/{id}`
- `DELETE /api/checkins/{id}`
- `PATCH /api/checkins/{id}`

### Notification
- `GET /api/notifications`
- `GET /api/notifications/{id}`
- `POST /api/notifications`
- `PUT /api/notifications/{id}`
- `DELETE /api/notifications/{id}`
- `PATCH /api/notifications/{id}`

## Preconditions

- Doi voi create/update, payload can dung schema command cua service.

## Luong xu ly

1. FE co the goi cac API read/list de lay du lieu check-in, notification.
2. Cac API update/delete/patch di qua pipeline MediatR nhu cac service khac.
3. Luu y: mot so handler tao moi hien chua implement day du.

## Du lieu lien quan

- `EventCheckIns`
- `Notifications`

## Loi thuong gap

- `POST` create co the fail runtime neu handler chua implement (`NotImplementedException`).
- Khong tim thay ban ghi khi update/delete.

## Cach FE goi nhanh

- Uu tien dung API read/list neu he thong chua hoan tat create flow.
- Neu can create tu FE, can test ky tren moi environment vi kha nang chua ho tro day du.
