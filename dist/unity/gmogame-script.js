// Cầu nối Unity WebGL → Gamota SDK H5 (phía JS)
// Nhúng SAU gmogame-sdk-ui.js trong template WebGL. Template phải khai báo `var unityGame;`
// và gán `unityGame = unityInstance;` trong createUnityInstance(...).then(...).
// - Hàm global bên dưới: GMOGameSDK.jslib gọi khi C# gọi GMOGameSDK.cs
// - Event của SDK → unityGame.SendMessage("GMOGameSDKReceiver", "<Hàm>", json) → GMOGameSDKReceiver.cs
const sdk = GMOGameSDK.getInstance();

function init(gmogameConfig,firebaseConfig){
  sdk.init(gmogameConfig,firebaseConfig);
}
function setKeepLoginSession(keep) {
  sdk.setKeepLoginSession(keep);
}

function setAutoShowLoginDialog(autoShow) {
  sdk.setAutoShowLoginDialog(autoShow);
}

function showLoginView() {
  sdk.showLoginView();
}

function logout() {
  sdk.logout();
}

function setRoleWithRoleName(characterName,characterId,serverName,serverId) {
  sdk.setRoleWithRoleName(characterName,characterId,serverName,serverId);
}

function showPaymentView() {
  sdk.showPaymentView();
}

function showAccountLinkView() {
  sdk.showAccountLinkView();
}

function showUserInfoView() {
  sdk.showUserInfoView();
}

function openFanpage() {
  sdk.openFanpage();
}

function openGroup() {
  sdk.openGroup();
}

function switchAccount() {
  sdk.switchAccount();
}

function getUserInfo() {
  return sdk.getUserInfo();
}

function isUserLoggedIn() {
  return sdk.isUserLoggedIn();
}

function getVersion() {
  return sdk.getVersion();
}

function trackLevel(level) {
  sdk.trackLevel(level);
}

function logEvent(eventName, eventParams) {
  sdk.logEvent(eventName, eventParams);
}

// Gửi event về Unity. Event có thể tới trước khi template kịp gán unityGame
// (vd. giữ phiên đăng nhập bắn login success ngay khi init) → xếp hàng, gửi lại khi unityGame sẵn sàng.
const GMO_UNITY_RECEIVER = "GMOGameSDKReceiver";
const gmoPendingUnityMessages = [];
let gmoUnityWaitTimer = null;
let gmoUnityWaitStart = 0;

function gmoUnityReady() {
  return typeof unityGame !== 'undefined' && unityGame && typeof unityGame.SendMessage === 'function';
}

function gmoFlushUnityMessages() {
  if (!gmoUnityReady()) {
    if (Date.now() - gmoUnityWaitStart > 30000) {
      clearInterval(gmoUnityWaitTimer);
      gmoUnityWaitTimer = null;
      console.error('[GMOGameSDK] unityGame chưa được gán sau 30s — template WebGL phải có `var unityGame;` và `unityGame = unityInstance;` trong createUnityInstance(...).then(...). Đã bỏ ' + gmoPendingUnityMessages.length + ' event.');
      gmoPendingUnityMessages.length = 0;
    }
    return;
  }
  clearInterval(gmoUnityWaitTimer);
  gmoUnityWaitTimer = null;
  while (gmoPendingUnityMessages.length) {
    const [method, payload] = gmoPendingUnityMessages.shift();
    unityGame.SendMessage(GMO_UNITY_RECEIVER, method, payload);
  }
}

function sendToUnity(method, payload) {
  gmoPendingUnityMessages.push([method, payload]);
  if (gmoUnityReady()) {
    gmoFlushUnityMessages();
  } else if (!gmoUnityWaitTimer) {
    gmoUnityWaitStart = Date.now();
    gmoUnityWaitTimer = setInterval(gmoFlushUnityMessages, 100);
  }
}

window.addEventListener('gmogame-sdk-ui-on-user-login-success', (event) => {
  // GMOSession (C#) khai báo userId kiểu string; API có lúc trả số → JsonUtility để trống. Chuẩn hoá thành chuỗi.
  const session = Object.assign({}, event.detail);
  if (session.userId !== undefined && session.userId !== null) session.userId = String(session.userId);
  sendToUnity("OnLoginSuccess", JSON.stringify(session));
});

window.addEventListener('gmogame-sdk-ui-on-user-logout', (event) => {
  sendToUnity("OnLogoutSuccess", JSON.stringify(event.detail));
});

window.addEventListener('gmogame-sdk-ui-on-account-link-success', (event) => {
  sendToUnity("OnAccountLinkSuccess", JSON.stringify(event.detail));
});
