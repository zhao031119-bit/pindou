const { listPalettes, getPalette, getPaletteName, isPaletteVerified } = require('../../miniprogram/utils/palettes');
const { estimateStats, remapProject } = require('../../miniprogram/utils/pattern');
const { saveProject, getProject } = require('../../miniprogram/utils/store');
const { drawPattern, drawLegend, makePatternExportLayout } = require('../../miniprogram/utils/render');
const { getHeaderStyle } = require('../../miniprogram/utils/layout');
const { STORAGE_KEYS } = require('../../miniprogram/utils/constants');
const { getChecks, toggleCheck, clearChecks } = require('../../miniprogram/utils/project-checks');
const { getPaletteIcon, makePaletteIconOptions } = require('../../miniprogram/utils/palette-icons');
const haptic = require('../../miniprogram/utils/haptic');

const DRAFT_KEY = STORAGE_KEYS.UPLOAD_DRAFT;
const CURRENT_PROJECT_KEY = STORAGE_KEYS.CURRENT_PROJECT;
function makePaletteOptions() {
  return makePaletteIconOptions(listPalettes(), getPalette);
}

function normalizeProject(project) {
  const width = Number(project && project.width);
  const height = Number(project && project.height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    return null;
  }
  return Object.assign({}, project, {
    width,
    height,
    cells: Array.isArray(project.cells) ? project.cells : [],
    colorStats: Array.isArray(project.colorStats) ? project.colorStats : [],
    stats: project.stats || estimateStats(width, height, project.beadSize || '5mm')
  });
}

