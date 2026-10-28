# Changelog — Gamota SDK H5

Thay đổi theo version, viết cho dev game. Mỗi version gồm:

- **Cần làm khi nâng cấp**: game phải sửa, không sửa thì lỗi.
- **Mới**: tính năng mới, thường không cần sửa code game.
- **Thay đổi**: hành vi game / người chơi có thể thấy khác đi.

Tag phát hành có thể kèm hậu tố đánh dấu biến thể (vd. `-DOC` = giao diện dọc); nội dung thay đổi giống nhau giữa các biến thể cùng version.

## v6.2.13 (so với v6.2.12)

### Cần làm khi nâng cấp

- Không có thay đổi bắt buộc — chỉ cần đổi tag trong URL nhúng SDK. Nếu game muốn mở thẳng đăng nhập GiG, hỗ trợ hoặc một gói nạp cụ thể thì tích hợp các API mới bên dưới.

### Mới

- `goLoginbyGiG()`: mở thẳng đăng nhập GiG (game tự đặt nút). Kết quả trả về qua event login success như các kiểu đăng nhập khác.
- `goSupportView()`: mở tạo ticket hỗ trợ GiG — trong app GiG mở màn native, ngoài app mở trang ticket.
- Cả 2 hàm mở popup nên phải gọi trong sự kiện click của người chơi.
- `showPaymentView(v3Id)`: tham số `v3Id` không bắt buộc. Truyền id gói (`v3_id`) thì bỏ qua màn chọn gói, mở thẳng màn Thanh toán của gói đó; không truyền thì như cũ. Trong app GiG vẫn mở màn nạp native, `v3Id` gửi cho app qua `package_id` (không truyền thì chuỗi rỗng).
- Xác thực số điện thoại theo cấu hình `sdk/open`: hỗ trợ gửi OTP, xác thực OTP, gửi lại sau 2 phút, vị trí nhắc ở login / set role, ngưỡng nhắc và chế độ bắt buộc; có thể dùng link xác thực của server hoặc màn SDK.
- Màn đăng nhập QR có giao diện mới, nút lưu ảnh và popup hướng dẫn quét QR đa ngôn ngữ.
- Màn Cài đặt mới: thông tin cá nhân, đổi ngôn ngữ, xem version và đăng xuất. Đổi ngôn ngữ tải lại cấu hình menu theo ngôn ngữ vừa chọn.
- Nút nổi chính mở menu 2 cột theo `sdk/news`, hỗ trợ thứ tự `priority`, icon mặc định, khoá chức năng cần role và panel tài khoản. Trong app GiG, tin tức / giftcode / trợ lý / hỗ trợ mở màn native tương ứng khi có bridge.
- Nút nổi chính có badge 18+ khi server bật `support.age18.is_18plus` (icon 18+ đi kèm SDK làm ảnh dự phòng, chỉ thay bằng ảnh server `icon_18plus` sau khi tải thành công); dòng nhắc thời gian chơi tự hiện theo chu kỳ `duration_18plus`.

### Thay đổi

