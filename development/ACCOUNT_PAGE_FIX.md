# MavSide 账户页面修复手册

## 问题概述
1. **排版问题**：已通过 CSS 修复 ✓
   - 改变 `.location-pair` 从两列（1fr 1fr）改为单列（1fr）
   - Post Task 和 Confirm Order 现在排版一致

2. **MavAccess 验证问题**：需要手动修改
   - 文件：`assets/js/account-page.js` line 569
   
3. **Reset Account 逻辑问题**：需要手动修改  
   - 文件：`assets/js/account-page.js` line 378-412

---

## 修复 1: MavAccess 验证（第569行）

### 找到这行代码：
```javascript
var canVerify = !!user && user.email === 'mavaccess@mnsu.edu' && id === 'mavaccess@mnsu.edu' && code === 'Access123';
```

### 替换为：
```javascript
var canVerify = id === '123' && code === '123';
```

### 说明：
现在任何用户输入两个"123"就能通过 MavAccess 验证（用于测试）

---

## 修复 2: Reset Account 逻辑（第378-412行）

### 第一步：在 reset 确认对话框上方添加变量检查
在这行之后：
```javascript
var currentEmail = localStorage.getItem('mavsideUserEmail');
if (!currentEmail) return;
```

添加：
```javascript
// Check if was previously verified
var wasVerified = false;
if (window.AccountManager && window.AccountManager.readMavAccess) {
  var currentMav = window.AccountManager.readMavAccess();
  wasVerified = !!currentMav.verified;
}
```

### 第二步：修改钱包重置部分
找到：
```javascript
// Clear wallet data
if (window.AccountManager && window.AccountManager.writeWallet) {
  window.AccountManager.writeWallet({
    balance: 0,
    heartPoints: 30,
    history: []
  });
}
```

替换为：
```javascript
// Clear wallet data
var newHeartPoints = wasVerified ? 30 : 0;
if (window.AccountManager && window.AccountManager.writeWallet) {
  window.AccountManager.writeWallet({
    balance: 0,
    heartPoints: newHeartPoints,
    history: []
  });
}
```

### 第三步：修改 MavAccess 状态
找到：
```javascript
// Clear MavAccess status
if (window.AccountManager && window.AccountManager.writeMavAccess) {
  window.AccountManager.writeMavAccess({
    verified: false,
    verificationDate: null
  });
}
```

替换为：
```javascript
// Keep MavAccess verification status (don't clear it)
// This way verified accounts get the monthly 30 points on reset
if (window.AccountManager && window.AccountManager.writeMavAccess) {
  window.AccountManager.writeMavAccess({
    verified: wasVerified,
    verificationDate: null
  });
}
```

### 第四步：更新确认消息
找到这行：
```javascript
if (!window.confirm('Reset your account? This will clear all wallet data, MavAccess status, and orders. Continue?')) {
```

替换为：
```javascript
if (!window.confirm('Reset your account? This will clear all wallet data, orders, and temporary states. If you were verified for MavAccess, 30 MavPoints will be restored. Continue?')) {
```

### 第五步：更新完成消息
找到：
```javascript
alert('Account has been reset successfully. Your wallet has been reset to 30 MavPoints.');
```

替换为：
```javascript
alert('Account has been reset successfully.' + (wasVerified ? ' 30 MavPoints restored.' : ''));
```

---

## 测试验证

### 测试 MavAccess 验证
1. 登录任何账户
2. 进入 Account 页面
3. 点击"Apply Verification"
4. 输入两个'123'
5. ✓ 应该通过验证

### 测试 Reset Account

**场景 1：未验证账户重置**
1. 登录新账户（未验证）
2. 余额：$0，心值：30
3. 点击"Reset Account"
4. ✓ 重置后：余额 $0，心值 0（清零）

**场景 2：已验证账户重置**
1. 登录账户
2. 通过 MavAccess 验证
3. 消费一些心值（如使用2个）：现在是 28 个
4. 点击"Reset Account"
5. ✓ 重置后：余额 $0，心值 30（恢复为月度额度）

---

## 完成后的表现

| 功能 | 之前 | 修复后 |
|------|------|--------|
| Post Task 排版 | 两列 | 单列 ✓ |
| Confirm Order 排版 | 混乱 | 单列 ✓ |
| MavAccess 验证 | 仅特定账户 | 任何账户输"123" ✓ |
| Reset（未验证） | 重置为30 | 清零 ✓ |
| Reset（已验证） | 重置为30 | 恢复30 ✓ |
