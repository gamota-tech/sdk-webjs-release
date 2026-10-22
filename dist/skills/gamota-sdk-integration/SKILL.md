---
name: gamota-sdk-integration
description: Tích hợp Gamota SDK H5 (GMOGameSDK — đăng nhập Gamota / Google / Facebook / chơi ngay / GiG / QR, nạp, tracking) vào game chạy trên trình duyệt — game HTML/JS (Phaser, PixiJS…), Unity xuất WebGL (qua Gamota Unity SDK wrapper). Dùng skill này bất cứ khi nào user muốn thêm / sửa / nâng cấp Gamota SDK, đăng nhập Gamota, popup nạp Gamota, GMOGameSDK, gmogame-sdk-ui.js, gmogame-script.js, jslib bridge Gamota, chuyển từ game-sdk-pub sang sdk-webjs-release — kể cả khi user chỉ nói "tích hợp SDK Gamota", "gắn login Gamota vào game", "integrate Gamota SDK", "add Gamota login to my WebGL build".
---

# Tích hợp Gamota SDK H5 (version v6.2.12)

Mục tiêu: game gọi được Gamota SDK H5 đúng thứ tự, nhận được kết quả đăng nhập, mở được nạp — và dev biết chính xác phần nào đã xong, phần nào cần họ tự kiểm tra.

Tài liệu chi tiết nằm trong `references/` — chỉ đọc file của engine đang làm:

| File | Khi nào đọc |
|---|---|
| `references/README.md` | Luôn đọc trước: tham số cần xin Gamota, yêu cầu môi trường |
| `references/api.md` | Cần tra hàm, event, dữ liệu đăng nhập |
| `references/web.md` | Game HTML/JS, Phaser, PixiJS… |
| `references/unity-webgl.md` | Game Unity xuất WebGL |
| `references/checklist.md` | Sau khi tích hợp xong — tự kiểm tra và báo cho dev |
| `references/CHANGELOG.md` | Nâng cấp từ bản cũ — mục "Cần làm khi nâng cấp" của các version từ bản game đang dùng tới v6.2.12 |

## Quy trình

### 1. Xác định engine và hiện trạng

Nhìn cấu trúc project:

- **Unity**: có `ProjectSettings/ProjectVersion.txt` và `Assets/` → `unity-webgl.md`. Đọc `ProjectVersion.txt` để biết version (hướng dẫn dành cho Unity 2021.3+; bản cũ hơn thì báo dev).
- **Web thuần / engine JS**: có `index.html` chạy game → `web.md`.
- **Engine khác** (Cocos Creator — `package.json` có khoá `"creator"`…): chưa được hỗ trợ chính thức. Báo dev liên hệ Gamota và dừng, không tự áp dụng `web.md` — cách nhúng của engine đó chưa được kiểm chứng.
- Không chắc thì hỏi dev, đừng đoán — mỗi engine nhúng SDK ở chỗ khác nhau.

Tìm tích hợp cũ (`GMOGameSDK`, `gmogame-sdk-ui.js`, `game-sdk-pub`, `GMOGameSDKReceiver`). Nếu có, đây là **nâng cấp**: xác định tag game đang dùng (trong URL nhúng SDK), đọc `references/CHANGELOG.md` và làm đủ mục "Cần làm khi nâng cấp" của mọi version từ bản đó tới v6.2.12; giữ nguyên code game đang dùng, chỉ đổi URL / phần cần đổi. Liệt kê các thay đổi đáng chú ý (mục "Thay đổi") trong báo cáo cuối để dev biết hành vi nào khác đi.

### 2. Lấy thông tin cấu hình

Hỏi dev các tham số trong `references/README.md` (`gmoApiKey`, `gmoRefCode`, `gameId`, `googleClientId`, `facebookAppId`, `adjustAppToken`, `gtmId`, `appVersion`). Đây là thông tin Gamota cấp riêng cho từng game — **không tự bịa, không lấy giá trị từ ví dụ / project khác**: key sai làm SDK gọi nhầm game hoặc lỗi khó tìm. Dev chưa có thì đặt giá trị giữ chỗ dễ thấy (`"TODO_GMO_API_KEY"`…), làm tiếp, và ghi rõ trong báo cáo cuối.

### 3. Tích hợp theo file của engine

Làm theo `references/web.md` hoặc `references/unity-webgl.md`. Những điểm dưới đây là nguyên nhân lỗi phổ biến nhất — kiểm tra kỹ:

