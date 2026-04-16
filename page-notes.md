# MavSide 页面说明（按页面维护）

后续每完成一个页面或该页面新增一批功能，都在对应页面下新增一条说明。

## 维护规则

1. 以页面为单位写说明，不按时间流水账记录。
2. 每条说明至少包含：功能层说明 + 代码层说明。
3. 如果页面涉及本地存储，也要写明数据键名与字段。
4. 页面有新增功能时，在该页面下新增一个“版本说明”小节，不覆盖旧说明。

---

## 页面：登录/注册页

- 页面路径：`view/index.html`（旧 `index.html` 为兼容跳转）
- 对应脚本：`assets/js/form.js`、`assets/js/main.js`

### 版本说明（Apple 风格与目录重构）

1. 真实视图已迁移到 `view/index.html`，根目录 `index.html` 仅保留兼容跳转。
2. 页面不再直接写 logo 图片地址，改为使用主题令牌里的素材变量。
3. 登录/注册消息颜色从 JS 内联设置改为 `msg-success/msg-error` 样式类。

### 功能层说明（当前版本）

1. 支持登录与注册双面板切换。
2. 注册仅允许 `@mnsu.edu` 校园邮箱格式。

### 版本说明（2026-04-15 主页留白与标题节奏）

1. Dashboard 顶部问候区与下方内容之间增加了垂直留白，缓解首屏过于紧凑的问题。
2. 主页上的商家区与 Route Picks 区域保留统一的 See More 文案，视觉节奏更一致。
3. 注册密码要求 8-20 位，且必须包含字母和数字。
4. 注册成功后自动切回登录面板。
5. 登录成功后跳转到仪表盘页面。


### 版本说明（2026-04-15 账户页任务连线）

1. 账户页顶部 summary 三项已直接链接到 My Tasks 对应状态页，便于从个人页跳转查看任务。
2. 账户页新增订单列表区，用户在个人主页就能看到自己的订单记录。
3. My Activity 标题去掉了心形装饰，Account Settings 去掉了多余的 Logout 和底部 logo 行。

### 代码层说明（2026-04-15 账户页任务连线）

1. `assets/js/account-page.js` 的 `renderAll()` 现在会同时渲染订单、地址和支付方式。
2. summary 链接改成直接指向 `view/manage.html?status=...`，避免用户点击后没有明确去向。
3. Account Settings 只保留编辑资料、改密码、通知和联系客服四个操作入口。
### 代码层说明（当前版本）

1. `form.js` 使用 `USER_STORAGE_KEY = mavsideUsers` 存储用户表。
2. 用户数据结构为：`{ email: { password, createdAt } }`。
3. 当前为前端演示模式，登录校验在浏览器本地完成，不调用后端接口。
4. 登录成功会写入 `mavsideUserEmail`，用于受保护页面访问控制。

### 数据说明

- localStorage 键：`mavsideUsers`
- localStorage 键：`mavsideUserEmail`

---

## 页面：仪表盘

- 页面路径：`view/dashboard.html`（旧 `dashboard.html` 为兼容跳转）
- 对应脚本：`assets/js/main.js`

### 版本说明（Apple 风格与目录重构）

1. 真实视图已迁移到 `view/dashboard.html`，旧路径自动跳转。
2. 快捷入口链接统一改为 `view/` 路径。
3. 页面样式统一接入 `style/theme.css + style/view.css`。

### 功能层说明（当前版本）

1. 作为用户端入口页，提供“浏览跑腿请求”和“发布请求”两个主入口。
2. 未登录用户无法访问，会被重定向回登录页。

### 代码层说明（当前版本）

1. 仪表盘属于受保护页面，受 `main.js` 中 `protectedPaths` 管理。
2. 顶部导航和底部页脚通过 `data-include` 动态注入。

---

## 页面：跑腿列表页

- 页面路径：`view/delivery.html`（旧 `services/delivery.html` 为兼容跳转）
- 对应脚本：`assets/js/table.js`、`assets/js/main.js`

### 版本说明（Apple 风格与目录重构）

1. 真实视图已迁移到 `view/delivery.html`，`services/delivery.html` 保留跳转。
2. 去掉页面内联脚本，发布按钮跳转逻辑并入 `table.js`。
3. 表格视觉状态改为主题令牌驱动（Open/Accepted 状态色统一管理）。

### 版本说明（筛选可用性修复）

