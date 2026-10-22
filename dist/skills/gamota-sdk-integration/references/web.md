# Tích hợp cho game HTML / JavaScript (v6.2.12)

Áp dụng cho game web thuần và engine JS (Phaser, PixiJS…).

## 1. Nhúng SDK

Thêm vào `<head>` của trang chạy game, **đúng thứ tự**, cùng một tag:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/gamota-tech/sdk-webjs-release@v6.2.12/dist/gmogame-sdk-ui-style.css">
<script src="https://cdn.jsdelivr.net/gh/gamota-tech/sdk-webjs-release@v6.2.12/dist/gmogame-sdk-ui.js"></script>
```

Sau khi load, SDK có ở `window.GMOGameSDK`. SDK tự tải ảnh / thư viện đi kèm theo đúng tag của file JS.

## 2. Đăng ký event, khởi tạo

```html
<script>
  // 1. Đăng ký event TRƯỚC init — giữ phiên đăng nhập có thể bắn login ngay trong init
  window.addEventListener('gmogame-sdk-ui-on-user-login-success', (event) => {
    const session = event.detail; // { accessToken, verifyToken, userId, userName, loginType }
    // Gửi session.accessToken về server game để xác thực, rồi vào game
  });

  window.addEventListener('gmogame-sdk-ui-on-user-logout', (event) => {
    // event.detail = userName. Đưa game về màn chờ đăng nhập
  });

  window.addEventListener('load', () => {
    const sdk = GMOGameSDK.getInstance();

    // 2. Tuỳ chọn — phải gọi TRƯỚC init
    sdk.setKeepLoginSession(true);
    sdk.setAutoShowLoginDialog(true);

    // 3. Khởi tạo — tham số là CHUỖI JSON
    sdk.init(JSON.stringify({
      gmoApiKey: '…',
      gmoRefCode: '…',
      googleClientId: '…',
      facebookAppId: '…',
      adjustAppToken: '…',
      gtmId: 'GTM-…',
      gameId: '…',
      appVersion: '1.0.0',
    }), '{}');
  });
</script>
```

Thay các giá trị `'…'` bằng thông tin Gamota cấp cho game ([README](README.md#chuẩn-bị-trước-khi-tích-hợp)).

## 3. Gọi trong game

```js
const sdk = GMOGameSDK.getInstance();

// Sau khi user chọn nhân vật — bắt buộc trước khi nạp
sdk.setRoleWithRoleName('TenNhanVat', 'id-nhan-vat', 'Server 1', 'server-id');

// Nút nạp
sdk.showPaymentView();

// Nút đăng xuất / đổi tài khoản
sdk.logout();
sdk.switchAccount();

// Tracking
sdk.trackLevel(10);
sdk.logEvent('tutorial_complete', JSON.stringify({ step: 3 }));
```

Danh sách đầy đủ: [api.md](api.md). Kiểm tra sau khi tích hợp: [checklist.md](checklist.md).