- Đồng bộ giao diện SDK7 cho đăng nhập, đăng ký, QR login, thanh toán, alert, popup text, xác thực và liên kết tài khoản; UI được cô lập tốt hơn khỏi CSS của trang game và thích ứng màn hình hẹp.
- Đăng ký chuyển thành 5 bước, kiểm tra khả năng đăng ký số điện thoại và chỉ đăng nhập sau khi xác thực SMS thành công. Ngày sinh mặc định là ngày vừa đủ 18 tuổi và date picker không cho chọn ngày chưa đủ tuổi.
- Thanh toán tách thành các bước chọn gói, thanh toán và phương thức thanh toán; bản debug hỗ trợ dữ liệu giả bằng `?mockpay=1`.
- Tự đăng nhập khách chỉ chạy khi server bật `option.auto_quick_login`; `option.quick_login` chỉ điều khiển việc hiện nút đăng nhập nhanh.
- Xác thực / liên kết tài khoản dựa trên `login_type` từ server, xử lý lỗi kết nối / 401 và xét độc lập `minLoginCount` / `maxLoginCount` khi server chỉ trả một ngưỡng.
- Link xác thực tài khoản / số điện thoại giữ đúng query và fragment có sẵn; link kèm token chỉ chấp nhận HTTPS thuộc `gamota.com` / `gig.vn` và popup được ngắt `window.opener`.
- Đăng nhập bằng `?token=` hiển thị lỗi kết nối / HTTP thay vì im lặng.
- Ngôn ngữ lần đầu theo thiết bị, sau đó lưu lựa chọn; `lang` / `langID` trong request dùng ngôn ngữ hiện tại thay vì mặc định tiếng Việt.
- Bỏ nút Facebook khỏi màn đăng nhập / liên kết tài khoản của giao diện SDK7. Facebook vẫn được guard khi logout hoặc xử lý phiên cũ.
- Bỏ nút hỗ trợ cũ và nút nổi 18+ riêng; hỗ trợ chuyển vào menu nút nổi, nhắc 18+ chuyển sang badge nút nổi chính và ảnh dưới màn đăng nhập.
- Trong app GiG, ẩn nút đăng xuất ở panel tài khoản và màn Cài đặt vì phiên đăng nhập do app quản lý.
- `facebookAppId` và `adjustAppToken` không còn bắt buộc. Game không dùng Facebook / Adjust thì bỏ key: SDK không tải thư viện tương ứng.
- Đăng nhập không còn phụ thuộc API cấu hình Adjust: API này lỗi vẫn hiện màn đăng nhập / quick login / đăng nhập bằng `?token=` như bình thường.
- Event Adjust đầu phiên (vd. `first_open`) chờ cả thư viện và cấu hình event token sẵn sàng rồi mới gửi. Hàng đợi giới hạn 100 event và chỉ bị bỏ khi game không dùng Adjust, thư viện Adjust không tải / khởi tạo được, hoặc API cấu hình Adjust lỗi / quá 15 giây mà không có cache hợp lệ.
- Cache cấu hình Adjust chỉ được dùng lại khi đúng `gameId` và `adjustAppToken`; response rỗng / sai cấu trúc không ghi đè cache hợp lệ.
- Facebook chỉ được gọi sau khi `FB.init()` hoàn tất; logout vẫn chạy đủ khi trình duyệt chặn Facebook SDK.

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
- Nút nổi 18+ hiển thị khi server bật `support.age18.is_18plus`, cho phép xem lời nhắc và kéo sang cạnh màn hình.

### Thay đổi

- Bỏ nút đăng nhập Apple.
- Cổng thanh toán mở bằng popup; trình duyệt chặn popup thì chuyển trang như cũ.
- Popup thanh toán mở ngay khi bấm nạp để tránh bị trình duyệt chặn; mỗi yêu cầu dùng một cửa sổ riêng, chặn gửi trùng khi đang chờ API và ngắt quyền truy cập `window.opener` trước khi chuyển sang cổng thanh toán.
- Nút nổi chính hỗ trợ kéo thả bằng chuột và cảm ứng, tự dính vào cạnh màn hình sau khi thả.
- Giftcode và tạo mã PIN mở trang của gig.vn / id.gig.vn.
- Logout xoá cả nhân vật (role) và token nạp của phiên cũ — sau khi đăng nhập lại, game phải gọi lại `setRoleWithRoleName`.
- Tạm ẩn nút Chia sẻ ở màn đăng nhập QR.
- Bảo mật: SDK không in token / API key ra console; chỉ mở link `https`; chống XSS ở màn nạp; không còn tải CryptoJS từ cdnjs.
- File JS được làm rối mã; ảnh và thư viện đi kèm tải theo đúng tag của file JS.
