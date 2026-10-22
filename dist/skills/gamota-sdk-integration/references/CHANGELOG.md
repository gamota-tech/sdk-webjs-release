# Changelog — Gamota SDK H5

Thay đổi theo version, viết cho dev game. Mỗi version gồm:

- **Cần làm khi nâng cấp**: game phải sửa, không sửa thì lỗi.
- **Mới**: tính năng mới, thường không cần sửa code game.
- **Thay đổi**: hành vi game / người chơi có thể thấy khác đi.

Tag phát hành có thể kèm hậu tố đánh dấu biến thể (vd. `-DOC` = giao diện dọc); nội dung thay đổi giống nhau giữa các biến thể cùng version.

## v6.2.12 (so với v6.2.11-DOC)

### Cần làm khi nâng cấp

- Đổi repo CDN: `gamota-tech/game-sdk-pub` → `gamota-tech/sdk-webjs-release` — đổi **cả tên repo lẫn tag** ở mọi URL nhúng SDK.
- Unity: `gmogame-script.js` chuyển từ `dist/` sang **`dist/unity/`**.
- CSS, `gmogame-sdk-ui.js` (và `gmogame-script.js` với Unity) phải dùng **cùng một tag**.

### Mới

- Đăng nhập GiG và đăng nhập QR: nút nằm trong màn đăng nhập, game không cần gọi hàm riêng. Nút QR chỉ hiện khi server bật cho game. `loginType` mới: `login_gig`, `login_qr`.
- Chạy trong app GiG: `showPaymentView()` tự mở màn nạp native của GiG.
- Nạp Lá: tài khoản chưa có mã PIN được nhắc tạo PIN (Để sau / Cập nhật ngay).
- Unity: `GMOGameSDK-WebGL.unitypackage` (Gamota Unity SDK 1.0.2, chỉ phần WebGL) phát hành cùng tag ở `dist/unity/`. So với bản cũ: `GetUserInfo()` chạy được trên Unity 2021+ và đọc đúng tiếng Việt; không còn lỗi `EntryPointNotFoundException` khi Play trong Editor; `ShowUserInfoView()` chạy trên WebGL.
- Unity: event tới trước khi `unityGame` sẵn sàng được xếp hàng và gửi lại (tối đa 30s); `userId` gửi sang C# luôn là chuỗi.
- Icon floating button lấy theo cấu hình server.

### Thay đổi

- Bỏ nút đăng nhập Apple.
- Cổng thanh toán mở bằng popup; trình duyệt chặn popup thì chuyển trang như cũ.
- Giftcode và tạo mã PIN mở trang của gig.vn / id.gig.vn.
- Logout xoá cả nhân vật (role) và token nạp của phiên cũ — sau khi đăng nhập lại, game phải gọi lại `setRoleWithRoleName`.
- Tạm ẩn nút Chia sẻ ở màn đăng nhập QR.
- Bảo mật: SDK không in token / API key ra console; chỉ mở link `https`; chống XSS ở màn nạp; không còn tải CryptoJS từ cdnjs.
- File JS được làm rối mã; ảnh và thư viện đi kèm tải theo đúng tag của file JS.