1. `table.js` 新增字段兼容归一化：可兼容旧字段命名（如 `status`、`pickup` 等）。
2. 筛选比较改为统一标准化后再比对，避免大小写、空格导致筛选失效。
3. 状态筛选兼容 `Open/Accepted` 与中文语义映射。
4. 下拉框切换时会立即触发筛选，不再必须手动点按钮。
5. 当没有匹配结果时，表格会显示空结果提示行。

### 版本说明（配送页小地图）

1. `view/delivery.html` 新增“校园小地图”区域，支持在配送页内快速预览地图。
2. 新增 `assets/js/maps.js`：读取 `assets/maps/manifest.json`，并将地图清单渲染为下拉选择。
3. 地图支持在 iframe 内切换预览，适合配送时快速查看楼宇分布与路线。
4. 新增“刷新地图清单”按钮，便于下载完新地图后即时加载。
5. 当本地清单不存在时，自动回退到学校官方在线校园总图。

### 功能层说明（当前版本）

1. 展示跑腿请求列表，支持按类型、取件点、送达点、状态筛选。
2. 支持“Accept”接单，接单后状态变为 `Accepted`。
3. 已接单项按钮禁用并显示为 `Accepted`。
4. 页面内可查看校园地图，减少配送时来回切换页面。

### 代码层说明（当前版本）

1. `table.js` 使用 `DELIVERY_STORAGE_KEY = mavsideDeliveryPosts` 读写列表数据。
2. 每条请求包含唯一 `id`，用于事件委托时精确更新接单状态。
3. 页面初始化时会确保数据项具备 `id` 字段（兼容旧数据）。
4. 筛选逻辑由 `applyFilters()` 对当前数据数组进行多条件过滤后渲染。
5. `maps.js` 会优先读取 `assets/maps/manifest.json`，无清单时启用官方地图回退。

### 数据说明

- localStorage 键：`mavsideDeliveryPosts`
- 单条字段：`id/time/type/content/pickupLocation/deliveryLocation/reward/state`
- 地图清单文件：`assets/maps/manifest.json`

---

## 页面：发布请求页

- 页面路径：`view/add.html`（旧 `add.html` 为兼容跳转）
- 对应脚本：`assets/js/add.js`、`assets/js/main.js`

### 版本说明（Apple 风格与目录重构）

1. 真实视图已迁移到 `view/add.html`，旧路径仅作兼容跳转。
2. 自定义地点输入从 `style.display` 改为 `hidden` 控制，去掉内联样式依赖。
3. 取消与提交跳转统一改为 `view/delivery.html`。

### 功能层说明（当前版本）

1. 支持发布跑腿请求。
2. 取件点和送达点支持 `Other` 自定义输入。
3. 奖励金额自动标准化为 `$` 前缀。
4. 提交后写入本地数据并跳转回跑腿列表页。

### 代码层说明（当前版本）

1. 新增请求时会自动生成唯一 `id`。
2. 日期字段使用当天日期字符串。
3. `content` 文本包含 `print` 时类型自动归类为 `Printing`，否则为 `Delivery`。

### 数据说明

- 写入 localStorage 键：`mavsideDeliveryPosts`

---

## 页面：公共导航与页脚

- 组件路径：`components/navbar.html`、`components/footer.html`
- 对应脚本：`assets/js/main.js`

### 版本说明（Apple 风格与目录重构）

1. 导航链接已全部切换至 `view/` 目录。
2. 导航 logo 从 `<img src>` 改为主题变量驱动的 `.nav-logo`。
3. 激活态仍由 `main.js` 的 `active-link` 类控制。

### 功能层说明（当前版本）

1. 导航提供 Dashboard / Errands / Post / Logout。
2. 当前所在页面会高亮激活链接。
3. 点击 Logout 会清除登录态并返回登录页。

### 代码层说明（当前版本）

1. `main.js` 在 `DOMContentLoaded` 后加载组件并绑定事件。
2. 激活态通过 `active-link` 类切换，不使用内联样式。

---

## 新增说明模板（以后按这个追加）

### 页面：页面名称

- 页面路径：
- 对应脚本：

#### 功能层说明（版本名）

1. 
2. 

#### 代码层说明（版本名）

1. 
2. 

#### 数据说明（如有）

- localStorage 键：
- 字段：

---

## 页面：商家列表与菜单页

- 页面路径：`view/shops.html`、`view/shop.html`
- 对应脚本：`assets/js/shops-fixed-data.js`、`assets/js/shops.js`

