# Flow: Engagement cho event (favorite, interaction, review)

## Muc tieu

Ho tro hanh vi nguoi dung tren event: yeu thich, tuong tac va danh gia.

## Endpoint chinh

### Favorite
- `GET /api/favorites`
- `GET /api/favorites/{id}`
- `POST /api/favorites`
- `DELETE /api/favorites/{userId}/{eventId}`
- `DELETE /api/favorites/{userId}/{eventId}/soft`
- `PATCH /api/favorites/{userId}/{eventId}`

### Interaction
- `GET /api/interactions`
- `GET /api/interactions/{id}`
- `POST /api/interactions`
- `DELETE /api/interactions/{userId}/{eventId}/{type}`
- `DELETE /api/interactions/{userId}/{eventId}/{type}/soft`
- `PATCH /api/interactions/{userId}/{eventId}/{type}`

### Review
- `GET /api/eventreviews`
- `GET /api/eventreviews/{id}`
- `POST /api/eventreviews`
- `PUT /api/eventreviews/{id}`
- `DELETE /api/eventreviews/{id}`
- `PATCH /api/eventreviews/{id}`

## Preconditions

- Event ton tai.
- userId va cac tham so route/body hop le.

## Luong xu ly

1. FE tao favorite/interaction/review theo nhu cau.
2. BE luu ban ghi va cho phep hard delete, soft delete, restore (tuy loai).
3. FE truy van danh sach/chi tiet de render profile, dashboard, event detail.

## Du lieu lien quan

- `FavoriteEvents`
- `UserEventInteractions`
- `EventReviews`

## Loi thuong gap

- Ban ghi khong ton tai khi delete/restore.
- Duplicate thao tac (user da favorite truoc do).
- Dinh dang type interaction khong hop le.

## Cach FE goi nhanh

- Dung optimistic UI cho nut favorite/react, kem rollback khi API fail.
- Voi review, validate client-side (rating range, content) truoc khi goi API.
