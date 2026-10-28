# API và event — Gamota SDK H5 (v6.2.13)

Dùng chung cho mọi engine. Trong JS: `GMOGameSDK.getInstance().<hàm>()`. Unity gọi qua wrapper C# — xem bảng tương ứng trong [unity-webgl.md](unity-webgl.md).

## Thứ tự khởi tạo (quan trọng)

1. **Đăng ký nhận event** (`window.addEventListener(...)`) — event đăng nhập có thể bắn **ngay trong lúc `init` chạy** (khi giữ phiên đăng nhập).
2. `setKeepLoginSession(...)`, `setAutoShowLoginDialog(...)` — nếu muốn đổi mặc định. Phải gọi **trước `init`**.
3. `init(sdkConfigJson, firebaseConfigJson)` — **một lần**, sau khi trang đã load.
4. Sau khi user chọn nhân vật: `setRoleWithRoleName(...)` — **bắt buộc trước khi mở nạp**.

## Hàm

| Hàm | Mô tả |
|---|---|
| `init(sdkConfigJson, firebaseConfigJson)` | Khởi tạo. Cả 2 tham số là **chuỗi JSON** (`JSON.stringify(...)`), **không phải object**. `firebaseConfigJson` hiện không dùng — truyền `"{}"`. Tham số của `sdkConfigJson`: xem [README](README.md#chuẩn-bị-trước-khi-tích-hợp) |
| `setKeepLoginSession(bool)` | Giữ phiên đăng nhập giữa các lần mở game. Mặc định `true` |
| `setAutoShowLoginDialog(bool)` | Tự hiện màn đăng nhập khi chưa đăng nhập. Mặc định `true` |
| `showLoginView()` | Hiện màn đăng nhập. Nếu đã đăng nhập: không hiện, bắn lại event đăng nhập thành công |
| `isUserLoggedIn()` | `true` / `false` |
| `getUserInfo()` | Thông tin user (xem "Dữ liệu đăng nhập") hoặc `null` |
| `logout()` | Đăng xuất. Tài khoản chơi ngay chưa cập nhật có thể thấy popup nhắc cập nhật trước |
| `switchAccount()` | Đổi tài khoản |
| `setRoleWithRoleName(characterName, characterId, serverName, serverId)` | Báo nhân vật đang chơi. Gọi mỗi khi vào game / đổi nhân vật |
| `showPaymentView(v3Id?)` | Mở nạp (cần đã đăng nhập + đã set role). Không truyền `v3Id`: mở popup chọn gói. Truyền `v3Id` (id gói nạp `v3_id`, chuỗi): bỏ qua màn chọn gói, mở thẳng màn Thanh toán của gói đó; id sai / gói không bán thì SDK báo lỗi, không mở popup. **Trong app GiG** SDK tự mở màn nạp native của GiG, gửi `v3Id` cho app qua `package_id` |
| `showUserInfoView()` | Mở trang thông tin tài khoản (tab mới) |
| `showAccountLinkView()` | Mở màn liên kết tài khoản (Google / Facebook) |
| `goLoginbyGiG()` | Mở thẳng đăng nhập GiG (popup gig.vn, cùng luồng nút "Đăng nhập bằng GiG"). Kết quả trả về qua event login success (`loginType: "login_gig"`); đã đăng nhập thì bắn lại login success. **Phải gọi trong sự kiện click** của người chơi, nếu không trình duyệt chặn popup |
| `goSupportView()` | Mở tạo ticket hỗ trợ GiG. **Trong app GiG** app mở màn tạo ticket native (tự điền nhân vật / server); ngoài GiG mở trang ticket (link cấu hình từ server, cần đã đăng nhập). Phải gọi trong sự kiện click |
| `openFanpage()` / `openGroup()` | Mở fanpage / group (link cấu hình từ server) |
| `trackLevel(level)` | Gửi event `level_up` và `level_up_<level>` |
| `logEvent(eventName, eventParamsJson)` | Gửi event tracking. `eventParamsJson`: chuỗi JSON object hoặc bỏ trống |
| `getVersion()` | Version SDK, vd. `"v6.2.13"` |

Đăng nhập GiG và QR có nút sẵn trong màn đăng nhập (nút QR chỉ hiện khi server bật cho game). Game muốn tự đặt nút "Đăng nhập GiG" thì gọi `goLoginbyGiG()`.

## Event (SDK → game)

SDK không nhận callback; kết quả bắn bằng `CustomEvent` trên `window`:

| Event | `event.detail` |
|---|---|
| `gmogame-sdk-ui-on-user-login-success` | Dữ liệu đăng nhập (bên dưới) |
| `gmogame-sdk-ui-on-user-logout` | `userName` (chuỗi) |
| `gmogame-sdk-ui-on-account-link-success` | `null` |
| `gmogame-sdk-ui-on-open-fanpage` | `null` |
| `gmogame-sdk-ui-on-open-group` | `null` |

**Chưa có event kết quả nạp** (thành công / thất bại / đóng) trên H5 — game kiểm tra kết quả nạp phía server của game.

## Dữ liệu đăng nhập

```json
{
  "accessToken": "…",
  "verifyToken": "…",
  "userId": "123456",
  "userName": "abc",
  "loginType": "login_normal"
}
```

- `accessToken` / `verifyToken`: gửi về server game để xác thực user với Gamota — **không log, không lưu ra ngoài**.
- `userId` có thể là số hoặc chuỗi — so sánh / lưu dưới dạng chuỗi.
- `loginType`: `login_normal` (tài khoản), `login_google`, `login_facebook`, `login_quick` (chơi ngay), `login_gig`, `login_qr`, `LOGIN_PLAYEE` (mở từ Playee bằng `?token=`).