### 版本说明（四品牌官网菜单样例接入）

1. 固定数据源从旧随机假图升级为 4 家品牌样例：Taco Bell、Starbucks、Chick-fil-A、Einstein Bros. Bagels。
2. 每家统一为 3 个分类、每分类 5 个菜品，结构可直接被 `shops.js` 解析。
3. 所有门店地址统一为 `7 Centennial Student Union, Mankato, MN 56001`。
4. 新增 raw -> model 映射层（`toShopModel`），将抓取样例转换为页面标准字段。
5. `shops.js` 的数据版本从 `v3` 升到 `v4`，确保本地缓存自动更新为新数据。

### 功能层说明（当前版本）

1. 商家卡片展示品牌 logo、简介、统一地址和菜品首图。
2. 点击商家进入菜单页后，按分类切换展示 5 条菜单项并支持加入购物车。
3. 通过固定数据文件可离线演示“商家列表 -> 菜单 -> 加购”流程。

### 代码层说明（当前版本）

1. `assets/js/shops-fixed-data.js` 新增 `CRAWLED_SHOPS_RAW` 作为抓取样例原始结构。
2. `toShopModel(rawShop)` 统一生成 `id/name/tagline/logoUrl/address/heroImages/categories`。
3. 菜品 `id` 在映射阶段按 `shop-category-index` 规则自动生成，避免重复。
4. `heroImages` 不再手填，改为从前三个菜品图自动抽取。

### 数据说明

- localStorage 键：`mavsideShops`
- 版本键：`mavsideShopsVersion`
- 版本号：`v4`

### 版本说明（shopdata 文件化 + logo 提升）

1. 新增 `assets/js/shopdata.js`，将“抓取后最终使用的原始菜单数据”集中存放。
2. `assets/js/shops-fixed-data.js` 改为纯 mapper，不再内置大段原始数据。
3. 页面脚本加载顺序调整为 `shopdata.js -> shops-fixed-data.js -> shops.js`。
4. 品牌 logo 改为本地文件映射：`assets/images/brands/*`，减少远程失效和清晰度不一致问题。

---

## 页面：确认订单页 / 订单追踪页

- 页面路径：`view/order-confirm.html`、`view/order-tracking.html`
- 对应脚本：`assets/js/order-confirm.js`、`assets/js/orders.js`、`assets/js/order-tracking.js`

### 版本说明（服务费归零与激励模型调整）

1. Confirm Order 页面服务费统一展示为 `0`，并在下单参数中固定写入 `serviceFee: 0`。
2. 残障学生辅助场景的爱心点提示改为 `Need 1 point`，并要求 MavAccess 验证后可启用辅助支持。
3. 账户页的 Heart Points 兑换从“现金兑换”切换为“激励权益申请”（商家优惠券/校园咖啡券/志愿时长）。
4. 爱心点不再增加钱包余额；改为写入激励申请记录键 `mavsideHeartRewardRequests` 并扣减对应点数。
5. MavAccess 卡片文案更新为同行者激励与资金池说明：公益单现金奖励由商家抽成积累的爱心点资金池承担。

### 版本说明（角色化验证码与残障者认证文案修正）

1. `Order Tracking` 按角色渲染验证码区域：Poster 仅显示自己的交付码（只读展示），不再显示 merchant pickup 区块。
2. Poster 视角不再暴露 `Poster delivery code: xxxx` 纯文本，改为四位格只读展示，便于直接给 Bringer 出示。
3. Bringer 视角保留 Merchant Pickup 与 Poster Delivery 两个验证区，并在缺码时给出缺失提示。
4. Account 页 MavAccess 文案改为残障者机制：通过认证后每月发放 30 次爱心点额度，每次辅助订单仅消耗 1 点。
5. `Use Heart Points for Incentive Rewards` 模态新增同行者激励与资金池说明，并移除“现金兑换不支持”句子。
6. Incentive Rewards 模态移除 `Reward Type` 下拉，改为“点数 + 申请备注”提交模型。

### 版本说明（大厅接单与 My Tasks 联动修复）

1. 修复“大厅 Accept 后 My Tasks 不出现”问题：接单时会同步认领真实订单数据（`mavsideOrders` 的 `assignedTo/status`）。
2. 配送大厅未加载 `orders.js` 的场景下，新增本地兜底认领逻辑，保证接单写入不丢失。
3. 接单成功后立即跳转详情：订单任务跳 `order-tracking`（含验证码输入区），普通跑腿跳 `errand-detail`。
4. My Tasks 去重：订单镜像跑腿（`sourceType=order`）不再重复渲染，避免同一订单出现两行。

