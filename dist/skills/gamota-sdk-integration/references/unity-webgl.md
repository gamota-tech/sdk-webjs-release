# Tích hợp cho Unity WebGL (v6.2.13)

Unity 2021.3 trở lên, xuất **WebGL**. C# không gọi trực tiếp JS được, nên dùng **Gamota Unity SDK** (wrapper C# dùng chung cho Android / iOS / WebGL) + một file JS cầu nối do SDK H5 phát hành.

```
C#  GMOGameSDK.Instance.X()  →  GMOGameSDK.jslib (bridge_*)  →  gmogame-script.js  →  SDK H5
C#  onLoginSuccess / …       ←  GMOGameSDKReceiver (SendMessage)  ←  gmogame-script.js  ←  event SDK H5
```

## 1. Import Gamota Unity SDK

Tải [`GMOGameSDK-WebGL.unitypackage`](https://cdn.jsdelivr.net/gh/gamota-tech/sdk-webjs-release@v6.2.13/dist/unity/GMOGameSDK-WebGL.unitypackage) rồi import vào project (Assets → Import Package → Custom Package). Package phát hành cùng tag với SDK H5, nên luôn khớp với `gmogame-script.js` cùng tag — khi nâng cấp SDK, tải lại package của tag mới.

- Package gồm `Assets/GMOGameSDK/` (`GMOGameSDK.cs`, `GMOGameSDKReceiver.cs`, `GMOSession.cs`…) và `Plugins/GMOGameSDK.jslib` — chỉ phần cần cho WebGL, **không có plugin Android / iOS**.
- Game build cả Android / iOS từ cùng project: dùng bản đầy đủ của Gamota Unity SDK (xin Gamota). Hai bản dùng chung GUID nên import bản này đè bản kia (cùng version) không bị trùng file.
- Package **không kèm template WebGL** — game sửa template của chính mình theo bước 2.

## 2. Sửa template WebGL của game

Trang chạy game WebGL phải (a) nhúng SDK H5 + `gmogame-script.js`, và (b) cho `gmogame-script.js` biết instance Unity để gửi event về C#. Cả hai làm trong **template WebGL** — file `index.html` mà Unity dùng làm khuôn khi build.

> **Không sửa `index.html` trong thư mục build** (`Build/…`, thư mục output): Unity sinh lại file đó mỗi lần build, sửa tay sẽ mất. Luôn sửa file template trong `Assets/WebGLTemplates/`.

### 2.1. Tạo template riêng (nếu game đang dùng template có sẵn của Unity)

Xem Player Settings → WebGL → Resolution and Presentation → **WebGL Template**:

- Đang chọn template trong `Assets/WebGLTemplates/<Tên>/` (template riêng của game) → bỏ qua bước này, sửa thẳng `Assets/WebGLTemplates/<Tên>/index.html`.
- Đang chọn **Default** hoặc **Minimal** (template có sẵn của Unity, nằm trong thư mục cài Unity, không sửa được trong project) → copy ra thành template riêng:
  1. Copy thư mục template tương ứng từ thư mục cài Unity:
     - macOS: `/Applications/Unity/Hub/Editor/<version>/PlaybackEngines/WebGLSupport/BuildTools/WebGLTemplates/Default`
     - Windows: `C:\Program Files\Unity\Hub\Editor\<version>\Editor\Data\PlaybackEngines\WebGLSupport\BuildTools\WebGLTemplates\Default`
  2. Dán vào project thành `Assets/WebGLTemplates/<TênGame>/` (đặt tên tuỳ ý, vd. `Gamota`).
  3. Quay lại Player Settings → **WebGL Template** → chọn template vừa tạo (Unity tự nhận mọi thư mục trong `Assets/WebGLTemplates/`).

Template giữ nguyên các biến của Unity (`{{{ PRODUCT_NAME }}}`, `{{{ LOADER_FILENAME }}}`, `#if USE_WASM`…) — Unity thay chúng khi build, đừng xoá.

### 2.2. Nhúng SDK vào `<head>`

Thêm 3 dòng vào `<head>` của template, **đúng thứ tự** (CSS → `gmogame-sdk-ui.js` → `gmogame-script.js`), **cùng một tag**:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/gamota-tech/sdk-webjs-release@v6.2.13/dist/gmogame-sdk-ui-style.css">
<script src="https://cdn.jsdelivr.net/gh/gamota-tech/sdk-webjs-release@v6.2.13/dist/gmogame-sdk-ui.js"></script>
<script src="https://cdn.jsdelivr.net/gh/gamota-tech/sdk-webjs-release@v6.2.13/dist/unity/gmogame-script.js"></script>
```

Đặt trong `<head>` (không đặt cuối `<body>`, không thêm `async` / `defer`) để SDK sẵn sàng trước khi game Unity chạy `Start()` và gọi `Init`.

> Game chuyển từ SDK cũ (`gamota-tech/game-sdk-pub`): đổi **tên repo + tag** ở cả 3 URL, và `gmogame-script.js` giờ nằm ở **`dist/unity/`** (không còn ở `dist/`).

### 2.3. Gán biến `unityGame` (bắt buộc)

`gmogame-script.js` gửi event (đăng nhập, đăng xuất…) về C# qua biến global `unityGame`. Thiếu biến này, C# không bao giờ nhận được `onLoginSuccess`.

Trong `<script>` của template, tìm chỗ gọi `createUnityInstance(...)`:

1. Khai báo `var unityGame;` ở đầu script (cấp global — **`var`**, không dùng `let` / `const` bên trong hàm).
2. Trong `.then((unityInstance) => { ... })`, thêm `unityGame = unityInstance;` làm **dòng đầu tiên**.

Ví dụ với template Default của Unity 2021.3 (chỉ thêm 2 dòng có comment `Gamota`):

```html
<script>
  var unityGame; // Gamota: biến global để gmogame-script.js gửi event về C#

  var container = document.querySelector("#unity-container");
  var canvas = document.querySelector("#unity-canvas");
  // ... (giữ nguyên phần còn lại của template)

  script.onload = () => {
    createUnityInstance(canvas, config, (progress) => {
      progressBarFull.style.width = 100 * progress + "%";
    }).then((unityInstance) => {
      unityGame = unityInstance; // Gamota
      loadingBar.style.display = "none";
      fullscreenButton.onclick = () => {
        unityInstance.SetFullscreen(1);
      };
    }).catch((message) => {
      alert(message);
    });
  };
</script>
```

Event bắn trước khi dòng `unityGame = unityInstance;` chạy (vd. giữ phiên đăng nhập) được `gmogame-script.js` giữ lại và gửi khi `unityGame` sẵn sàng (chờ tối đa 30s) — nên chỉ cần gán đúng chỗ, không cần xử lý thêm.

### 2.4. Fullscreen

Giao diện SDK (đăng nhập, nạp…) là HTML nằm đè lên canvas. Khi game bật fullscreen bằng `unityInstance.SetFullscreen(1)` (nút fullscreen của template Default), trình duyệt chỉ hiển thị canvas → **popup SDK bị che**. Cách xử lý: bỏ nút fullscreen của template, hoặc thoát fullscreen (`SetFullscreen(0)`) trước khi gọi đăng nhập / nạp. Trên mobile, nên để canvas chiếm toàn trang bằng CSS (`width: 100%; height: 100%`) thay cho fullscreen API.

### 2.5. Kiểm tra template sau khi build

- Mở `index.html` trong thư mục build (bằng editor): có đủ 3 dòng nhúng ở `<head>`, có `var unityGame;` và `unityGame = unityInstance;` — nếu không có, Unity đang dùng template khác (xem lại Player Settings → WebGL Template).
- Chạy qua web server, mở DevTools → Console: không có lỗi `[GMOGameSDK] unityGame chưa được gán sau 30s`; Network: 3 file tải từ `sdk-webjs-release@v6.2.13`, không 404.

## 3. Gọi từ C#

```csharp
using System.Collections.Generic;
using UnityEngine;

public class GameBoot : MonoBehaviour
{
    void Start()
    {
        var sdk = GMOGameSDK.Instance;

        // 1. Đăng ký nhận kết quả TRƯỚC Init
        sdk.onLoginSuccess += OnLoginSuccess;   // GMOSession
        sdk.onLogoutSuccess += OnLogoutSuccess;

        // 2. Tuỳ chọn — gọi TRƯỚC Init
        sdk.SetKeepLoginSession(true);
        sdk.SetAutoShowLoginDialog(true);

#if UNITY_WEBGL
        // 3. Khởi tạo — tham số là CHUỖI JSON
        string config = "{\"gmoApiKey\":\"…\",\"gmoRefCode\":\"…\",\"googleClientId\":\"…\","
                      + "\"facebookAppId\":\"…\",\"adjustAppToken\":\"…\",\"gtmId\":\"GTM-…\","
                      + "\"gameId\":\"…\",\"appVersion\":\"1.0.0\"}";
        sdk.Init(config, "{}");
#else
        sdk.Init(); // Android / iOS: SDK native
#endif
    }

    void OnLoginSuccess(GMOSession session)
    {
        // session.accessToken, session.userId, session.userName, session.loginType
    }

    void OnLogoutSuccess() { }

    void OnDestroy()
    {
        GMOGameSDK.Instance.onLoginSuccess -= OnLoginSuccess;
        GMOGameSDK.Instance.onLogoutSuccess -= OnLogoutSuccess;
    }
}
```

`facebookAppId` và `adjustAppToken` không bắt buộc: game không dùng Facebook login / Adjust thì bỏ hẳn field đó khỏi chuỗi JSON ([README](README.md#chuẩn-bị-trước-khi-tích-hợp)).

Trong game:

```csharp
GMOGameSDK.Instance.SetRoleWithRoleName("TenNhanVat", "id-nhan-vat", "Server 1", "server-id"); // trước khi nạp
GMOGameSDK.Instance.MakePaymentViewWithPackageID("");   // WebGL: mở nạp, bỏ qua packageID
GMOGameSDK.Instance.Logout();
GMOGameSDK.Instance.LogEvent("tutorial_complete", new Dictionary<string, object> { { "step", 3 } });
```

## Tương ứng C# ↔ SDK H5

| C# (`GMOGameSDK.Instance`) | SDK H5 | Ghi chú WebGL |
|---|---|---|
| `Init(configJson, firebaseJson)` | `init` | |
| `SetKeepLoginSession` / `SetAutoShowLoginDialog` | cùng tên | Gọi trước `Init` |
| `ShowLoginView`, `Logout`, `SwitchAccount`, `ShowAccountLinkView`, `ShowUserInfoView` | cùng tên | |
| `GoLoginbyGiG()`, `GoSupportView()` | `goLoginbyGiG`, `goSupportView` | Mở popup: gọi từ thao tác bấm của người chơi (vd. `Button.onClick`) |
| `IsUserLoggedIn()` | `isUserLoggedIn` | |
| `GetUserInfo()` | `getUserInfo` | Chuỗi JSON (`GMOSession`), chưa đăng nhập: `"null"` |
| `SetRoleWithRoleName(...)` | `setRoleWithRoleName` | |
| `MakePaymentViewWithPackageID(id)` | `showPaymentView` | Unity package hiện tại chưa truyền `packageID` sang JS — user chọn gói trên popup (hoặc màn nạp native khi chạy trong app GiG). JS đã hỗ trợ `showPaymentView(v3Id)`; truyền id cần bản Unity package mới |
| `LogEvent(name)` / `LogEvent(name, Dictionary)` | `logEvent` | |
| `onLoginSuccess(GMOSession)` | event login success | |
| `onLogoutSuccess()` | event logout | |
| `onPurchaseComplete`, `onPurchaseFail`, `onPaymentClosed` | — | **Chưa có trên WebGL** — kiểm tra kết quả nạp phía server game |
| `SetSDKButtonVisibility`, `SendStateToWrapper` | — | Chỉ Android / iOS, WebGL bỏ qua |

## Lỗi hay gặp (Unity)

- Event đăng nhập không về C#: thiếu `unityGame = unityInstance` trong template; hoặc thiếu `gmogame-script.js`; hoặc nhúng sai thứ tự (`gmogame-script.js` phải sau `gmogame-sdk-ui.js`). Console sẽ báo `[GMOGameSDK] unityGame chưa được gán sau 30s`.
- Đã sửa template mà bản build không có SDK: sửa nhầm `index.html` trong thư mục build (bị ghi đè khi build lại), hoặc Player Settings → WebGL Template chưa chọn template đã sửa.
- `GMOGameSDK is not defined` / `init is not defined` khi gọi `Init`: thiếu dòng nhúng ở `<head>`, hoặc nhúng có `async` / `defer` / đặt cuối `<body>`.
- Bấm fullscreen xong không thấy popup đăng nhập / nạp: xem mục 2.4.
- `EntryPointNotFoundException` khi Play trong Editor: dùng Gamota Unity SDK bản có sửa WebGL (≥ 1.0.2); bản cũ gọi JS cả trong Editor.
- Không dùng thêm receiver tự viết đặt tên GameObject `GMOGameSDKReceiver` — trùng với receiver của package.

Kiểm tra sau khi tích hợp: [checklist.md](checklist.md).
