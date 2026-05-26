const HOME_PATH = '/pages/home/home';
const DEFAULT_TITLE = '拼豆星球 - 从照片自动生成拼豆图纸';

const PAGE_TITLES = {
  home: DEFAULT_TITLE,
  upload: '上传照片，生成拼豆图纸',
  size: '选择尺寸，生成拼豆图纸',
  pick: '识别拼豆色号，快速匹配品牌色卡',
  extract: '从图纸提取色号和用豆清单',
  draw: '画豆图，自己设计拼豆图纸',
  projects: '我的拼豆作品',
  detail: '我做的拼豆图纸',
  result: '我做的拼豆图纸'
};

function makeOptions(page, overrides) {
  return Object.assign({
    title: PAGE_TITLES[page] || DEFAULT_TITLE,
    path: HOME_PATH
  }, overrides || {});
}

function shareAppMessage(page, overrides) {
  return makeOptions(page, overrides);
}

function shareTimeline(page, overrides) {
  const options = makeOptions(page, overrides);
  const timeline = { title: options.title };
  if (options.query) timeline.query = options.query;
  if (options.imageUrl) timeline.imageUrl = options.imageUrl;
  return timeline;
}

module.exports = {
  HOME_PATH,
  DEFAULT_TITLE,
  shareAppMessage,
  shareTimeline
};