### 版本说明（同账号双角色订单拆分）

1. 同一账号同时是 poster 与 bringer 时，My Tasks 对同一订单拆分为两条记录（按角色各一条）。
2. 订单详情页新增 `role` 查询参数驱动，页面下半部分验证码区按 `poster/bringer` 角色渲染。
3. 从大厅 Accept 进入订单详情时固定带 `role=bringer`，避免同账号场景误落到 poster 视图。
4. 角色化拆分保持单页组件复用：上半部分订单信息通用，底部验证区按角色切换。

### 版本说明（订单验证区组件化 + Task Overview UI 重排）

1. `order-tracking` 下半区明确拆分为两个独立渲染函数：`renderPosterVerifyBlock` 与 `renderBringerVerifyBlock`，便于后续迭代。
2. 验证区继续复用统一输入单元渲染函数，poster/bringer 仅在块级组件中切换业务文案和按钮行为。
3. `Delivery Detail` 的 `Task Overview` 改为卡片式网格布局，字段分块显示（ID/Type/Pickup/Delivery/Status/Reward/Poster）。
4. 新增通用样式类 `detail-overview-grid/detail-overview-item`，移动端自动退化为单列，提升可读性。

### 版本说明（Request Tracking 统一入口）

1. 将 `Order Tracking` 与 `Delivery Detail` 合并为统一调用链路，页面统一命名为 `Request Tracking`。
2. 所有 My Tasks 详情入口统一跳转到 `view/order-tracking.html`，通过 `kind=order|errand` + `role=poster|bringer` 驱动差异化组件。
3. Poster 统一只显示送达码只读块；Bringer 统一显示送达码验证块，且仅在 `order` 类型时额外显示商家码验证块。
4. 普通跑腿（errand）接单后也进入统一 tracking 页，并支持送达码校验与状态联动更新（Completed）。

### 代码层说明（实现要点）

1. `assets/js/order-confirm.js`：`SERVICE_FEE` 常量改为 `0`，原“服务费抵扣”逻辑重构为“1 点辅助支持”逻辑。
2. `assets/js/order-confirm.js`：提交订单时新增 `usedHeartPointsForAccessSupport` 字段，替代旧抵扣标记。
3. `view/account.html`：Redeem 模态改为 Incentive Rewards 申请表单，移除现金兑换文案。
4. `assets/js/account-page.js`：Heart redeem 提交逻辑由钱包加余额改为写入激励申请并仅扣点。

### 版本说明（服务费抵扣与状态显示修正）

1. 确认订单页新增英文版支付摘要卡：商品明细、金额、服务费、爱心点抵扣服务费勾选与实付金额展示。
2. 勾选服务费抵扣时，要求用户已完成 MavAccess 认证且爱心点不少于 5；成功时按 5 点抵扣 $1 服务费。
3. Account 页 Redeem 比例从 10 点改为 5 点兑换 $1 钱包余额，并同步更新前端校验与计算逻辑。
4. Volunteer Certificate 弹窗新增英文换算提示：`1 point = 0.2h volunteer time`。
5. Account/My Tasks 的三状态组件修复 `0` 显示问题，确保数量为 0 时仍展示为 `0`。
6. Delivery Detail 删除无关说明文案，Actions 区修复并显示可复用进度轴。

### 代码层说明（实现要点）

1. `assets/js/status-summary-component.js` 修复文本转义函数对数值 `0` 的处理，避免被误转为空字符串。
2. `assets/js/errand-detail.js` 改为调用 `TaskProgress.renderAxis(...)`，与 `task-progress.js` 的导出 API 保持一致。
3. `view/order-confirm.html` 引入 `account.js` 并将提交按钮统一为 `Confirm Payment`。
4. `assets/js/order-confirm.js` 新增服务费常量、抵扣校验、实付金额动态刷新、提交时扣点与订单扩展字段写入。
5. `view/account.html` + `assets/js/account-page.js` 同步更新 Redeem 输入规则与兑换比例（`min/step` 与业务逻辑一致）。

---

## 页面批次：账户页 / My Tasks / Delivery Detail / 文案统一

