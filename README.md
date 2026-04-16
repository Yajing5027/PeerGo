# MavSide 前端版（校园跑腿）

当前项目是前端演示版，已完成目录重构：

- `view/`：所有页面视图
- `style/theme.css`：主题令牌（颜色、阴影、素材地址）
- `style/view.css`：视图样式（只消费主题令牌）

## 启动方式

使用任意静态服务器（推荐 VS Code Live Server）。

1. 在 VS Code 打开项目。
2. 从 `view/index.html` 启动 Live Server。
3. 浏览器访问本地地址。

旧路径页面（根目录和 `services/`）已做兼容跳转，会自动导向 `view/` 新页面。

## 目录说明

### 视图层

- `view/index.html`：登录/注册
- `view/dashboard.html`：仪表盘
- `view/delivery.html`：跑腿列表
- `view/add.html`：发布请求

### 样式层

- `style/theme.css`：品牌主题令牌与素材入口（包括 logo 变量）
- `style/view.css`：页面与组件样式（无页面硬编码颜色与素材引用）

### 逻辑层

- `assets/js/main.js`：受保护路由、组件注入、导航高亮、退出登录
- `assets/js/form.js`：登录注册逻辑（本地存储）
- `assets/js/table.js`：列表渲染、筛选、接单
- `assets/js/add.js`：发布请求
- `assets/js/maps.js`：配送页小地图加载与预览

### 地图下载脚本

- 脚本路径：`development/admin/download-campus-maps.mjs`
- 输出目录：`assets/maps/mnsu/`
- 输出清单：`assets/maps/manifest.json`

在项目根目录执行：

```bash
node development/admin/download-campus-maps.mjs
```

可选参数：

```bash
node development/admin/download-campus-maps.mjs <起始URL> <最大抓取页面数>
```

建议：仅在获得学校地图资源使用许可的前提下执行下载与缓存。

## 模拟支付服务器（开发/测试用）

项目内包含一个简单的本地模拟支付服务器，便于前端开发对接支付流程。该服务器仅用于本地开发，不进行真实金流。

- 脚本路径：`development/payment-mock-server.mjs`
- 启动：在项目根目录运行：

```bash
node development/payment-mock-server.mjs
```

- 服务器会监听默认 `http://localhost:3030`，并提供接口 `POST /api/pay`，返回 `{ success: true, transactionId }` 用于前端模拟支付结果。

前端会在调用支付失败时回退到本地模拟支付逻辑。


### 配送页地图展示

- 页面：`view/delivery.html`
- 功能：地图下拉切换、iframe 预览、刷新本地清单、跳转学校官方地图页。
- 行为：当本地 `manifest.json` 不存在时，会自动回退到官方在线校园总图。

## 当前数据存储

- 用户表：`localStorage.mavsideUsers`
- 登录态：`localStorage.mavsideUserEmail`
- 跑腿数据：`localStorage.mavsideDeliveryPosts`

说明：当前仍为前端本地存储模式，后续可切换为数据库 + API。
