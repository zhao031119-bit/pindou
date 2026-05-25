const { listProjects } = require('../../miniprogram/utils/store');
const { countPaintedCells, makeProjectThumbnail } = require('../../miniprogram/utils/project-preview');
const { STORAGE_KEYS } = require('../../miniprogram/utils/constants');
const haptic = require('../../miniprogram/utils/haptic');

const DRAFT_KEY = STORAGE_KEYS.UPLOAD_DRAFT;
const DRAW_DRAFT_KEY = STORAGE_KEYS.DRAW_DRAFT;
const CURRENT_PROJECT_KEY = STORAGE_KEYS.CURRENT_PROJECT;

const ROUTE_MAP = {
  upload: '/pages/upload/upload',
  pick: '/pages/pick/pick',
  extract: '/pages/extract/extract',
  draw: '/pages/draw/draw',
  projects: '/pages/projects/projects',
  detail: '/pages/detail/detail',
  result: '/pages/result/result'
};

const RECENT_COLORS = ['#D04F3F', '#E8B649', '#9EB8CB', '#7FB29A'];

function makeUploadDraftState(draft, hasCurrentProject) {
  if (!draft || !draft.imagePath) return null;
  const isPendingSize = draft.stage === 'size' || (!draft.stage && !draft.completedAt && !hasCurrentProject);
  if (!isPendingSize) return null;
  return {
    type: 'upload',
    route: '/pages/size/size',
    title: '继续生成图纸',
    subtitle: '已选好图片，下一步选择拼豆尺寸',
    thumbnailType: 'image',
    imagePath: draft.thumbnailPath || draft.imagePath,
    progress: 55,
    updatedAt: draft.updatedAt || 0
  };
}

function makeDrawDraftState(draft) {
  const paintedCount = countPaintedCells(draft);
  if (!draft || paintedCount <= 0) return null;
  const preview = makeProjectThumbnail(draft, 8);
  return {
    type: 'draw',
    route: '/pages/draw/draw?draft=1',
    title: draft.name || '继续画豆图',
    subtitle: '已画 ' + paintedCount + ' 颗 · ' + draft.width + ' x ' + draft.height,
    thumbnailType: 'grid',
    previewWidth: preview.previewWidth,
    previewHeight: preview.previewHeight,
    thumbWidthPercent: preview.thumbWidthPercent,
    thumbHeightPercent: preview.thumbHeightPercent,
    previewCells: preview.previewCells,
    progress: 35,
    updatedAt: draft.updatedAt || draft.createdAt || 0
  };
}

function pickLatestDraft(uploadDraft, drawDraft) {
  if (uploadDraft && drawDraft) {
    return uploadDraft.updatedAt >= drawDraft.updatedAt ? uploadDraft : drawDraft;
  }
  return uploadDraft || drawDraft || null;
}

Page({
  data: {
    safeTopPx: 44,
    greeting: '下午好',
    userName: '小南瓜',
    projectCount: 0,
    generateSubtitle: '照片转拼豆图纸',
    pickSubtitle: '点击图片识别 10 套色卡',
    extractSubtitle: '批量整理用豆清单',
    drawSubtitle: '自由创作豆豆图',
    hasDraft: false,
    draftTitle: '未命名图纸',
    draftProgress: 0,
    draftRemaining: 0,
    draftRoute: '',
    draftSubtitle: '',
    draftThumbnailType: '',
    draftImagePath: '',
    draftPreviewWidth: 0,
    draftPreviewHeight: 0,
    draftThumbWidthPercent: 100,
    draftThumbHeightPercent: 100,
    draftPreviewCells: [],
    recentWorks: []
  },

  onLoad() {
    try {
      const menu = wx.getMenuButtonBoundingClientRect();
      this.setData({ safeTopPx: Math.round(menu.bottom + 20) });
    } catch (error) {}
    this.refreshGreeting();
  },

  onShow() {
    this.refreshGreeting();
    this.refreshProjectState();
  },

  refreshProjectState() {
    try {
      const projects = listProjects();
      const currentProject = wx.getStorageSync(CURRENT_PROJECT_KEY);
      const uploadDraft = wx.getStorageSync(DRAFT_KEY);
      const drawDraft = wx.getStorageSync(DRAW_DRAFT_KEY);
      const activeDraft = pickLatestDraft(
        makeUploadDraftState(uploadDraft, !!currentProject),
        makeDrawDraftState(drawDraft)
      );

      this.setData({
        projectCount: projects.length,
        generateSubtitle: projects.filter((item) => item.type === 'generated').length + ' 张图片图纸',
        pickSubtitle: '点击图片识别 10 套色卡',
        extractSubtitle: projects.filter((item) => item.type === 'extracted').length + ' 套提取清单',
        drawSubtitle: projects.filter((item) => item.type === 'draw').length + ' 张画豆图',
        hasDraft: !!activeDraft,
        draftTitle: activeDraft ? activeDraft.title : '未命名图纸',
        draftSubtitle: activeDraft ? activeDraft.subtitle : '',
        draftProgress: activeDraft ? activeDraft.progress : 0,
        draftRemaining: 0,
        draftRoute: activeDraft ? activeDraft.route : '',
        draftThumbnailType: activeDraft ? activeDraft.thumbnailType : '',
        draftImagePath: activeDraft && activeDraft.imagePath ? activeDraft.imagePath : '',
        draftPreviewWidth: activeDraft && activeDraft.previewWidth ? activeDraft.previewWidth : 0,
        draftPreviewHeight: activeDraft && activeDraft.previewHeight ? activeDraft.previewHeight : 0,
        draftThumbWidthPercent: activeDraft && activeDraft.thumbWidthPercent ? activeDraft.thumbWidthPercent : 100,
        draftThumbHeightPercent: activeDraft && activeDraft.thumbHeightPercent ? activeDraft.thumbHeightPercent : 100,
        draftPreviewCells: activeDraft && activeDraft.previewCells ? activeDraft.previewCells : [],
        recentWorks: projects.slice(0, 4).map((project, index) => {
          const preview = project.thumbnail || makeProjectThumbnail(project, 6);
          return {
            name: project.name || ('作品' + (index + 1)),
            color: project.colorStats && project.colorStats[0] ? project.colorStats[0].hex : RECENT_COLORS[index],
            previewWidth: preview.previewWidth,
            previewHeight: preview.previewHeight,
            thumbWidthPercent: preview.thumbWidthPercent,
            thumbHeightPercent: preview.thumbHeightPercent,
            previewCells: preview.previewCells
          };
        })
      });
    } catch (error) {}
  },

  refreshGreeting() {
    const hour = new Date().getHours();
    let greeting = '下午好';
    if (hour < 6) greeting = '夜深了';
    else if (hour < 11) greeting = '早上好';
    else if (hour < 14) greeting = '中午好';
    else if (hour < 18) greeting = '下午好';
    else greeting = '晚上好';
    this.setData({ greeting });
  },

  goPage(event) {
    haptic.tap();
    const target = event.currentTarget.dataset.target;
    const url = target === 'draft' && this.data.draftRoute ? this.data.draftRoute : ROUTE_MAP[target];
    if (!url) return;
    wx.navigateTo({
      url,
      fail() {
        wx.showToast({ title: '页面准备中', icon: 'none' });
      }
    });
  },

  onShareAppMessage() {
    return { title: '拼豆星球 - 从照片自动生成图纸', path: '/pages/home/home' };
  },

  onShareTimeline() {
    return { title: '拼豆星球 - 从照片自动生成图纸' };
  }
});
