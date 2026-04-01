# PeerGo 页面说明（按页面维护）

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
3. 注册密码要求 8-20 位，且必须包含字母和数字。
4. 注册成功后自动切回登录面板。
5. 登录成功后跳转到仪表盘页面。

### 代码层说明（当前版本）

1. `form.js` 使用 `USER_STORAGE_KEY = peergoUsers` 存储用户表。
2. 用户数据结构为：`{ email: { password, createdAt } }`。
3. 当前为前端演示模式，登录校验在浏览器本地完成，不调用后端接口。
4. 登录成功会写入 `peergoUserEmail`，用于受保护页面访问控制。

### 数据说明

- localStorage 键：`peergoUsers`
- localStorage 键：`peergoUserEmail`

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

1. `table.js` 使用 `DELIVERY_STORAGE_KEY = peergoDeliveryPosts` 读写列表数据。
2. 每条请求包含唯一 `id`，用于事件委托时精确更新接单状态。
3. 页面初始化时会确保数据项具备 `id` 字段（兼容旧数据）。
4. 筛选逻辑由 `applyFilters()` 对当前数据数组进行多条件过滤后渲染。
5. `maps.js` 会优先读取 `assets/maps/manifest.json`，无清单时启用官方地图回退。

### 数据说明

- localStorage 键：`peergoDeliveryPosts`
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

- 写入 localStorage 键：`peergoDeliveryPosts`

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