- **Đăng ký nhận event trước `init`.** Khi giữ phiên đăng nhập, SDK bắn "đăng nhập thành công" ngay trong lúc `init` chạy; đăng ký sau là mất event đó và game kẹt ở màn chờ.
- **`setKeepLoginSession` / `setAutoShowLoginDialog` gọi trước `init`** — `init` đọc 2 giá trị này ngay khi chạy.
- **`init` nhận chuỗi JSON**, không phải object (`JSON.stringify(config)`; C# truyền string). Truyền object → báo thiếu tham số.
- **Gọi `setRoleWithRoleName` sau khi user chọn nhân vật, trước khi mở nạp** — thiếu thì nạp báo chưa chọn nhân vật.
- **CSS, `gmogame-sdk-ui.js` (và `gmogame-script.js` với Unity) cùng một tag**, trỏ vào tag cố định `@v6.2.12`, không dùng `@main` — tag cố định giữ game không đổi hành vi khi SDK ra bản mới.
- **Unity — package trước**: kiểm tra project đã import Gamota Unity SDK chưa: có `Assets/GMOGameSDK/GMOGameSDK.cs` và `Assets/GMOGameSDK/Plugins/GMOGameSDK.jslib`, và `GMO_VERSION` trong `GMOGameSDK.cs` ≥ `1.0.2` (bản cũ hơn không có cầu nối WebGL đúng).
  - Chưa có / bản cũ → **không tự viết** `GMOGameSDK.cs`, `.jslib`, receiver thay thế, và không tự giải nén `.unitypackage` (import sai làm hỏng `.meta` / GUID). Đưa dev link tải package (`references/unity-webgl.md` mục 1) và nhờ dev import qua Unity Editor; vẫn làm tiếp phần template, còn phần C# thì ghi rõ trong báo cáo là chờ import.
  - Đã có → chỉ gọi API của package (`GMOGameSDK.Instance…`). Không thêm bridge / receiver mới: một GameObject trùng tên `GMOGameSDKReceiver` làm event về sai chỗ.
- **Unity — template**: xem template đang dùng ở `ProjectSettings/ProjectSettings.asset`, khoá `webGLTemplate`: `PROJECT:<Tên>` → sửa `Assets/WebGLTemplates/<Tên>/index.html`; `APPLICATION:Default` / `APPLICATION:Minimal` → template có sẵn của Unity, phải tạo template riêng trong `Assets/WebGLTemplates/` trước (`references/unity-webgl.md` mục 2.1; không có thư mục cài Unity để copy thì dựng theo cấu trúc template Default, giữ các biến `{{{ … }}}`), rồi đổi `webGLTemplate` sang `PROJECT:<Tên>` hoặc nhắc dev chọn trong Player Settings. Không sửa `index.html` trong thư mục build (Unity ghi đè mỗi lần build). Template phải có `var unityGame;` và `unityGame = unityInstance;`, nhúng `gmogame-script.js` sau `gmogame-sdk-ui.js`.
- **Không log / không lưu `accessToken`, `verifyToken` ra ngoài** — gửi về server game để xác thực.

Không cần gọi hàm riêng cho đăng nhập GiG / QR (nút có sẵn trong màn đăng nhập) hay nạp trong app GiG (`showPaymentView` tự xử lý).

### 4. Kiểm tra

Chạy những gì kiểm tra được: cú pháp file đã sửa, thứ tự thẻ `<script>`, thứ tự đăng ký event → setter → `init`, URL cùng tag. Nếu project web chạy được local, chạy qua web server (`python3 -m http.server 8080`) — **không mở bằng `file://`** vì đăng nhập và gọi API sẽ lỗi. Với Unity không build được ở môi trường hiện tại, đừng nhận là đã test.

### 5. Báo cáo cho dev

Kết thúc bằng báo cáo ngắn theo mẫu:

```
## Đã tích hợp Gamota SDK H5 v6.2.12
- Engine: <engine + version>
- File đã sửa / thêm: <danh sách>
- Cấu hình: <tham số đã điền / còn giữ chỗ TODO_…>

## Dev cần làm tiếp
- <điền key thật, khai báo domain với Google OAuth + Facebook App, build WebGL…>

## Kiểm tra
- Đã kiểm tra: <…>
- Cần dev kiểm tra (checklist: references/checklist.md): <…>
```

Lưu ý những giới hạn hiện tại để dev không chờ nhầm: H5 **chưa có event kết quả nạp** (Unity: `onPurchaseComplete` / `onPurchaseFail` / `onPaymentClosed` không chạy trên WebGL) — game kiểm tra kết quả nạp phía server.