Page({
  data: {
    navStyle: '',
    project: null,
    palettes: makePaletteOptions(),
    paletteName: '',
    paletteIcon: '',
    paletteVerified: true,
    canEditSource: false,
    mode: 'color',
    showOriginal: false,
    sourceImage: '',
    previewCanvasWidth: 320,
    previewCanvasHeight: 320,
    previewBoxHeight: 320,
    exportCanvasWidth: 900,
    exportCanvasHeight: 1200,
    highlightCode: '',
    decoratedStats: [],
    checkedCount: 0,
    isSaved: false,
    saving: false,
    showCheckTip: false,
    exportingPreview: false,
    exportPreviewPath: '',
    showSavePreview: false
  },

  onLoad(options) {
    this.setData({ navStyle: getHeaderStyle(18) });
    let project = null;
    const loadedFromSavedProject = !!(options && options.id);
    this.loadedFromSaved = loadedFromSavedProject;
    if (options && options.id) {
      project = getProject(options.id);
    } else {
      project = wx.getStorageSync(CURRENT_PROJECT_KEY);
    }
    const draft = wx.getStorageSync(DRAFT_KEY);
    this.setData({ canEditSource: !loadedFromSavedProject && !!(draft && draft.imagePath) });
    if (project) {
      this.setProject(project, { saved: loadedFromSavedProject });
    }
  },

  onReady() {
    if (this.data.project) {
      this.drawPreview();
    }
    try {
      if (!wx.getStorageSync('result_check_tip_seen')) {
        this.setData({ showCheckTip: true });
      }
    } catch (error) {}
  },

  dismissCheckTip() {
    this.setData({ showCheckTip: false });
    try {
      wx.setStorageSync('result_check_tip_seen', true);
    } catch (error) {}
  },

  setProject(project, options) {
    const opts = options || {};
    const safeProject = normalizeProject(project);
    if (!safeProject) {
      this.setData({ project: null });
      return;
    }
    const info = wx.getSystemInfoSync();
    const maxWidth = Math.max(260, info.windowWidth - 48);
    const sourceImage = safeProject.sourceImage || (this.data && this.data.sourceImage) || '';
    const checkedCodes = safeProject.id ? getChecks(safeProject.id) : [];
    const decoratedStats = (safeProject.colorStats || []).map((item) => Object.assign({}, item, {
      checked: checkedCodes.indexOf(item.code) >= 0
    }));
    const isSaved = typeof opts.saved === 'boolean' ? opts.saved : this.data.isSaved && safeProject.id === (this.data.project && this.data.project.id);
    this.setData({
      project: safeProject,
      paletteName: getPaletteName(safeProject.paletteId),
      paletteIcon: getPaletteIcon(safeProject.paletteId),
      paletteVerified: isPaletteVerified(safeProject.paletteId),
      previewCanvasWidth: maxWidth,
      sourceImage,
      decoratedStats,
      checkedCount: checkedCodes.length,
      isSaved
    }, () => this.updatePreviewSize());
  },

  updatePreviewSize() {
    const project = this.data.project;
    if (!project) return;
    const info = wx.getSystemInfoSync();
    const maxWidth = Math.max(260, info.windowWidth - 48);
    const maxBoxHeight = Math.min(520, Math.floor((info.windowHeight || 760) * 0.48));
    let previewCanvasWidth;
    let previewCanvasHeight;
    if (this.data.mode === 'code') {
      const cellSize = Math.max(12, Math.floor(maxWidth / project.width));
      previewCanvasWidth = project.width * cellSize;
      previewCanvasHeight = project.height * cellSize;
    } else {
      previewCanvasWidth = maxWidth;
      previewCanvasHeight = Math.max(1, Math.round(maxWidth * project.height / project.width));
    }
    this.setData({
      previewCanvasWidth,
      previewCanvasHeight,
      previewBoxHeight: Math.min(maxBoxHeight, Math.max(240, previewCanvasHeight))
    }, () => this.drawPreview());
  },

  drawPreview() {
    const project = this.data.project;
    if (!project) return;
    const cellSize = this.data.previewCanvasWidth / project.width;
    const ctx = wx.createCanvasContext('previewCanvas', this);
    drawPattern(ctx, project, {
      mode: this.data.mode,
      x: 0,
      y: 0,
      cellSize,
      highlightCode: this.data.highlightCode
    });
    ctx.draw();
  },

  switchMode(event) {
    haptic.tap();
    const mode = event.currentTarget.dataset.mode;
    this.setData({ mode }, () => this.updatePreviewSize());
  },

  toggleOriginal() {
    if (!this.data.sourceImage) return;
    haptic.tap();
    this.setData({ showOriginal: !this.data.showOriginal });
  },

  highlightStat(event) {
    const code = event.currentTarget.dataset.code || '';
    haptic.tap();
    const next = this.data.highlightCode === code ? '' : code;
    this.setData({ highlightCode: next }, () => this.drawPreview());
  },

  clearHighlight() {
    if (!this.data.highlightCode) return;
    this.setData({ highlightCode: '' }, () => this.drawPreview());
  },

  toggleStatChecked(event) {
    const code = event.currentTarget.dataset.code || '';
    if (!code) return;
    haptic.tap();
    const project = this.data.project;
    if (!project || !project.id) {
      wx.showToast({ title: '请先保存作品', icon: 'none' });
      return;
    }
    const checked = toggleCheck(project.id, code);
    const decoratedStats = this.data.decoratedStats.map((item) => Object.assign({}, item, {
      checked: checked.indexOf(item.code) >= 0
    }));
    this.setData({ decoratedStats, checkedCount: checked.length });
  },

  resetChecks() {
    const project = this.data.project;
    if (!project || !project.id) return;
    if (!this.data.checkedCount) return;
    wx.showModal({
      title: '清空勾选',
      content: '确定要清空所有色号勾选吗？',
      success: (res) => {
        if (!res.confirm) return;
        clearChecks(project.id);
        const decoratedStats = this.data.decoratedStats.map((item) => Object.assign({}, item, { checked: false }));
        this.setData({ decoratedStats, checkedCount: 0 });
      }
    });
  },

  showVerifiedInfo() {
    wx.showModal({
      title: '什么是「待校准」',
      content: '该色卡的色值还在采集和核对中，目前显示的色号仅供预览参考，按这份清单去店铺购买可能会有偏差。已校准的色卡（如 MARD家、盼盼家）则可以放心使用。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  switchPalette(event) {
    haptic.tap();
    const paletteId = event.currentTarget.dataset.id;
    if (!this.data.project || paletteId === this.data.project.paletteId) return;
    if (!isPaletteVerified(paletteId)) {
      wx.showModal({
        title: '色卡待校准',
        content: '该色卡目前是示例数据，只适合预览，不建议按清单购买。确定仅预览吗？',
        confirmText: '仅预览',
        success: (res) => {
          if (res.confirm) this.applyPaletteSwitch(paletteId);
        }
      });
      return;
    }
    this.applyPaletteSwitch(paletteId);
  },

  applyPaletteSwitch(paletteId) {
    wx.showLoading({ title: '切换色卡' });
    try {
      let project = remapProject(this.data.project, paletteId);
      const shouldPersistSaved = this.loadedFromSaved || this.data.isSaved;
      if (shouldPersistSaved) {
        const saved = saveProject(project);
        if (!saved) throw new Error('save project failed');
        project = saved;
      }
      if (!this.loadedFromSaved) {
        wx.setStorageSync(CURRENT_PROJECT_KEY, project);
      } else {
        try {
          const current = wx.getStorageSync(CURRENT_PROJECT_KEY);
          if (current && current.id === project.id) {
            wx.setStorageSync(CURRENT_PROJECT_KEY, project);
          }
        } catch (error) {}
      }
      this.setData({ highlightCode: '' });
      this.setProject(project, { saved: shouldPersistSaved });
    } catch (error) {
      wx.hideLoading();
      wx.showModal({
        title: '切换失败',
        content: '本地存储空间不足，请保存或删除旧作品后重试。',
        showCancel: false
      });
      return;
    }
    wx.hideLoading();
    if (!isPaletteVerified(paletteId)) {
      wx.showToast({ title: '该色卡待校准', icon: 'none' });
    }
  },

  saveToProjects() {
    if (!this.data.project || this.data.saving) return;
    if (this.data.isSaved) {
      wx.navigateTo({ url: '/pages/detail/detail?id=' + this.data.project.id });
      return;
    }
    this.setData({ saving: true });
    const saved = saveProject(this.data.project);
    if (!saved) {
      this.setData({ saving: false });
      wx.showModal({
        title: '保存失败',
        content: '本地存储空间不足，请删除一些旧作品后重试。',
        showCancel: false
      });
      return;
    }
    try {
      wx.setStorageSync(CURRENT_PROJECT_KEY, saved);
    } catch (error) {}
    haptic.success();
    this.setProject(saved, { saved: true });
    this.setData({ saving: false });
    wx.showToast({ title: '已加入我的作品', icon: 'success' });
  },

  saveLongImage() {
    const project = this.data.project;
    if (!project || this.data.exportingPreview) return;
    haptic.tap();
    const layout = makePatternExportLayout(project, { mode: 'code' });
    this.setData({
      exportingPreview: true,
      exportCanvasWidth: layout.exportWidth,
      exportCanvasHeight: layout.exportHeight
    }, () => {
      const ctx = wx.createCanvasContext('exportCanvas', this);
      ctx.setFillStyle('#fffdf8');
      ctx.fillRect(0, 0, layout.exportWidth, layout.exportHeight);
      ctx.setFillStyle('#222222');
      ctx.setFontSize(34);
      ctx.fillText(project.width + ' x ' + project.height + ' 拼豆图纸', layout.padding, 54);
      ctx.setFillStyle('#6c6258');
      ctx.setFontSize(20);
      ctx.fillText(this.data.paletteName + ' · ' + project.stats.total + ' 颗 · ' + project.colorStats.length + ' 色', layout.padding, 90);
      ctx.setFillStyle('#9a8c7d');
      ctx.setFontSize(16);
      ctx.fillText('长按图片可保存到相册', layout.padding, 118);
      drawPattern(ctx, project, {
        mode: 'code',
        x: layout.patternX,
        y: layout.patternY,
        cellSize: layout.cellSize
      });
      ctx.setFillStyle('#222222');
      ctx.setFontSize(24);
      ctx.fillText('用豆清单', layout.legendX, layout.legendY - 18);
      drawLegend(ctx, project.colorStats, layout.legendX, layout.legendY, layout.legendWidth);
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          canvasId: 'exportCanvas',
          width: layout.exportWidth,
          height: layout.exportHeight,
          destWidth: layout.exportWidth,
          destHeight: layout.exportHeight,
          success: (res) => {
            this.setData({
              exportingPreview: false,
              exportPreviewPath: res.tempFilePath,
              showSavePreview: true
            });
          },
          fail: () => {
            this.setData({ exportingPreview: false });
            wx.showModal({
              title: '生成失败',
              content: '图纸尺寸过大，暂时无法生成预览，请降低宽高后再试。',
              showCancel: false
            });
          }
        }, this);
      });
    });
  },

  closeSavePreview() {
    this.setData({ showSavePreview: false });
  },

  goUpload() {
    wx.redirectTo({ url: '/pages/upload/upload' });
  },

  goHome() {
    if (wx.reLaunch) {
      wx.reLaunch({ url: '/pages/home/home' });
      return;
    }
    wx.redirectTo({ url: '/pages/home/home' });
  },

  goBack() {
    if (this.data.canEditSource && !this.loadedFromSaved) {
      this.goSize();
      return;
    }
    wx.navigateBack({
      fail: () => {
        const project = this.data.project;
        if (project && project.id && this.data.isSaved) {
          wx.redirectTo({ url: '/pages/detail/detail?id=' + project.id });
          return;
        }
        wx.redirectTo({ url: '/pages/home/home' });
      }
    });
  },

  goCrop() {
    if (!this.data.canEditSource) {
      wx.showModal({
        title: '不能继续裁剪',
        content: '历史作品没有可靠的原始上传草稿，请重新上传图片生成。',
        showCancel: false
      });
      return;
    }
    const draft = wx.getStorageSync(DRAFT_KEY);
    if (!draft || !draft.imagePath) {
      wx.navigateTo({ url: '/pages/upload/upload' });
      return;
    }
    wx.redirectTo({ url: '/pages/upload/upload?recrop=1' });
  },

  goSize() {
    if (!this.data.canEditSource) {
      wx.showModal({
        title: '不能调整尺寸',
        content: '历史作品没有可靠的原始上传草稿，请重新上传图片生成。',
        showCancel: false
      });
      return;
    }
    const draft = wx.getStorageSync(DRAFT_KEY);
    if (!draft || !draft.imagePath) {
      wx.showModal({
        title: '无法调整尺寸',
        content: '当前没有原始上传记录，请重新上传图片后生成。',
        showCancel: false
      });
      return;
    }
    try {
      wx.setStorageSync(DRAFT_KEY, Object.assign({}, draft, {
        draftType: 'upload',
        stage: 'size',
        updatedAt: Date.now()
      }));
    } catch (error) {}
    wx.redirectTo({ url: '/pages/size/size' });
  },

  onShareAppMessage() {
    const project = this.data.project;
    if (project && project.id && this.data.isSaved) {
      return {
        title: project.name || '我做的拼豆图纸',
        path: '/pages/home/home'
      };
    }
    return {
      title: '拼豆星球 - 从照片自动生成图纸',
      path: '/pages/home/home'
    };
  },

  onShareTimeline() {
    const project = this.data.project;
    if (project && project.id && this.data.isSaved) {
      return {
        title: project.name || '我做的拼豆图纸'
      };
    }
    return { title: '拼豆星球 - 从照片自动生成图纸' };
  }
});
