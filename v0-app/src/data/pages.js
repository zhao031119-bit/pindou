export const pageRegistry = [
  {
    id: 'home',
    label: '首页',
    title: '拼豆星球',
    subtitle: '功能入口与作品草稿',
    miniapp: 'pages/home/home'
  },
  {
    id: 'upload',
    label: '上传',
    title: '裁剪图片',
    subtitle: '拖动、缩放、确认主体',
    miniapp: 'pages/upload/upload'
  },
  {
    id: 'size',
    label: '尺寸',
    title: '图纸尺寸',
    subtitle: '自定义宽高与智能建议',
    miniapp: 'pages/size/size'
  },
  {
    id: 'result',
    label: '图纸',
    title: '生成图纸',
    subtitle: '预览、色卡与保存',
    miniapp: 'pages/result/result'
  },
  {
    id: 'pick',
    label: '识色',
    title: '识别色号',
    subtitle: '取样点、放大镜、品牌色卡',
    miniapp: 'pages/pick/pick'
  },
  {
    id: 'extract',
    label: '提取',
    title: '提取色号',
    subtitle: '批量提取用豆清单',
    miniapp: 'pages/extract/extract'
  },
  {
    id: 'draw',
    label: '画图',
    title: '画豆图',
    subtitle: '低延迟像素网格编辑',
    miniapp: 'pages/draw/draw'
  },
  {
    id: 'projects',
    label: '作品',
    title: '我的作品',
    subtitle: '本地作品列表',
    miniapp: 'pages/projects/projects'
  },
  {
    id: 'detail',
    label: '详情',
    title: '作品详情',
    subtitle: '图纸、用豆和导出',
    miniapp: 'pages/detail/detail'
  }
];

export const homeCards = [
  {
    id: 'upload',
    title: '生成图纸',
    subtitle: '照片转拼豆像素图',
    image: '/miniprogram/assets/home/card-generate.png',
    tone: 'clay',
    size: 'hero'
  },
  {
    id: 'pick',
    title: '识别色号',
    subtitle: '点击图片找相近豆色',
    image: '/miniprogram/assets/home/card-pick.png',
    tone: 'mint',
    size: 'square'
  },
  {
    id: 'extract',
    title: '提取色号',
    subtitle: '批量整理用豆清单',
    image: '/miniprogram/assets/home/card-extract.png',
    tone: 'butter',
    size: 'square'
  },
  {
    id: 'draw',
    title: '画豆图',
    subtitle: '自由创作像素图纸',
    image: '/miniprogram/assets/home/card-draw.png',
    tone: 'berry',
    size: 'wide'
  }
];
