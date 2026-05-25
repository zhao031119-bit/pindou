# 拼豆图纸助手微信小程序

这是根据 `拼豆微信小程序项目计划书.md` 搭建的微信小程序工程。

## 当前主链路

上传图片 -> 框选裁剪 -> 确认尺寸 -> 默认 MARD 家生成图纸 -> 结果页切换色卡 -> 保存长图 / 保存到我的作品

## 目录

- `pages/home`：首页工具入口
- `pages/upload`：上传与裁剪
- `pages/size`：尺寸确认与生成
- `pages/result`：图纸结果、色卡切换、长图保存
- `pages/pick`：色号识别
- `pages/extract`：图纸批量提取色号
- `pages/draw`：画豆图
- `pages/projects`：我的作品
- `pages/detail`：作品详情
- `miniprogram/utils`：色卡、颜色匹配、图纸数据、渲染、本地存储和媒体选择
- `miniprogram/data/palette-data.js`：部分国内色卡的静态 HEX/色号数据

## 本地校验

```bash
npm test
```

## 色卡数据

已通过 `npm run build:palettes` 接入公开色卡映射数据：

- MARD家
- 盼盼家
- 通用
- COCO
- 漫漫家
- 咪小窝
- 小舞家
- 黄豆豆

优肯197色、优肯418色目前保留完整数量结构，可替换为官方色卡数据。

微信端请使用微信开发者工具打开当前目录。
