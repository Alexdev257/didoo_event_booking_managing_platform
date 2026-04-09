# Flow: Dang nhap, refresh token, dang xuat

## Muc tieu

Quan ly phien dang nhap bang access token + refresh token.

## Endpoint chinh

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

## Preconditions

- Tai khoan ton tai va password dung.

## Luong xu ly

1. FE goi `POST /api/auth/login`.
2. BE xac thuc user + password hash.
3. Thanh cong -> tra access token + refresh token, dong thoi luu refresh token vao Redis.
4. Access token het han -> FE goi `POST /api/auth/refresh`.
5. BE xac thuc cap token cu + refresh token trong cache, sau do rotate refresh token moi.
6. Dang xuat -> FE goi `POST /api/auth/logout`, BE xoa refresh token.

## Du lieu lien quan

- Auth DB: `Users`, `UserLocations` (neu co ghi nhan vi tri dang nhap).
- Redis: refresh token theo user/session.

## Loi thuong gap

- Sai email/password.
- Refresh token khong hop le, het han, hoac da bi thu hoi.
- Goi refresh khi da logout.

## Cach FE goi nhanh

- Luu access token ngan han + refresh token an toan.
- Dung interceptor de auto goi `/api/auth/refresh` khi gap `401`.
- Khi logout, xoa token local sau khi goi API thanh cong (hoac bat ke ket qua neu can fail-safe).
