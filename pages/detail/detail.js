const { getProject, deleteProject: removeProject, renameProject } = require('../../miniprogram/utils/store');
const { drawPattern, drawLegend, makePatternExportLayout, saveCanvasToAlbum } = require('../../miniprogram/utils/render');
const { getPaletteName } = require('../../miniprogram/utils/palettes');
const { getPageTopStyle, getHeaderStyle } = require('../../miniprogram/utils/layout');
const { safeCells, formatTime, typeLabel, countPaintedCells } = require('../../miniprogram/utils/project-preview');
const { STORAGE_KEYS } = require('../../miniprogram/utils/constants');
const { getChecks, toggleCheck, clearChecks } = require('../../miniprogram/utils/project-checks');
const haptic = require('../../miniprogram/utils/haptic');
const { shareAppMessage, shareTimeline } = require('../../miniprogram/utils/share');

const CURRENT_PROJECT_KEY = STORAGE_KEYS.CURRENT_PROJECT;

function isUsableProject(project) {
  const width = Number(project && project.width);
  const height = Number(project && project.height);
  return Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0;
}

function actionText(type) {
  return type === 'draw' ? '继续画' : '查看图纸';
}

Page({
  data: {
    pageStyle: '',
    navStyle: '',
    project: null,
    decoratedStats: [],
    checkedCount: 0,
    highlightCode: '',
    previewCanvasWidth: 320,
    previewCanvasHeight: 320,
    previewBoxHeight: 360,
    exportWidth: 900,
    exportHeight: 1200
  },

  onLoad(query) {
    this.projectId = query.id;
    this.setData({ pageStyle: getPageTopStyle(18), navStyle: getHeaderStyle(18) });
    this.loadProject();
  },

  onShow() {
    if (this.projectId) this.loadProject();
  },

  loadProject() {
    const raw = getProject(this.projectId);
    if (!raw || !isUsableProject(raw)) {
      this.setData({ project: null });
      return;
    }
    const width = Number(raw.width);
    const height = Number(raw.height);
    const colorStats = (Array.isArray(raw.colorStats) ? raw.colorStats : []).map((item) => Object.assign({}, item, {
      paletteLabel: item.paletteName || getPaletteName(item.paletteId || raw.paletteId)
    }));
    const totalCount = width * height;
    const paintedCount = raw.type === 'draw' ? countPaintedCells(raw) : totalCount;
    const checkedCodes = raw.id ? getChecks(raw.id) : [];
    const decoratedStats = colorStats.map((item) => Object.assign({}, item, {
      checked: checkedCodes.indexOf(item.code) >= 0
    }));
    const project = Object.assign({}, raw, {
      width,
      height,
      cells: safeCells(raw),
      colorStats,
      typeLabel: typeLabel(raw.type),
      actionText: actionText(raw.type),
      paletteLabel: getPaletteName(raw.paletteId),
      updatedText: formatTime(raw.updatedAt || raw.createdAt),
      totalCount,
      paintedCount,
      colorCount: colorStats.length,
      boardText: raw.stats ? raw.stats.boardColumns + ' x ' + raw.stats.boardRows + ' 拼板' : '-'
    });
    this.setData({
      project,
      decoratedStats,
      checkedCount: checkedCodes.length
    }, () => this.updatePreviewSize());
  },

  updatePreviewSize() {
    const project = this.data.project;
    if (!project) return;
    const info = wx.getSystemInfoSync();
    const maxWidth = Math.max(280, info.windowWidth - 48);
    const maxHeight = Math.min(520, Math.max(280, Math.floor((info.windowHeight || 760) * 0.46)));
    const cellSize = Math.max(2, Math.min(maxWidth / project.width, maxHeight / project.height));
    const previewCanvasWidth = Math.max(1, Math.round(project.width * cellSize));
    const previewCanvasHeight = Math.max(1, Math.round(project.height * cellSize));
    this.setData({
      previewCanvasWidth,
      previewCanvasHeight,
      previewBoxHeight: Math.min(maxHeight, Math.max(260, previewCanvasHeight))
    }, () => this.drawPreview());
  },

  drawPreview() {
    const project = this.data.project;
    if (!project) return;
    const cellSize = this.data.previewCanvasWidth / project.width;
    const ctx = wx.createCanvasContext('previewCanvas', this);
    drawPattern(ctx, project, {
      x: 0,
      y: 0,
      cellSize,
      mode: 'color',
      highlightCode: this.data.highlightCode
    });
    ctx.draw();
  },

  highlightStat(event) {
    haptic.tap();
    const code = event.currentTarget.dataset.code || '';
    const next = this.data.highlightCode === code ? '' : code;
    this.setData({ highlightCode: next }, () => this.drawPreview());
  },

  clearHighlight() {
    if (!this.data.highlightCode) return;
    this.setData({ highlightCode: '' }, () => this.drawPreview());
  },

  toggleStatChecked(event) {
    const code = event.currentTarget.dataset.code || '';
    if (!code || !this.data.project || !this.data.project.id) return;
    haptic.tap();
    const checked = toggleCheck(this.data.project.id, code);
    const decoratedStats = this.data.decoratedStats.map((item) => Object.assign({}, item, {
      checked: checked.indexOf(item.code) >= 0
    }));
    this.setData({ decoratedStats, checkedCount: checked.length });
  },

  resetChecks() {
    if (!this.data.project || !this.data.project.id || !this.data.checkedCount) return;
    wx.showModal({
      title: '清空勾选',
      content: '确定要清空所有色号勾选吗？',
      success: (res) => {
        if (!res.confirm) return;
        clearChecks(this.data.project.id);
        const decoratedStats = this.data.decoratedStats.map((item) => Object.assign({}, item, { checked: false }));
        this.setData({ decoratedStats, checkedCount: 0 });
      }
    });
  },

  rename() {
    const project = this.data.project;
    if (!project) return;
    haptic.tap();
    wx.showModal({
      title: '重命名作品',
      editable: true,
      placeholderText: '输入新名称',
      content: project.name || '',
      success: (res) => {
        if (!res.confirm) return;
        const next = String(res.content || '').trim();
        if (!next) return;
        const saved = renameProject(project.id, next);
        if (!saved) {
          wx.showToast({ title: '重命名失败', icon: 'none' });
          return;
        }
        haptic.success();
        wx.showToast({ title: '已重命名', icon: 'success' });
        this.loadProject();
      }
    });
  },

  goBack() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: '/pages/projects/projects' })
    });
  },

  goHome() {
    if (wx.reLaunch) {
      wx.reLaunch({ url: '/pages/home/home' });
      return;
    }
    wx.redirectTo({ url: '/pages/home/home' });
  },

  continueEdit() {
    if (!this.data.project) return;
    haptic.tap();
    if (this.data.project.type === 'draw') {
      wx.navigateTo({ url: '/pages/draw/draw?id=' + this.data.project.id });
      return;
    }
    wx.navigateTo({ url: '/pages/result/result?id=' + this.data.project.id });
  },

  deleteProject() {
    if (!this.data.project) return;
    wx.showModal({
      title: '删除作品',
      content: '确认删除「' + (this.data.project.name || '未命名作品') + '」吗？删除后不能恢复。',
      confirmColor: '#B84B3A',
      success: (res) => {
        if (!res.confirm) return;
        removeProject(this.data.project.id);
        const current = wx.getStorageSync(CURRENT_PROJECT_KEY);
        if (current && current.id === this.data.project.id && wx.removeStorageSync) {
          try {
            wx.removeStorageSync(CURRENT_PROJECT_KEY);
          } catch (error) {}
        }
        wx.showToast({ title: '已删除', icon: 'success' });
        setTimeout(() => this.goBack(), 260);
      }
    });
  },

  saveLongImage() {
    const project = this.data.project;
    if (!project) return;
    haptic.tap();
    const layout = makePatternExportLayout(project, { mode: 'code' });
    this.setData({ exportWidth: layout.exportWidth, exportHeight: layout.exportHeight }, () => {
      const ctx = wx.createCanvasContext('exportCanvas', this);
      ctx.setFillStyle('#fffdf8');
      ctx.fillRect(0, 0, layout.exportWidth, layout.exportHeight);
      ctx.setFillStyle('#222222');
      ctx.setFontSize(34);
      ctx.fillText(project.name || '拼豆图纸', layout.padding, 54);
      ctx.setFillStyle('#6c6258');
      ctx.setFontSize(20);
      ctx.fillText(project.width + ' x ' + project.height + ' · ' + project.typeLabel + ' · ' + project.totalCount + ' 颗', layout.padding, 90);
      drawPattern(ctx, project, {
        x: layout.patternX,
        y: layout.patternY,
        cellSize: layout.cellSize,
        mode: 'code'
      });
      ctx.setFillStyle('#222222');
      ctx.setFontSize(24);
      ctx.fillText('用豆清单', layout.legendX, layout.legendY - 18);
      drawLegend(ctx, project.colorStats || [], layout.legendX, layout.legendY, layout.legendWidth);
      ctx.draw(false, () => {
        saveCanvasToAlbum('exportCanvas', this, '已保存到相册', {
          width: layout.exportWidth,
          height: layout.exportHeight,
          destWidth: layout.exportWidth,
          destHeight: layout.exportHeight
        });
      });
    });
  },

  onShareAppMessage() {
    const project = this.data.project;
    return shareAppMessage('detail', {
      title: project && project.name ? project.name : '???????'
    });
  },

  onShareTimeline() {
    const project = this.data.project;
    return shareTimeline('detail', {
      title: project && project.name ? project.name : '???????'
    });
  }
});
