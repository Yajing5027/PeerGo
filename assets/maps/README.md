# 校园地图资源目录

本目录用于存放校园地图下载结果。

- 地图文件输出：`assets/maps/mnsu/`
- 地图清单：`assets/maps/manifest.json`

## 生成方式

在项目根目录执行：

```bash
node development/admin/download-campus-maps.mjs
```

可选参数：

```bash
node development/admin/download-campus-maps.mjs <起始URL> <最大抓取页面数>
```

示例：

```bash
node development/admin/download-campus-maps.mjs https://mankato.mnsu.edu/about-the-university/maps-and-transportation/maps-and-directions/ 60
```
