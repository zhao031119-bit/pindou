const { listPalettes, isPaletteVerified } = require('../../miniprogram/utils/palettes');
const { imageDataToAverageGrid, mapAverageGridToPalette, createProject } = require('../../miniprogram/utils/pattern');
const { saveProject } = require('../../miniprogram/utils/store');
const { drawPattern, drawLegend, measureLegend, saveCanvasToAlbum } = require('../../miniprogram/utils/render');
const { SIZE_PRESETS, BEAD_SIZE_OPTIONS, DEFAULT_PALETTE_ID, MAX_GENERATE_CELLS } = require('../../miniprogram/utils/constants');
const { getHeaderStyle } = require('../../miniprogram/utils/layout');
const { chooseOneImage } = require('../../miniprogram/utils/media');
const haptic = require('../../miniprogram/utils/haptic');

function toPositiveInt(value, fallback) {
  const number = parseInt(value, 10);
  if (!Number.isFinite(number) || number <= 0) return fallback;
  return Math.min(number, 160);
}

Page({
  data: {
    navStyle: '',
    imagePath: '',
    imageWidth: 0,
    imageHeight: 0,
    width: 29,
    height: 29,
    activePresetId: 'board1',
    sizePresets: SIZE_PRESETS,
    palettes: [],
    paletteNames: [],
    paletteIndex: 0,
    beadSizeLabels: BEAD_SIZE_OPTIONS.map((item) => item.label),
    beadSizeIndex: 0,
    sourceCanvasWidth: 320,
    sourceCanvasHeight: 320,
    reportCanvasWidth: 750,
    reportCanvasHeight: 1000,
    previewWidth: 320,
    previewHeight: 320,
    project: null,
    paletteVerified: true,
    colorStats: [],
    totalCount: 0,
    generating: false,
    isSaved: false,
    saving: false
  },

  onLoad() {
    const palettes = listPalettes();
    const paletteIndex = Math.max(0, palettes.findIndex((item) => item.id === DEFAULT_PALETTE_ID));
    this.setData({
      navStyle: getHeaderStyle(18),
      palettes,
      paletteNames: palettes.map((item) => item.name),
      paletteIndex
    });
  },

  chooseImage() {
    chooseOneImage((path) => {
      wx.getImageInfo({
        src: path,
        success: (info) => {
          this.setData({
            imagePath: path,
            imageWidth: info.width,
            imageHeight: info.height,
            project: null,
            colorStats: [],
            totalCount: 0,
            isSaved: false,
            saving: false
          });
        },
        fail() {
          wx.showToast({ title: '图纸读取失败', icon: 'none' });
        }
      });
    });
  },

  onWidthInput(event) {
    this.setData({ width: event.detail.value, activePresetId: '' });
    this.clearResult();
  },

  onHeightInput(event) {
    this.setData({ height: event.detail.value, activePresetId: '' });
    this.clearResult();
  },

  selectPreset(event) {
    const preset = this.data.sizePresets[event.currentTarget.dataset.index];
    const beadSizeIndex = Math.max(0, BEAD_SIZE_OPTIONS.findIndex((item) => item.id === preset.beadSize));
    this.setData({
      width: preset.width,
      height: preset.height,
      activePresetId: preset.id,
      beadSizeIndex
    });
    this.clearResult();
  },

  onPaletteChange(event) {
    const paletteIndex = Number(event.detail.value);
    const paletteId = this.data.palettes[paletteIndex].id;
    this.setData({ paletteIndex });
    this.clearResult();
    if (!isPaletteVerified(paletteId)) {
      wx.showToast({ title: '该色卡待校准', icon: 'none' });
    }
  },

  onBeadSizeChange(event) {
    this.setData({ beadSizeIndex: Number(event.detail.value) });
    this.clearResult();
  },

  clearResult() {
    if (!this.data.project && !this.data.colorStats.length) return;
    this.setData({
      project: null,
      colorStats: [],
      totalCount: 0,
      isSaved: false,
      saving: false
    });
  },

  generate() {
    if (!this.data.imagePath) {
      wx.showToast({ title: '请先上传图纸', icon: 'none' });
      return;
    }
    const width = toPositiveInt(this.data.width, 29);
    const height = toPositiveInt(this.data.height, 29);
    if (width * height > MAX_GENERATE_CELLS) {
      wx.showToast({ title: '尺寸过大，请降低宽高', icon: 'none' });
      return;
    }
    haptic.tap();
    this.setData({ width, height, generating: true });
    this.drawSourceCanvas(() => this.readSourceAndCreateProject(width, height));
  },

  drawSourceCanvas(callback) {
    const { imagePath, imageWidth, imageHeight } = this.data;
    const maxSide = 900;
    const scale = Math.min(1, maxSide / Math.max(imageWidth, imageHeight));
    const canvasWidth = Math.max(1, Math.round(imageWidth * scale));
    const canvasHeight = Math.max(1, Math.round(imageHeight * scale));
    this.setData({
      sourceCanvasWidth: canvasWidth,
      sourceCanvasHeight: canvasHeight
    }, () => {
      const ctx = wx.createCanvasContext('sourceCanvas', this);
      ctx.setFillStyle('#ffffff');
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(imagePath, 0, 0, canvasWidth, canvasHeight);
      ctx.draw(false, callback);
    });
  },

  readSourceAndCreateProject(width, height) {
    const { sourceCanvasWidth, sourceCanvasHeight, palettes, paletteIndex, beadSizeIndex, imagePath } = this.data;
    wx.canvasGetImageData({
      canvasId: 'sourceCanvas',
      x: 0,
      y: 0,
      width: sourceCanvasWidth,
      height: sourceCanvasHeight,
      success: (res) => {
        const paletteId = palettes[paletteIndex].id;
        const beadSize = BEAD_SIZE_OPTIONS[beadSizeIndex].id;
        const averageGrid = imageDataToAverageGrid(res.data, sourceCanvasWidth, sourceCanvasHeight, width, height, 0.18);
        const mapped = mapAverageGridToPalette(averageGrid, paletteId);
        const project = createProject({
          name: '提取图纸 ' + new Date().toLocaleString(),
          type: 'extracted',
          sourceImage: imagePath,
          width,
          height,
          beadSize,
          paletteId,
          averageGrid,
          cells: mapped.cells,
          colorStats: mapped.colorStats
        });
        this.setProject(project);
      },
      fail: () => {
        this.setData({ generating: false });
        wx.showToast({ title: '采样失败', icon: 'none' });
      }
    }, this);
  },

  setProject(project, options) {
    const opts = options || {};
    const totalCount = project.colorStats.reduce((sum, item) => sum + item.count, 0);
    const paletteVerified = isPaletteVerified(project.paletteId);
    this.setData({
      project,
      colorStats: project.colorStats,
      totalCount,
      paletteVerified,
      generating: false,
      isSaved: !!opts.saved
    }, () => this.drawPreview());
  },

  drawPreview() {
    const { project } = this.data;
    if (!project) return;
    const maxWidth = 320;
    const maxHeight = 260;
    const cellSize = Math.max(2, Math.floor(Math.min(maxWidth / project.width, maxHeight / project.height)));
    const previewWidth = project.width * cellSize;
    const previewHeight = project.height * cellSize;
    this.setData({ previewWidth, previewHeight }, () => {
      const ctx = wx.createCanvasContext('previewCanvas', this);
      drawPattern(ctx, project, { x: 0, y: 0, cellSize, mode: 'color' });
      ctx.draw();
    });
  },

  makeListText() {
    const { project, palettes, paletteIndex } = this.data;
    if (!project) return '';
    const lines = [
      '图纸色号清单',
      '尺寸：' + project.width + ' x ' + project.height,
      '色卡：' + palettes[paletteIndex].name,
      '总数：' + project.width * project.height
    ];
    project.colorStats.forEach((item) => {
      lines.push(item.code + '  ' + item.count + '颗  ' + item.name);
    });
    return lines.join('\n');
  },

  copyList() {
    wx.setClipboardData({
      data: this.makeListText(),
      success() {
        wx.showToast({ title: '已复制', icon: 'success' });
      }
    });
  },

  saveLocalProject() {
    if (!this.data.project || this.data.saving) return;
    if (this.data.isSaved && this.data.project.id) {
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
    haptic.success();
    this.setProject(saved, { saved: true });
    this.setData({ saving: false });
    wx.showToast({ title: '已加入我的作品', icon: 'success' });
  },

  saveLongImage() {
    haptic.tap();
    const { project } = this.data;
    if (!project) return;
    const baseWidth = 750;
    const patternCell = Math.max(12, Math.min(16, Math.floor((baseWidth - 48) / project.width)));
    const width = Math.max(baseWidth, project.width * patternCell + 48);
    const patternHeight = project.height * patternCell;
    const legendHeight = measureLegend(project.colorStats, width - 48);
    const height = Math.max(900, 170 + patternHeight + legendHeight + 60);
    this.setData({
      reportCanvasWidth: width,
      reportCanvasHeight: height
    }, () => {
      const ctx = wx.createCanvasContext('reportCanvas', this);
      ctx.setFillStyle('#ffffff');
      ctx.fillRect(0, 0, width, height);
      ctx.setFillStyle('#222222');
      ctx.setFontSize(28);
      ctx.fillText('图纸色号清单', 24, 42);
      ctx.setFillStyle('#666666');
      ctx.setFontSize(18);
      ctx.fillText(project.width + ' x ' + project.height + ' · ' + project.colorStats.length + ' 个色号', 24, 76);
      drawPattern(ctx, project, { x: 24, y: 108, cellSize: patternCell, mode: 'code' });
      drawLegend(ctx, project.colorStats, 24, 132 + patternHeight, width - 48);
      ctx.draw(false, () => {
        saveCanvasToAlbum('reportCanvas', this, '已保存长图', {
          width,
          height,
          destWidth: width,
          destHeight: height
        });
      });
    });
  },

  goHome() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: '/pages/home/home' })
    });
  }
});