- 涉及页面：`view/account.html`、`view/manage.html`、`view/errand-detail.html`、`view/dashboard.html`、`view/add.html`、`view/delivery.html`
- 对应脚本：`assets/js/account-page.js`、`assets/js/manage.js`、`assets/js/errand-detail.js`、`assets/js/status-summary-component.js`、`assets/js/task-progress.js`、`assets/js/dashboard-components.js`

### 功能层说明（状态联动与文案修正）

1. Account 页彻底移除 My Orders 区块，仅保留与任务相关的三状态入口。
2. Account 与 My Tasks 顶部 In Progress / Completed / Cancelled 改为同一可复用组件渲染，视觉与交互保持一致。
3. My Tasks 筛选区改为单行紧凑布局，顺序固定为 Role 在前、Type 在后。
4. Delivery Detail 的 Actions 区新增任务状态进度轴，随状态变化同步显示。
5. 页面文案按产品要求统一：Dashboard slogan、Dashboard 问候语分行、Add 副标题、Errand Hall 副标题。

### 代码层说明（实现要点）

1. 新增 `status-summary-component.js`，统一输出三状态卡片，支持 `link` 与 `tab` 两种模式，分别用于 Account 与 My Tasks。
2. `account-page.js` 的 summary 渲染改为调用复用组件，且移除订单列表渲染逻辑，避免页面信息源分叉。
3. `manage.js` 改为在 `#manage-status-summary` 容器中渲染复用组件，并通过事件委托处理状态切换。
4. `errand-detail.js` 接入 `TaskProgress.render(..., { compact: true })`，并监听 `storage` 与 `mavside:ordersUpdated` 事件刷新进度轴。
5. `view.css` 增加状态卡片与筛选单行布局样式，保障桌面与窄屏下的可读性与可操作性。

### 数据说明

- 任务与订单状态刷新来源：`mavside:ordersUpdated` 事件 + localStorage 变更监听。
- 跑腿详情读取键：`mavsideDeliveryPosts`。

### 版本说明（双 Note 字段）

1. 确认订单页新增两个备注字段：`Note for Merchant` 与 `Note for Bringer`（表单 id 仍为 `order-merchant-note` / `order-courier-note`）。
2. 下单时分别写入订单对象：`merchantNote`、`courierNote`。
3. 保留兼容字段 `note`（默认同步为 `courierNote`），避免旧逻辑报错。
4. 追踪页与管理页订单卡片均可查看双 Note。

### 代码层说明（当前版本）

1. `order-confirm.js` 新增 `order-merchant-note` 和 `order-courier-note` 两个表单组件并提交
2. `orders.js` 的 `createOrder` 新增双备注字段落库。
3. `errands-model.js` 的订单映射优先取 `courierNote` 进入跑腿大厅详情。

### 数据说明

- 订单字段：`merchantNote`（给商家）
- 订单字段：`courierNote`（给送货人）

---

## 页面：账户页 / 我的任务 / 状态通知

- 页面路径：`view/account.html`、`view/manage.html`、`view/order-tracking.html`、`view/delivery.html`
- 对应脚本：`assets/js/account-page.js`、`assets/js/manage-orders.js`、`assets/js/task-progress.js`、`assets/js/notification-center.js`、`assets/js/orders.js`

### 版本说明（2026-04-15 联动与可复用组件）

1. Account 顶部三状态计数改为与 My Tasks 共享同一套 TaskListComponent 统计逻辑，避免两页数量不一致。
2. My Tasks 的 Role/Type 筛选顺序调整为横向先 Role 再 Type。
3. 新增可复用进度轴组件 `task-progress.js`，用于任务状态展示（待接单 -> 已接单 -> 已取货 -> 已完成，取消走取消标签）。
4. 新增通知中心 `notification-center.js`，将接单、取货、完成、取消、大厅接单等通知收敛到可配置事件模板。
5. Account 通知弹窗改为可配置组件（in-app/email + 事件开关 + 最近通知列表），不再写死单一开关。

### 功能层说明（2026-04-15 Account 可点击修复）

1. Address / Payment / MavAccess / Heart Redeem / Volunteer Certificate 全部改为可点击并弹出悬浮框。
2. 心值区域新增“兑换”和“志愿者证书申请”两个按钮，均在当前页弹窗完成。
3. 修复 Payment Modal 错误嵌套导致的整页按钮失效问题。

---

## 页面：Account 个人中心

