# Flow: Dang ky tai khoan va xac thuc OTP

## Muc tieu

Tao user moi thong qua OTP email, chi ghi vao DB sau khi OTP hop le.

## Endpoint chinh

- `POST /api/auth/register`
- `POST /api/auth/verify-register`

## Preconditions

- Chua ton tai email/phone trong he thong.
- Payload hop le (email, phone, password).

## Luong xu ly

1. FE goi `POST /api/auth/register` voi thong tin dang ky.
2. BE kiem tra trung email/phone.
3. BE tao OTP, luu tam thong tin dang ky + OTP trong Redis (co TTL).
4. BE phat event/gui email OTP.
5. FE nhap OTP, goi `POST /api/auth/verify-register`.
6. BE doi chieu OTP trong cache.
7. Dung OTP -> tao ban ghi user trong Auth DB.

## Du lieu lien quan

- Auth DB: `Users`, `Roles`.
- Redis: key OTP + payload dang ky tam.

## Loi thuong gap

- Email/phone da ton tai.
- OTP sai hoac het han.
- Loi luu DB sau khi verify.

## Cach FE goi nhanh

- Buoc 1 (register): gui thong tin user, neu thanh cong chuyen man hinh nhap OTP.
- Buoc 2 (verify): gui OTP + thong tin can thiet theo contract API.
- Neu OTP het han: cho phep user thuc hien lai register.
