# v0 工作台说明

这个仓库包含两个部分：

- `v0-app/`：给 v0 修改 UI 用的 React 工作台。
- `pages/`、`miniprogram/`、`components/`：真实微信小程序源码。

v0 优先修改 `v0-app/src/pages` 和 `v0-app/src/components`。不要把微信小程序业务逻辑改成 Web 逻辑，也不要删除 `pages/`、`miniprogram/`、`app.json`、`project.config.json`。

## 页面映射

| v0 文件 | 微信小程序文件 |
| --- | --- |
| `v0-app/src/pages/Home.jsx` | `pages/home/home.wxml`、`pages/home/home.wxss` |
| `v0-app/src/pages/Upload.jsx` | `pages/upload/upload.wxml`、`pages/upload/upload.wxss` |
| `v0-app/src/pages/Size.jsx` | `pages/size/size.wxml`、`pages/size/size.wxss` |
| `v0-app/src/pages/Result.jsx` | `pages/result/result.wxml`、`pages/result/result.wxss` |
| `v0-app/src/pages/Pick.jsx` | `pages/pick/pick.wxml`、`pages/pick/pick.wxss` |
| `v0-app/src/pages/Extract.jsx` | `pages/extract/extract.wxml`、`pages/extract/extract.wxss` |
| `v0-app/src/pages/Draw.jsx` | `pages/draw/draw.wxml`、`pages/draw/draw.wxss` |
| `v0-app/src/pages/Projects.jsx` | `pages/projects/projects.wxml`、`pages/projects/projects.wxss` |
| `v0-app/src/pages/Detail.jsx` | `pages/detail/detail.wxml`、`pages/detail/detail.wxss` |

## 数据与逻辑边界

- 色卡、渲染、图纸生成、裁剪、保存、画豆图性能逻辑在 `miniprogram/utils`。
- v0 工作台使用 `v0-app/src/data` 里的模拟数据展示 UI。
- 品牌 logo 和像素插画复用 `miniprogram/assets`，不要改成文字缩写。
- UI 定稿后，需要人工把 React 结构迁回对应的小程序 `wxml/wxss/js`。

## 运行

```bash
npm install
npm run dev
```

构建预览：

```bash
npm run build
```