- 页面路径：`view/account.html`
- 对应脚本：`assets/js/account.js`、`assets/js/account-page.js`、`assets/js/form-components.js`

### 版本说明（紧凑化 + 弹窗化 + 组件复用）

1. Account 页面改为紧凑布局，去掉大面积常驻表单，改成折叠区与弹窗编辑。
2. 个人头部信息顺序调整为：头像、姓名、邮箱、角色；增加头像上传与本地持久化。
3. MavAccess 通过后在姓名右侧显示紫色爱心标记。
4. Wallet 操作扩展为三项：`History`、`Top Up`、`Withdraw`，并支持记录明细。
5. Heart Points 默认值改为 `30`（首次读取无数据时自动使用）。
6. Address 新增/编辑弹窗改为复用 location 组件，不再手写纯文本地址输入。
7. Orders / Saved Addresses / Payment Methods 改为折叠查看，降低页面信息密度。

### 代码层说明（当前版本）

1. `account.js` 升级为账户数据层，补充每用户维度读写：钱包、地址、支付方式、MavAccess、通知偏好。
2. 钱包新增 `topupWallet`、`withdrawWallet`、`history` 记录能力，操作结果统一返回 `{ ok, reason }`。
3. `account-page.js` 负责页面渲染与交互绑定：弹窗开关、表单校验、订单跳转、地址 CRUD、登出。
4. `form-components.js` 新增已保存地址选择能力：location 组件可启用「Use saved address」复选框与下拉。

### 数据说明

- localStorage 键：`mavsideWallet`（按用户分桶，字段：`balance`、`heartPoints`、`history`）
- localStorage 键：`mavsideAddresses`（按用户分桶）
- localStorage 键：`mavsidePaymentMethods`（按用户分桶）
- localStorage 键：`mavsideMavAccess`（按用户分桶）
- localStorage 键：`mavsideAccountNotifications`（按用户分桶）

---

## 页面：发布请求页 / 确认订单页（地址复用增强）

- 页面路径：`view/add.html`、`view/order-confirm.html`
- 对应脚本：`assets/js/add.js`、`assets/js/order-confirm.js`、`assets/js/form-components.js`

### 版本说明（Use Saved Address）

1. Pickup / Delivery 位置字段支持「Use saved address」复选框。
2. 勾选后可从已保存地址下拉选择，组件自动回填并锁定 location 输入。
3. 取值逻辑统一走 `FormComponents.readLocationValue()`，避免各页面重复拼接逻辑。

### 代码层说明（当前版本）

1. `add.js` 中 pickup 与 delivery 均启用 `enableSavedAddressSelect` 并初始化 `initSavedAddressPicker`。
2. `order-confirm.js` 的 delivery 字段同样启用保存地址选择。

---

## 页面：跑腿大厅 / My Tasks / 订单追踪

- 页面路径：`view/delivery.html`、`view/manage.html`、`view/order-tracking.html`
- 对应脚本：`assets/js/table.js`、`assets/js/errands-model.js`、`assets/js/manage.js`、`assets/js/manage-orders.js`、`assets/js/orders.js`、`assets/js/order-tracking.js`

### 版本说明（隐私与流程修复）

1. 跑腿大厅接单后不再自动跳详情；按钮仅从 `Accept` 变为 `Accepted` 并禁用。
2. 大厅行操作去掉 `View` 入口，降低非相关用户看到详情的概率。
3. My Tasks 的 accepted 场景只保留查看入口，不再在卡片上直接出现送达确认动作。
4. 订单追踪页新增两行统一验证码组件：`Merchant Pickup Code` 与 `Poster Delivery Code`。
5. 两个验证码组件均为 4 位数字格输入，含数字校验与验证按钮。
6. 商家取货码生成规则改为 4 位数字，和页面组件保持一致。

### 代码层说明（当前版本）

1. `errands-model.js` 的表格行渲染统一为 `Accept/Accepted/Done`，并使用禁用态控制。
2. `table.js` 删除接单后跳详情与 view 按钮事件分支。
3. `manage.js` 移除 accepted 卡片上的 `Confirm Delivered` 直接动作。
4. `manage-orders.js` 收敛 accepted order 卡片操作到 `View`。
5. `order-tracking.js` 新增 4 位码输入格的自动跳格、回退、数字校验与验证调用。

---

## 页面：公共导航 / 跑腿大厅布局

- 页面路径：`components/navbar.html`、`view/delivery.html`
- 对应脚本：`assets/js/main.js`、`style/view.css`

