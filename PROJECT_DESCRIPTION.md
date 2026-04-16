# MavSide — 项目说明（中文概述）

## 一、项目简介
- MavSide 是一个前端演示版的校园跑腿/互助小程序原型，采用纯静态 HTML/CSS/Vanilla JS 实现，所有数据以浏览器的 localStorage 保存，适合用于演示、前端交互验证与教学。
- 主要目标：快速验证跑腿发布/接单/押金流程、任务管理与地图预览的前端交互体验。

## 二、主要功能（概览）
- 用户注册/登录（仅允许 `@mnsu.edu` 学校邮箱，演示模式下账号保存在浏览器）。
- 发布跑腿请求（含 `Deliver By` 可选的交付时间）。
- 浏览与筛选跑腿列表（按类型、取件点、送达点、状态）。
- 接单流程：接单者点击 `Accept` 并进入我的任务；支持标记已配送（Confirm Delivered）。
- 押金流程：发布者可为已接单项支付押金（调用 `/api/pay`，开发时可启动本地模拟支付服务）。
- 任务确认：发布者确认收到后释放押金（Confirm Received & Release Deposit）。
- 管理页：`My Tasks` 页面汇总发布和已接任务并提供相应操作。
- 日志与通知：支持本地事件日志（`mavsideLogs`）与页面右下角 toast 通知。
- 地图展示：预先下载的校园地图集合（`assets/maps/manifest.json`），delivery 页面内展示高分辨率 3D 透视图 PDF 预览。
- 同行者激励：完成 MavAccess 订单的同行者可获得爱心点，用于申请商家优惠券、校园咖啡券或记为志愿者时长并申请官方志愿者证书；现金奖励由商家抽成积累的爱心点资金池承担。

## 三、项目结构（重要文件）
- 视图（Pages）: `view/` 目录下的页面为真实视图：
  - `view/index.html`（登录/注册）
  - `view/dashboard.html`（仪表盘）
  - `view/delivery.html`（跑腿列表 + 3D 地图预览）
  - `view/add.html`（发布请求，含 `deliver-at` 字段）
  - `view/manage.html`（我的任务管理）
  - `view/account.html`（账户设置）

- 前端逻辑（assets/js/）:
  - `assets/js/main.js`：包含受保护路由、组件注入与导航高亮逻辑。
  - `assets/js/form.js`：登录/注册逻辑（本地用户表 `mavsideUsers`）。
  - `assets/js/add.js`：发布请求并写入 `mavsideDeliveryPosts`。
  - `assets/js/table.js`：渲染与筛选跑腿列表、接单逻辑（`acceptRequest`）。
  - `assets/js/manage.js`：我的任务页，包含押金支付、标记已配送、完成确认与取消发布。
  - `assets/js/logger.js`：`logEvent` / `getLogs` / `showToast`。
  - `assets/js/modal.js`：提供 
  
  `window.showConfirmModal(message, options)` 的非阻塞模态确认对话。
  - `assets/js/maps.js`：从 `assets/maps/manifest.json` 读取地图清单并渲染选择与 iframe 预览。

- 样式：
  - `style/theme.css`：主题令牌（颜色、半透明、logo 变量等）。
  - `style/view.css`：页面样式与组件样式（包含模态样式、toast 容器等）。

- 开发脚本与资源：
  - `development/payment-mock-server.mjs`：本地模拟支付服务（监听默认端口 3030，提供 `POST /api/pay`）。
  - `development/admin/download-campus-maps.mjs`：可选的地图爬取与缓存脚本（输出到 `assets/maps/mnsu/` 并生成 `manifest.json`）。
  - 地图清单：`assets/maps/manifest.json`（项目自带已生成清单）。

## 四、本地数据键与数据模型
- localStorage 关键键：
  - `mavsideUsers`（用户表）
  - `mavsideUserEmail`（当前登录邮箱）
  - `mavsideUserRole`（角色）
  - `mavsideDeliveryPosts`（跑腿请求数组）
  - `mavsideLogs`（事件日志）

- 跑腿请求（单条）常见字段示例：
  - `id`、`time`（创建日期）、`deliverAt`（Deliver By，datetime-local）、`type`、`content`
  - `pickupLocation`、`deliveryLocation`、`reward`、`state`（Open/Accepted/Completed）
  - `owner`、`acceptedBy`、`depositAmount`、`depositPaid`、`depositReleased`、`delivered`

## 五、运行与测试说明
- 启动静态站点（任意静态服务器或 VS Code Live Server）：打开 `view/index.html`。
  - 示例：在项目根目录可使用 Python 静态服务器：

```bash
# 在项目根目录运行（Python 3）
python -m http.server 8000
# 然后访问 http://localhost:8000/view/index.html
```

- 启动本地支付模拟服务（开发时用于 `/api/pay`）：

```bash
node development/payment-mock-server.mjs
# 默认监听 http://localhost:3030
```

- 注意：前端调用 `/api/pay` 时，如果未能连接到真实或本地服务，代码会回退到本地模拟支付逻辑（在 `manage.js` 内实现）。

## 六、已知设计决策与建议（可选项）
- 服务费策略：当前阶段服务费统一为 `0`（不收费），确认订单页仅展示 `Service Fee: $0.00`。
- 爱心点策略：爱心点不支持兑换现金余额，仅用于激励权益（优惠券/咖啡券/志愿时长）。
- 当前已实现行为：完成（Completed）和取消（Canceled）的任务会从活动列表中删除（不保留历史）。如需保留历史，建议把完成项写入新的归档键（例如 `mavsideDeliveryArchive`），并在 `confirmCompletion` 中改为移动而非删除。
- UI 一致性：已把关键确认从 `window.confirm` 替换为 `assets/js/modal.js`（`showConfirmModal`），但部分校验使用 `alert()`，可继续统一替换为模态或内联错误提示以改善 UX。
- 地图资源：仓库内包含大量已下载地图（`assets/maps/mnsu/`），注意版权与许可；仅在有授权时使用 `download-campus-maps.mjs` 批量缓存。

## 七、我做了什么（此文件由 AI 生成）
- 我已读取仓库主要文件并生成本说明，文件已保存为仓库根目录的 `PROJECT_DESCRIPTION.md`。

---

如果你希望把说明放到现有文件（例如将内容追加到 `page-notes.md` 或覆盖 `README.md` 的某一节），或者需要把说明翻成英文、拆分为多份页面级文档，请告诉我下一步偏好，我可以直接修改。