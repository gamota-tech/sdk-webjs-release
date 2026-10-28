# Tích hợp Gamota SDK H5

Tài liệu cho dev game tích hợp **Gamota SDK H5** (`GMOGameSDK`) vào game chạy trên trình duyệt: đăng nhập (tài khoản Gamota, Google, Facebook, chơi ngay, GiG, QR), nạp, liên kết tài khoản, tracking.

Version SDK của tài liệu này: **v6.2.13**

## Chọn hướng dẫn theo engine

| Game làm bằng | Hướng dẫn |
|---|---|
| HTML / JavaScript thuần, Phaser, PixiJS… | [web.md](web.md) |
| Unity (xuất **WebGL**) | [unity-webgl.md](unity-webgl.md) |

Engine khác (Cocos Creator…) chưa được hỗ trợ chính thức — liên hệ Gamota trước khi tích hợp.

Tra cứu chung cho mọi engine: [api.md](api.md) (API, event, dữ liệu trả về) · [checklist.md](checklist.md) (kiểm tra sau khi tích hợp, lỗi hay gặp) · [CHANGELOG.md](CHANGELOG.md) (thay đổi theo version — đọc mục "Cần làm khi nâng cấp" trước khi đổi tag).

## Chuẩn bị trước khi tích hợp

Xin Gamota các thông tin sau cho game (không tự đặt):

| Tham số | Ghi chú |
|---|---|
| `gmoApiKey` | Bắt buộc |
| `gmoRefCode` | Bắt buộc |
| `gameId` | Bắt buộc |
| `googleClientId` | Bắt buộc. **Domain chạy game phải được thêm vào "Authorized JavaScript origins"** của OAuth client, nếu không đăng nhập Google lỗi |
| `facebookAppId` | Không bắt buộc — chỉ cần khi game dùng đăng nhập / liên kết Facebook; không dùng thì bỏ key này (SDK ẩn nút Facebook, không tải Facebook SDK). Domain chạy game phải được khai báo trong Facebook App |
| `adjustAppToken` | Không bắt buộc — chỉ cần khi game dùng Adjust; không dùng thì bỏ key này (SDK không tải Adjust, event vẫn gửi Log SDK / GTM) |
| `gtmId` | Bắt buộc (dạng `GTM-…`) |
| `appVersion` | Không bắt buộc — version game, vd. `"1.0.0"` |

Tham số không bắt buộc thì **bỏ hẳn key** (hoặc để `''`), không đặt giá trị giữ chỗ — giá trị bất kỳ khác rỗng đều được coi là đang dùng.

Thiếu tham số bắt buộc thì `init` báo lỗi `GMOGameSDK Exception: Params '…' must be implemented.`

## Yêu cầu môi trường

- Game phải chạy qua **web server (https khi lên thật)**. **Không mở bằng `file://`** — đăng nhập Google / Facebook / GiG và gọi API sẽ lỗi. Test local: `python3 -m http.server 8080` rồi mở `http://localhost:8080`.
- Luôn trỏ URL SDK vào **tag cố định** (vd. `@v6.2.13`), không dùng `@main`.
- CSS, `gmogame-sdk-ui.js` (và `gmogame-script.js` với Unity) phải **cùng tag**.

## Tích hợp bằng AI

Bộ skill `gamota-sdk-integration` (phát hành cùng SDK ở `dist/skills/`) giúp AI agent (Claude Code…) tự tích hợp theo đúng tài liệu này. Cài: copy thư mục `gamota-sdk-integration` vào `.claude/skills/` của project game, rồi bảo AI "tích hợp Gamota SDK vào game này".