### 版本说明（导航重构 + 左图右列表）

1. 导航改为：Logo（回主页）+ Pickup/Delivery 下拉 + 通知弹层 + 头像菜单。
2. 去掉旧的 Dashboard 纯文字入口；功能链接收敛到头像菜单弹层。
3. 通知改为弹层展示，不新增独立通知页面。
4. 跑腿大厅改为左侧地图、右侧筛选与列表，地图区域占比缩小并支持外链放大。

### 代码层说明（当前版本）

1. `main.js` 新增导航下拉初始化（校园地点列表 + 本地记忆 pickup/delivery）。
2. `main.js` 新增通知/头像弹层开关逻辑。
3. `view.css` 新增导航路由区、图标按钮、弹层样式与响应式规则。
4. `delivery.html` 新增双栏布局容器并保留原筛选 id/table id，确保 `table.js` 兼容。
- 兼容字段：`note`（镜像 `courierNote`）

---

## 页面：配送页地图

- 页面路径：`view/delivery.html`
- 对应脚本：`assets/js/maps.js`

### 版本说明（地图资源清理）

1. 地图目录仅保留 `Campus 3D Perspective Map` 文件。
2. `assets/maps/manifest.json` 仅保留单条地图记录，页面下拉仅显示这一个地图。

---

## 页面：Account / Navbar / Tasks / Dashboard（修正版）

- 页面路径：`view/account.html`、`components/navbar.html`、`view/manage.html`、`view/dashboard.html`
- 对应脚本：`assets/js/account-page.js`、`assets/js/main.js`、`assets/js/manage.js`、`assets/js/manage-orders.js`、`assets/js/dashboard-components.js`

### 版本说明（本轮重点修正）

1. Account 页将 `Heart Points (Ai Xin Zhi)` 改回纯英文 `Heart Points`。
2. MavAccess 状态块改为上方常驻展开展示：`MavAccess Verification Status`、`Not Verified/Verified`、`Apply Verification`。
3. 顶部操作移除 `Contact Support`，并将 `Contact Support + Logo` 放入 `Account Settings` 区。
4. My Activity 移除 `Orders` 折叠块，保留地址与支付；统计卡改为可点击并跳转 `My Tasks` 对应状态。
5. Payment Methods 增加 `Add Payment Method` 按钮与弹窗表单（类型 + 4 位尾号）。
6. Navbar 通知按钮从字母 `N` 改为铃铛图标；头像改为直接跳转 `Account`，移除个人菜单下拉。
7. Delivery Hall 地图缩成左侧小正方形卡片，保留 `Expand Map` 操作。
8. My Tasks 从 `posted/accepted` 重构为 `In Progress / Completed / Cancelled` 三状态统一视图，并增加类型过滤。
9. 订单追踪页新增 `Back to My Tasks`；配送详情页返回支持从 `manage` 回到任务页，避免错误返回大厅。
10. Dashboard 重构为：问候区 + 双主入口卡片 + 横向可滑商家条 + 路线任务列表，不再重复顶部导航信息。

### 代码层说明（当前版本）

1. `manage-orders.js` 重写为 `TaskListComponent`，统一聚合 Order/Errand 数据并输出可复用行结构。
2. `manage.js` 仅负责状态切换、过滤、计数与渲染编排，降低页面耦合。
3. `order-tracking.js` 支持非订单场景下禁用商家码输入（通过 `kind` 参数识别）。
4. `errand-detail.js` 新增 `from=manage` 返回目标识别逻辑。

---

## 页面：Account / My Tasks / Dashboard（二次修正）

- 页面路径：`view/account.html`、`view/manage.html`、`view/dashboard.html`
- 对应脚本：`assets/js/account-page.js`、`assets/js/manage.js`、`assets/js/manage-orders.js`、`assets/js/dashboard-components.js`

### 本轮修正点

1. Account 页重新调整为四段顺序：头像/余额/心值/统计卡片、My Activity、MavAccess 独立卡、Account Settings。
2. 顶部 Logout 删除，仅保留 Account Settings 内部 Logout。
3. `My Activity`、`Heart Points`、`MavAccess Verification Status` 标题增加爱心符号强调。
4. My Tasks 增加 `Type` 与 `Role` 两级过滤，支持 `order/errand` 和 `poster/bringer` 的统一列表筛选。
5. Dashboard 去掉黄色 hero 背景，商家卡不再显示 on-route 文案，Route Picks 里保留紫色高亮的 `On route`。
6. 商家列表与路线列表都统一使用 `See More` 文案。

