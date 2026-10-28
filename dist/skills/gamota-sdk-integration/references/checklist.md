# Kiểm tra sau khi tích hợp (v6.2.13)

Chạy game qua web server (không `file://`), mở DevTools.

## Checklist

- [ ] Console in `GMO Game SDK v6.2.13` và không có lỗi đỏ từ SDK.
- [ ] Console: `typeof window.GMOGameSDK` → `"function"`.
- [ ] Tab Network: `gmogame-sdk-ui.js`, CSS (và `gmogame-script.js` với Unity) tải từ `sdk-webjs-release@v6.2.13` — cùng tag, không 404.
- [ ] Mở game lần đầu: màn đăng nhập Gamota hiện (nếu `setAutoShowLoginDialog(true)`).
- [ ] Đăng nhập thành công → game nhận event / `onLoginSuccess` với `accessToken`, `userId`, `userName`.
- [ ] Tải lại trang: vẫn đăng nhập (nếu `setKeepLoginSession(true)`), game nhận lại event đăng nhập.
- [ ] Chọn nhân vật → đã gọi `setRoleWithRoleName`; floating button của SDK hiện (nếu server bật cho game).
- [ ] Nạp → popup chọn gói hiện (ngoài app GiG).
- [ ] Đăng xuất → game nhận event logout, quay về màn đăng nhập.
- [ ] Đăng nhập Google / Facebook chạy trên **domain thật** (domain đã khai báo với Google OAuth client và Facebook App).

## Lỗi hay gặp

| Hiện tượng | Nguyên nhân |
|---|---|
| `GMOGameSDK is not defined` | Chưa nhúng `gmogame-sdk-ui.js`, hoặc gọi trước khi script load xong — gọi trong `window 'load'` |
| `GMOGameSDK Exception: Params '…' must be implemented.` | Thiếu tham số bắt buộc trong config, hoặc truyền object thay vì **chuỗi JSON** cho `init` |
| Không nhận event đăng nhập khi mở lại game | Đăng ký event **sau** `init` — phải đăng ký trước |
| `setKeepLoginSession(false)` không có tác dụng lần đầu | Gọi sau `init` — phải gọi trước |
| Đăng nhập Google báo lỗi origin | Domain game chưa có trong "Authorized JavaScript origins" của `googleClientId` |
| Giao diện SDK vỡ / thiếu ảnh | Thiếu CSS, hoặc CSS và JS khác tag |
| Mở bằng `file://` đăng nhập / API lỗi | Chạy qua web server |
| Nạp báo chưa chọn nhân vật | Chưa gọi `setRoleWithRoleName` |
