# Flow: Quen mat khau, doi mat khau, doi email

## Muc tieu

Ho tro khoi phuc tai khoan va cap nhat thong tin bao mat.

## Endpoint chinh

- `POST /api/auth/forgot-password`
- `POST /api/auth/verify-forgot-password`
- `POST /api/auth/change-password`
- `POST /api/auth/change-email`
- `POST /api/auth/verify-change-email`

## Preconditions

- User ton tai (va dat cac dieu kien trang thai theo BE).
- OTP/key xac thuc con han.

## Luong xu ly

### A) Quen mat khau
1. FE goi `POST /api/auth/forgot-password` voi email.
2. BE tao key/OTP reset mat khau trong Redis + gui email.
3. FE goi `POST /api/auth/verify-forgot-password` voi key/OTP + mat khau moi.
4. BE xac thuc key va cap nhat password hash.

### B) Doi mat khau
1. FE goi `POST /api/auth/change-password` voi old/new password.
2. BE kiem tra old password, hop le thi cap nhat new password.

### C) Doi email
1. FE goi `POST /api/auth/change-email` (yeu cau OTP ve email moi).
2. FE goi `POST /api/auth/verify-change-email` de xac nhan.
3. BE cap nhat email sau khi OTP hop le.

## Du lieu lien quan

- Auth DB: `Users`.
- Redis: key reset password, key/OTP doi email.

## Loi thuong gap

- Key/OTP khong hop le hoac het han.
- Old password sai.
- Email moi da ton tai.

## Cach FE goi nhanh

- Luon tach ro 2 buoc gui OTP va verify OTP.
- Hien thi countdown OTP de user biet thoi gian con lai.
- Neu verify that bai do het han, dieu huong ve buoc gui OTP lai.