---

## 页面：Task Hall / Post Task / Tracking / Account（本轮重构）

- 页面路径：`view/delivery.html`、`view/add.html`、`view/order-tracking.html`、`view/account.html`
- 对应脚本：`assets/js/table.js`、`assets/js/add.js`、`assets/js/orders.js`、`assets/js/order-tracking.js`、`assets/js/account-page.js`、`assets/js/main.js`

### 版本说明（本轮重点）

1. `Errand Hall` / `Post Request` 相关前台文案统一改为 `Task Hall` / `Post Task`。
2. 任务大厅标语改为标题下方单行居中显示，移除单独白色介绍区块。
3. 取消全局大号 `Back` 自动注入，发布页改为标题左侧小方块箭头返回按钮。
4. 任务大厅新增排序器：`Published Time`、`Reward`、`Route Match`、`Deliver By`，并支持 `Ascending/Descending`。
5. 任务大厅新增 `Route Match` 列（百分比），并把 `Completed` 任务固定沉到底部显示。
6. 发布页新增 MavAccess 辅助支持复选框：勾选后 Reward 输入框置灰并显示爱心值，提交时按 1 点扣减。
7. 无障碍爱心任务在送达成功后会给配送方增加 1 点（MavPoint），并写入 wallet history。
8. Account 心值数字显示改为 `❤ + 数字`（例如 `❤ 29`）。

### 代码层说明（当前版本）

1. `table.js` 新增 `calcRouteMatch()` 和 `sortItems()`；过滤后统一走排序再渲染。
2. `table.js` 表格列扩展为 10 列并加入 `Route Match`，空表 `colspan` 同步修正。
3. `add.js` 新增 `bindSupportMode()`，实现发布页的辅助支持扣点与 reward heart token 提交。
4. `orders.js` 在 `verifyDeliveryCode()` 内增加 heart 任务送达奖励逻辑（+1 MavPoint）。
5. `order-tracking.js` 在普通 task 送达校验成功后增加 +1 MavPoint 逻辑，并防止重复送达重复加点。
6. `main.js` 保留时间格式工具（美式时间），移除 `injectGlobalBackButton()` 入口调用。

---

## 页面：Confirm Order / Hall / Account / Tracking（本轮补丁）

### 版本说明（本轮补充）

1. Confirm Order 和 Post Task 统一改为共用的 support-task 组件，文案统一为 `Use 1 MavPoint to support this task (requires MavAccess verification)`，去掉了原来不礼貌的无障碍描述。
2. Post Task 页面删除标题左侧返回按钮，避免页面头部过重；确认页继续保留原有购物返回按钮。
3. 任务大厅的 `Route Match` 改成稳定的假百分比数据，避免整页都是 `0%`。
4. 大厅排序新增 `MavPoint` 选项，用于按心值/奖励优先级排序。
5. 奖励显示统一为爱心图标或两位小数金额，避免出现 `0$` 这类异常展示。
6. 商家订单在任务列表中的标题改为商家名称，不再显示订单号。
7. 订单/普通任务的完成奖励统一进入账户：爱心任务加 1 个 MavPoint，金额任务加到 balance。
8. 订单类型不再显示手动 `Picked Up` 按钮，取货必须先过 merchant code；普通 task 仍保留按钮式取货流程。
9. MavAccess 验证现在只允许预置的测试账号通过，避免所有用户都能直接验证成功。
10. 导航栏通知铃铛去掉了紫色底框，仅保留图标按钮样式。

### 代码层说明（当前版本）

1. `form-components.js` 新增 `renderSupportField()` 和 `bindSupportMode()`，供确认页和发布页复用。
2. `order-confirm.js` 改为用同一套 support-task 组件渲染辅助支持选项。
3. `table.js` 新增 `calcMavPointValue()`，并把 `calcRouteMatch()` 改成非零伪随机值。
4. `orders.js` / `order-tracking.js` 都加入了完成奖励入账：heart -> heartPoints，数字 reward -> balance。
5. `manage-orders.js` 的订单标题改用商家名，减少列表里的订单号噪音。
6. `account-page.js` 的 MavAccess 校验限制为预置测试账号，失败时只给通用错误提示。
7. `style/view.css` 清掉了通知按钮的默认紫色背景与边框。
