# Theme giao diện SDK

Game chọn một bộ giao diện (theme) cho UI của SDK (đăng nhập, đăng ký, liên kết, xác thực, nạp, popup, nút nổi, menu, cài đặt…) bằng config `init`. Theme **chỉ đổi phần nhìn** — màu, font, bo góc, shadow, nền, một số icon — không đổi khung / bố cục, chữ (đa ngôn ngữ) hay hành vi: đăng nhập, phiên, event gửi game giữ nguyên.

## Dùng theme trong game

Thêm vào config `init` (cùng chuỗi JSON với `gmoApiKey`…; Unity WebGL cũng vậy, không cần sửa C# / bridge):

| Key | Bắt buộc | Ý nghĩa |
|---|---|---|
| `themeId` | Có, nếu dùng theme | Tên theme, vd. `"bubbo"`. Chỉ gồm `a-z`, `0-9`, `-`. Không truyền (hoặc `"default"`) = giao diện mặc định |
| `themeVersion` | Không | Version theme; SDK gắn `?v=<version>` vào manifest và CSS để trình duyệt bỏ bản cache cũ |
| `themeBaseUrl` | Không | Theme host riêng (https). Không truyền = theme đóng gói kèm SDK |

```js
sdk.init(JSON.stringify({
  gmoApiKey: '…', /* … các key khác … */
  themeId: 'bubbo',
}), '{}');
```

Theme đóng gói kèm SDK ở bản v6.2.16: `bubbo`.

### Hành vi

- Theme tải **song song** với khởi tạo SDK; `init()` vẫn trả về ngay, event (vd. login success khi giữ phiên) gửi đúng lúc như không có theme.
- Trong lúc theme đang tải, UI của SDK **tạm ẩn** (tối đa **1,5 giây**). Tải xong thì hiện với theme; quá 1,5 giây hoặc lỗi (sai `themeId`, manifest / CSS không tải được…) thì hiện bằng **giao diện mặc định** — không báo lỗi cho game, không chặn đăng nhập.
- Theme lỗi: console có `GMOGameSDK theme: <mã lỗi>` và SDK gửi event tracking `sdk_theme_fallback` (`theme_id`, `reason`).

| Mã lỗi | Nguyên nhân |
|---|---|
| `invalid_config` | `themeId` / `themeVersion` sai định dạng, `themeBaseUrl` không phải https |
| `manifest_network` | Không tải được manifest (mạng, CORS) |
| `manifest_http` | Manifest trả lỗi HTTP (vd. 404 — sai `themeId`) |
| `manifest_schema` | Manifest không phải JSON đúng cấu trúc |
| `css_error` | Không tải được file CSS của theme |
| `timeout` | Quá 1,5 giây chưa tải xong |

### Kiểm tra theme đã áp

DevTools → Elements → `div.gmogame-wrapper`:

- `data-gmo-theme="bubbo"` và `data-gmo-theme-status="ok"` → đã áp theme.
- `data-gmo-theme-status="fallback"` → lỗi, đang dùng giao diện mặc định; xem console `GMOGameSDK theme: …`.
- Không có hai thuộc tính trên → game không truyền `themeId`.

## Theme host riêng (`themeBaseUrl`)

SDK tải `{themeBaseUrl}/{themeId}/manifest.json` rồi các file CSS trong manifest (đường dẫn tương đối với thư mục theme). Yêu cầu:

- HTTPS.
- CORS (`Access-Control-Allow-Origin`) cho **`manifest.json` và file font** — trình duyệt tải 2 loại này ở chế độ CORS; CSS / ảnh không cần. Theme công khai nên dùng `*`.
- Game có Content-Security-Policy: thêm host theme vào `connect-src` (manifest), `style-src` (CSS), `font-src`, `img-src`.
- Cập nhật theme: đổi `themeVersion`. `?v=` chỉ gắn cho manifest và CSS — **font / ảnh đổi nội dung thì đổi tên file** (vd. `bg.v2.png`) để không bị cache cũ.

## Viết theme

Thư mục theme:

```
<themeId>/
├── manifest.json
├── theme.css
├── images/ …   (tuỳ chọn: icon SVG khai báo trong manifest "images", ảnh nền CSS dùng)
└── fonts/ …    (tuỳ chọn: .woff2 + giấy phép font)
```

`manifest.json`:

```json
{
  "schemaVersion": 1,
  "themeId": "<themeId>",
  "version": "1.0.0",
  "name": "Tên hiển thị",
  "css": ["theme.css"],
  "images": {
    "menu.pr": "images/menu-profile.svg",
    "avatar": "images/avatar.svg"
  }
}
```

`images` không bắt buộc — xem [Ảnh theme](#ảnh-theme-icon).

`theme.css` chủ yếu **đặt lại giá trị token** (danh sách bên dưới) trên `.gmogame-wrapper[data-gmo-theme="<themeId>"]`:

```css
.gmogame-wrapper[data-gmo-theme="bubbo"] {
  --gmo-color-primary: #49c8ff;
  --gmo-color-on-primary: #0b2a3a;
  --gmo-panel-bg: linear-gradient(180deg, #e3f6ff 0%, #ffffff 120px);
  --gmo-radius-panel: 24px;
}
```

Quy tắc (theme đóng gói kèm SDK được `npm run build` kiểm tra tự động):

- Mọi selector bắt đầu bằng `.gmogame-wrapper[data-gmo-theme="<themeId>"]`; không selector toàn cục (`body`, `*`, `:root`…).
- Chỉ đặt token có trong danh sách dưới; token lạ không có tác dụng.
- Token chứa ảnh (`--gmo-icon-error`, `--gmo-icon-valid`, `--gmo-icon-invalid` — icon 18×18 cạnh dòng lỗi / điều kiện mật khẩu) chỉ nhận **SVG nhúng** `url("data:image/svg+xml,…")`: đường dẫn file tương đối nằm trong biến CSS mỗi trình duyệt tính theo một file khác nhau.
- Không `@import`, không `!important`, `url()` chỉ trỏ file trong thư mục theme.
- **Không đổi khung / ẩn element**: không đặt `width`, `height`, `margin`, `padding`, `display`, `position`, `top/left/…`, `flex*`, `grid*`, `gap`, `font-size`, `line-height`, `letter-spacing`, `visibility`, `opacity`, `z-index`, `content`, `transform`.
- Không đổi chữ, không ẩn nhãn 18+ / điều khoản / nút đóng. Nút **Đăng nhập bằng GiG** và logo Google / Facebook là nhận diện thương hiệu: SDK giữ màu gốc, theme không đổi được.
- Chữ đủ tương phản trên nền (≥ 4.5:1 với chữ thường): nút primary sáng thì `--gmo-color-on-primary` phải tối.
- Font: khai báo `@font-face` trong `theme.css` với `font-display: swap`, kèm file giấy phép font.
- Hook class `gmo-panel` có trên các thẻ chính (login, đăng ký, alert, liên kết, nạp, QR, menu, cài đặt) cho trường hợp token không đủ; chỉ đổi thuộc tính trình bày (nền, viền, shadow).

### Ảnh theme (icon)

Khi game dùng theme, icon theme khai báo trong `images` **thay** ảnh server (cấu hình `sdk/news`, `sdk/open`) và ảnh mặc định của SDK. Thứ tự cho từng icon: **ảnh theme → ảnh server → ảnh mặc định SDK**; theme không khai báo icon nào thì icon đó giữ như không dùng theme. Ảnh theme tải lỗi thì icon đó quay về ảnh server / mặc định.

| Key | Icon | `viewBox` | Hiển thị |
|---|---|---|---|
| `menu.pr`, `menu.ne`, `menu.ev`, `menu.assistant`, `menu.sp`, `menu.gc` | Mục menu nút nổi theo `type` (tài khoản, tin tức, sự kiện, trợ lý, hỗ trợ, giftcode) | `0 0 72 72` | 28×28 trên ô nền `--gmo-color-surface-2` |
| `menu.default` | Mục menu `type` khác, hoặc `type` trên mà theme không khai báo | `0 0 72 72` | 28×28 |
| `avatar` | Avatar ở panel tài khoản | `0 0 72 72` | 24×24, cắt tròn |

Không thay qua theme (luôn theo server): **icon nút nổi chính** (`icon_float_button`), **badge 18+ trên nút nổi** (`age18.icon_18plus`) và **ảnh 18+ dưới màn đăng nhập** (`age18.image`) — nhãn độ tuổi do vận hành cấu hình. Theme cũng không đổi việc hiện / ẩn, độ mờ, danh sách / tên / thứ tự mục menu.

Chuẩn định dạng:

- **Icon (`images`): chỉ SVG** — nét ở mọi độ phân giải, nhẹ, sửa được. Nền trong suốt, có `viewBox` theo bảng trên, tối đa **10 KB** / file (nên tối ưu bằng SVGO).
- SVG không có `<script>`, thuộc tính `on…`, `<foreignObject>`, `<image>` (ảnh raster nhúng), link ngoài (`href` / `url()` không phải `#…`), `<text>` — **chữ chuyển thành path** (SVG trong `<img>` không tải được font của theme). Màu ghi thẳng trong file (SVG trong `<img>` không đọc token).
- **Ảnh nền trong `theme.css`** (`url(images/...)`): `.svg`, `.webp` (ưu tiên với ảnh nhiều chi tiết) hoặc `.png`.
- **Font: `.woff2`** kèm file giấy phép.

Theme đóng gói kèm SDK được `npm run build` kiểm tra các quy tắc trên; theme host riêng phải tự tuân theo (SDK bỏ qua mục `images` sai key / không phải `.svg`).

### Token

Giá trị dưới đây là **giao diện mặc định**. Đổi tên / bỏ token là thay đổi phá vỡ theme và được ghi trong CHANGELOG.

| Token | Mặc định | Dùng cho |
|---|---|---|
| `--gmo-color-surface` | `#191b1f` | thẻ: login, đăng ký, alert, liên kết, nạp, QR, menu, cài đặt |
| `--gmo-color-surface-2` | `#2a2d33` | nút phụ, ô nhập (nạp, liên kết), ô gói nạp, icon menu |
| `--gmo-color-surface-3` | `#202226` | dòng cài đặt, phương thức nạp, nút đăng xuất ở menu |
| `--gmo-color-surface-hover` | `#34373e` | icon menu khi hover |
| `--gmo-color-surface-popover` | `#262930` | menu chọn ngôn ngữ ở màn login |
| `--gmo-color-input-bg` | `#25272c` | ô nhập màn đăng ký / xác thực SĐT, khung SMS |
| `--gmo-color-text` | `#fff` |  |
| `--gmo-color-text-secondary` | `rgba(255, 255, 255, 0.8)` |  |
| `--gmo-color-text-tertiary` | `rgba(255, 255, 255, 0.85)` |  |
| `--gmo-color-text-subtle` | `rgba(255, 255, 255, 0.7)` |  |
| `--gmo-color-text-hint` | `rgba(255, 255, 255, 0.6)` |  |
| `--gmo-color-text-placeholder` | `rgba(255, 255, 255, 0.5)` |  |
| `--gmo-color-text-muted` | `#9097a6` |  |
| `--gmo-color-text-faint` | `#69707d` |  |
| `--gmo-color-primary` | `#5249ff` | nút chính, viền ô đang nhập |
| `--gmo-color-on-primary` | `#fff` | chữ trên nút chính |
| `--gmo-color-accent` | `#6b6bfd` | link, viền mục đang chọn |
| `--gmo-color-accent-soft` | `#a5a5ff` | tab đang chọn, link ở màn nạp |
| `--gmo-color-accent-check` | `#7b74ff` | dấu tick ngôn ngữ ở màn login |
| `--gmo-color-checkbox` | `#735cff` | ô tick điều khoản |
| `--gmo-color-danger` | `#ff6b6b` |  |
| `--gmo-color-danger-bg` | `rgba(255, 107, 107, 0.1)` |  |
| `--gmo-color-danger-alt` | `#e5534b` | nút đăng xuất ở menu nút nổi |
| `--gmo-color-danger-strong` | `#ff4444` | nút đăng xuất ở màn cài đặt |
| `--gmo-color-success` | `#4cd08a` |  |
| `--gmo-color-success-alt` | `#4caf50` | version ở màn cài đặt |
| `--gmo-color-valid` | `#6cdb00` | điều kiện mật khẩu đã đạt |
| `--gmo-color-warning` | `#f2994a` |  |
| `--gmo-color-hover` | `rgba(255, 255, 255, 0.08)` |  |
| `--gmo-color-hover-subtle` | `rgba(255, 255, 255, 0.06)` |  |
| `--gmo-color-divider` | `rgba(255, 255, 255, 0.08)` |  |
| `--gmo-color-border` | `#3a3d44` |  |
| `--gmo-color-border-strong` | `#5c616b` |  |
| `--gmo-color-progress` | `#4a4d55` | thanh tiến trình đăng ký |
| `--gmo-color-progress-active` | `#fff` |  |
| `--gmo-color-btn-light-bg` | `#fff` |  |
| `--gmo-color-btn-light-text` | `#000` |  |
| `--gmo-color-qr-btn-bg` | `#272a2e` |  |
| `--gmo-color-overlay` | `rgba(13, 20, 36, 0.6)` |  |
| `--gmo-color-overlay-alert` | `rgba(0, 0, 0, 0.7)` |  |
| `--gmo-color-overlay-loading` | `rgba(0, 0, 0, 0.5)` |  |
| `--gmo-color-toast-bg` | `rgba(0, 0, 0, 0.75)` |  |
| `--gmo-color-toast-bg-alt` | `#00000033` |  |
| `--gmo-color-toast-text` | `#fff` |  |
| `--gmo-panel-bg` | `var(--gmo-color-surface)` |  |
| `--gmo-panel-shadow` | `0 12px 40px rgba(0, 0, 0, 0.45)` |  |
| `--gmo-popover-shadow` | `0 8px 24px rgba(0, 0, 0, 0.5)` |  |
| `--gmo-btn-primary-bg` | `var(--gmo-color-primary)` |  |
| `--gmo-radius-panel` | `16px` |  |
| `--gmo-radius-button` | `8px` |  |
| `--gmo-radius-button-lg` | `12px` |  |
| `--gmo-radius-input` | `8px` |  |
| `--gmo-loading-color-1` | `#0099e5` |  |
| `--gmo-loading-color-2` | `#ff4c4c` |  |
| `--gmo-loading-color-3` | `#34bf49` |  |
| `--gmo-alert-ring` | `white` | vòng ngoài (stroke-opacity 0.8, mix-blend-mode overlay) |
| `--gmo-alert-mark` | `#272A2E` | viền + dấu chấm than |
| `--gmo-alert-inner` | `#148EFF` | hình tròn trong (opacity 0.25) |
| `--gmo-alert-gradient-start` | `#9ED0FD` |  |
| `--gmo-alert-gradient-end` | `#148EFF` |  |
| `--gmo-icon-shield-bg` | `#2a2d33` | icon khiên ở màn xác thực / đổi tài khoản |
| `--gmo-icon-shield-mark` | `#0593FF` |  |
| `--gmo-icon-danger` | `#EB5757` | icon lỗi mã PIN (nạp) |
| `--gmo-icon-error` | `url(images/ic-error.png)` |  |
| `--gmo-icon-valid` | `url(images/ic-valid.png)` |  |
| `--gmo-icon-invalid` | `url(images/ic-invalid.png)` |  |
| `--gmo-font-body` | `"Nunito Sans", sans-serif` |  |
| `--gmo-font-ui` | `"Inter", "Nunito Sans", sans-serif` |  |
| `--gmo-font-heading` | `initial` | tiêu đề: initial = không đặt → tiêu đề kế thừa font của thẻ như hiện tại |

`--gmo-font-heading` mặc định `initial`: tiêu đề dùng font của thẻ; theme đặt giá trị để tiêu đề dùng font riêng.
