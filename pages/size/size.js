const {
  DEFAULT_PALETTE_ID,
  BEAD_SIZE_OPTIONS,
  SIZE_PRESETS,
  STORAGE_KEYS,
  MAX_GENERATE_CELLS,
  MAX_DIMENSION
} = require('../../miniprogram/utils/constants');
const { estimateStats, imageDataToAverageGrid, mapAverageGridToPalette, createProject } = require('../../miniprogram/utils/pattern');
const { getHeaderStyle } = require('../../miniprogram/utils/layout');
const { analyzeImageData, buildSizeRecommendations, dimensionsFromRatio } = require('../../miniprogram/utils/size-recommendation');
const haptic = require('../../miniprogram/utils/haptic');

const DRAFT_KEY = STORAGE_KEYS.UPLOAD_DRAFT;
const CURRENT_PROJECT_KEY = STORAGE_KEYS.CURRENT_PROJECT;
const RECOMMEND_CANVAS_SIZE = 96;

function toPositiveInt(value, fallback) {
  const number = parseInt(value, 10);
  if (!number || number < 1) return fallback;
  return Math.min(number, MAX_DIMENSION);
}

function clampDimension(value) {
  return Math.max(1, Math.min(MAX_DIMENSION, Math.round(value)));
}

function getDraftRatio(draft) {
  const sourceCrop = draft && draft.sourceCrop;
  if (sourceCrop && Number(sourceCrop.sw) > 0 && Number(sourceCrop.sh) > 0) {
    return sourceCrop.sw / sourceCrop.sh;
  }
  const crop = draft && draft.crop;
  const width = crop && (crop.width || crop.size);
  const height = crop && (crop.height || crop.size);
  if (width > 0 && height > 0) return width / height;
  return 1;
}

function isValidDraft(draft) {
  return !!(
    draft &&
    draft.imagePath &&
    draft.imageInfo &&
    Number(draft.imageInfo.width) > 0 &&
    Number(draft.imageInfo.height) > 0 &&
    draft.crop
  );
}

function getSourceCrop(draft) {
  const image = draft.imageInfo;
  const crop = draft.crop;
  if (draft.sourceCrop && Number(draft.sourceCrop.sw) > 0 && Number(draft.sourceCrop.sh) > 0) {
    return draft.sourceCrop;
  }
  const stageWidth = Number(draft.stageWidth) || 320;
  const stageHeight = draft.stageHeight || stageWidth;
  const scale = Math.min(stageWidth / image.width, stageHeight / image.height);
  const displayW = image.width * scale;
  const displayH = image.height * scale;
  const offsetX = (stageWidth - displayW) / 2;
  const offsetY = (stageHeight - displayH) / 2;
  const cropWidth = Number(crop.width || crop.size) || displayW;
  const cropHeight = Number(crop.height || crop.size) || displayH;
  const cropX = Number(crop.x) || 0;
  const cropY = Number(crop.y) || 0;
  const sx = Math.max(0, (cropX - offsetX) / scale);
  const sy = Math.max(0, (cropY - offsetY) / scale);
  const sw = Math.max(1, Math.min(cropWidth / scale, image.width - sx));
  const sh = Math.max(1, Math.min(cropHeight / scale, image.height - sy));
  return { sx, sy, sw, sh };
}

function getSavedSizeDraft(draft, fallbackSize, fallbackBeadSize, fallbackKeepRatio) {
  const saved = draft && draft.sizeDraft;
  if (!saved) {
    return Object.assign({}, fallbackSize, {
      beadSize: fallbackBeadSize,
      keepRatio: fallbackKeepRatio,
      restored: false
    });
  }
  const beadSizeExists = BEAD_SIZE_OPTIONS.some((item) => item.id === saved.beadSize);
  return {
    width: toPositiveInt(saved.width, fallbackSize.width),
    height: toPositiveInt(saved.height, fallbackSize.height),
    beadSize: beadSizeExists ? saved.beadSize : fallbackBeadSize,
    keepRatio: typeof saved.keepRatio === 'boolean' ? saved.keepRatio : fallbackKeepRatio,
    restored: true
  };
}

Page({
  data: {
    navStyle: '',
    beadSizes: BEAD_SIZE_OPTIONS,
    sizePresets: SIZE_PRESETS,
    beadSize: '5mm',
    width: 29,
    height: 29,
    analysisCanvasSize: RECOMMEND_CANVAS_SIZE,
    recommendationLoading: false,
    recommendationSummary: '',
    recommendationScoreText: '',
    sizeRecommendations: [],
    primaryRecommendation: null,
    selectedRecommendationId: '',
    cropRatio: 1,
    cropRatioText: '1.00 : 1',
    keepRatio: true,
    stats: estimateStats(29, 29, '5mm'),
    pendingPreset: null,
    generating: false,
    generateStage: '',
    canvasWidth: 29,
    canvasHeight: 29
  },

  onLoad() {
    this.setData({ navStyle: getHeaderStyle(18) });
    const draft = wx.getStorageSync(DRAFT_KEY);
    if (!isValidDraft(draft)) {
      wx.showModal({
        title: '缺少图片',
        content: '请先上传或拍摄一张图片',
        showCancel: false,
        success: () => wx.redirectTo({ url: '/pages/upload/upload' })
      });
      return;
    }
    const cropRatio = getDraftRatio(draft);
    const nextSize = dimensionsFromRatio(29, cropRatio);
    const savedSize = getSavedSizeDraft(draft, nextSize, this.data.beadSize, this.data.keepRatio);
    this.shouldAutoApplyRecommendation = !savedSize.restored;
    this.setData({
      cropRatio,
      cropRatioText: cropRatio.toFixed(2) + ' : 1',
      width: savedSize.width,
      height: savedSize.height,
      beadSize: savedSize.beadSize,
      keepRatio: savedSize.keepRatio,
      stats: estimateStats(savedSize.width, savedSize.height, savedSize.beadSize)
    }, () => this.analyzeSmartRecommendation(draft));
  },

  selectBeadSize(event) {
    const beadSize = event.currentTarget.dataset.id;
    this.setData({
      beadSize,
      stats: estimateStats(this.data.width, this.data.height, beadSize)
    }, () => {
      this.refreshSmartRecommendations(false);
      this.persistSizeDraft();
    });
  },

  selectPreset(event) {
    const preset = SIZE_PRESETS.find((item) => item.id === event.currentTarget.dataset.id);
    this.setData({ pendingPreset: preset || null });
  },

  selectAndApplyPreset(event) {
    const dataset = event.currentTarget.dataset || {};
    const index = Number(dataset.index);
    const preset = SIZE_PRESETS[index] || SIZE_PRESETS.find((item) => item.id === dataset.id);
    if (!preset) return;
    this.setData({
      pendingPreset: preset,
      selectedRecommendationId: '',
      width: preset.width,
      height: preset.height,
      beadSize: preset.beadSize,
      stats: estimateStats(preset.width, preset.height, preset.beadSize)
    }, () => this.persistSizeDraft());
  },

  applyPreset() {
    const preset = this.data.pendingPreset;
    if (!preset) return;
    this.setData({
      selectedRecommendationId: '',
      width: preset.width,
      height: preset.height,
      beadSize: preset.beadSize,
      stats: estimateStats(preset.width, preset.height, preset.beadSize)
    }, () => this.persistSizeDraft());
  },

  onWidthInput(event) {
    const width = toPositiveInt(event.detail.value, this.data.width);
    const height = this.data.keepRatio
      ? clampDimension(width / this.data.cropRatio)
      : this.data.height;
    this.setData({
      selectedRecommendationId: '',
      width,
      height,
      stats: estimateStats(width, height, this.data.beadSize)
    }, () => this.persistSizeDraft());
  },

  onHeightInput(event) {
    const height = toPositiveInt(event.detail.value, this.data.height);
    const width = this.data.keepRatio
      ? clampDimension(height * this.data.cropRatio)
      : this.data.width;
    this.setData({
      selectedRecommendationId: '',
      width,
      height,
      stats: estimateStats(width, height, this.data.beadSize)
    }, () => this.persistSizeDraft());
  },

  stepDimension(event) {
    const field = event.currentTarget.dataset.field;
    const delta = Number(event.currentTarget.dataset.delta || 0);
    if (field !== 'width' && field !== 'height') return;
    const next = toPositiveInt(this.data[field] + delta, this.data[field]);
    let width = field === 'width' ? next : this.data.width;
    let height = field === 'height' ? next : this.data.height;
    if (this.data.keepRatio) {
      if (field === 'width') height = clampDimension(width / this.data.cropRatio);
      if (field === 'height') width = clampDimension(height * this.data.cropRatio);
    }
    this.setData({
      selectedRecommendationId: '',
      width,
      height,
      stats: estimateStats(width, height, this.data.beadSize)
    }, () => this.persistSizeDraft());
  },

  toggleKeepRatio() {
    const keepRatio = !this.data.keepRatio;
    let width = this.data.width;
    let height = this.data.height;
    if (keepRatio) {
      height = clampDimension(width / this.data.cropRatio);
    }
    this.setData({
      selectedRecommendationId: '',
      keepRatio,
      width,
      height,
      stats: estimateStats(width, height, this.data.beadSize)
    }, () => this.persistSizeDraft());
  },

  analyzeSmartRecommendation(draft) {
    if (!isValidDraft(draft)) return;
    this.setData({ recommendationLoading: true });
    const sourceCrop = getSourceCrop(draft);
    const size = RECOMMEND_CANVAS_SIZE;
    this.setData({ analysisCanvasSize: size }, () => {
      const ctx = wx.createCanvasContext('recommendCanvas', this);
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(draft.imagePath, sourceCrop.sx, sourceCrop.sy, sourceCrop.sw, sourceCrop.sh, 0, 0, size, size);
      ctx.draw(false, () => {
        wx.canvasGetImageData({
          canvasId: 'recommendCanvas',
          x: 0,
          y: 0,
          width: size,
          height: size,
          success: (res) => {
            this.smartAnalysis = analyzeImageData(res.data, size, size);
            this.refreshSmartRecommendations(this.shouldAutoApplyRecommendation !== false);
          },
          fail: () => {
            this.setData({
              recommendationLoading: false,
              recommendationSummary: '暂时无法分析，已使用默认尺寸'
            });
          }
        }, this);
      });
    });
  },

  refreshSmartRecommendations(autoApply) {
    if (!this.smartAnalysis) return;
    const result = buildSizeRecommendations(this.smartAnalysis, this.data.cropRatio, this.data.beadSize);
    const recommended = result.options.find((item) => item.active) || result.options[0];
    this.setData({
      recommendationLoading: false,
      recommendationSummary: result.summary,
      recommendationScoreText: result.scoreText,
      sizeRecommendations: result.options,
      primaryRecommendation: recommended || null,
      selectedRecommendationId: autoApply && recommended ? recommended.id : this.data.selectedRecommendationId
    }, () => {
      if (autoApply && recommended) {
        this.applyRecommendationOption(recommended);
      }
    });
  },

  applyRecommendation(event) {
    const id = event.currentTarget.dataset.id;
    const option = this.data.sizeRecommendations.find((item) => item.id === id);
    if (option) this.applyRecommendationOption(option);
  },

  applyPrimaryRecommendation() {
    if (this.data.primaryRecommendation) {
      haptic.tap();
      this.applyRecommendationOption(this.data.primaryRecommendation);
    }
  },

  applyRecommendationOption(option) {
    this.setData({
      selectedRecommendationId: option.id,
      width: option.width,
      height: option.height,
      beadSize: option.beadSize,
      stats: estimateStats(option.width, option.height, option.beadSize)
    }, () => this.persistSizeDraft());
  },

  persistSizeDraft() {
    const draft = wx.getStorageSync(DRAFT_KEY);
    if (!isValidDraft(draft)) return;
    try {
      wx.setStorageSync(DRAFT_KEY, Object.assign({}, draft, {
        draftType: 'upload',
        stage: 'size',
        sizeDraft: {
          width: this.data.width,
          height: this.data.height,
          beadSize: this.data.beadSize,
          keepRatio: this.data.keepRatio
        },
        updatedAt: Date.now()
      }));
    } catch (error) {}
  },

  goCrop() {
    wx.redirectTo({ url: '/pages/upload/upload?recrop=1' });
  },

  goHome() {
    if (wx.reLaunch) {
      wx.reLaunch({ url: '/pages/home/home' });
      return;
    }
    wx.redirectTo({ url: '/pages/home/home' });
  },

  generatePattern() {
    if (this.data.generating) return;
    const draft = wx.getStorageSync(DRAFT_KEY);
    if (!isValidDraft(draft)) {
      wx.showToast({ title: '请先上传图片', icon: 'none' });
      return;
    }
    const width = toPositiveInt(this.data.width, 29);
    const height = toPositiveInt(this.data.height, 29);
    if (width * height > MAX_GENERATE_CELLS) {
      wx.showToast({ title: '尺寸过大，请降低宽高', icon: 'none' });
      return;
    }
    haptic.tap();
    this.setData({
      generating: true,
      generateStage: '正在像素化...',
      canvasWidth: width,
      canvasHeight: height
    }, () => {
      const sourceCrop = getSourceCrop(draft);
      const ctx = wx.createCanvasContext('sourceCanvas', this);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(draft.imagePath, sourceCrop.sx, sourceCrop.sy, sourceCrop.sw, sourceCrop.sh, 0, 0, width, height);
      ctx.draw(false, () => {
        this.setData({ generateStage: '正在匹配色号...' });
        wx.canvasGetImageData({
          canvasId: 'sourceCanvas',
          x: 0,
          y: 0,
          width,
          height,
          success: (res) => {
            const averageGrid = imageDataToAverageGrid(res.data, width, height, width, height);
            const mapped = mapAverageGridToPalette(averageGrid, DEFAULT_PALETTE_ID);
            this.setData({ generateStage: '正在生成清单...' });
            const project = createProject({
              type: 'generated',
              sourceImage: draft.imagePath,
              crop: Object.assign({}, draft.crop, sourceCrop),
              width,
              height,
              beadSize: this.data.beadSize,
              paletteId: DEFAULT_PALETTE_ID,
              defaultPaletteId: DEFAULT_PALETTE_ID,
              averageGrid,
              cells: mapped.cells,
              colorStats: mapped.colorStats
            });
            try {
              wx.setStorageSync(CURRENT_PROJECT_KEY, project);
            } catch (error) {
              this.setData({ generating: false, generateStage: '' });
              wx.showModal({
                title: '生成失败',
                content: '本地存储空间不足，请降低图纸尺寸后重试。',
                showCancel: false
              });
              return;
            }
            try {
              wx.setStorageSync(DRAFT_KEY, Object.assign({}, draft, {
                draftType: 'upload',
                stage: 'result',
                completedAt: Date.now(),
                updatedAt: Date.now()
              }));
            } catch (error) {}
            haptic.success();
            this.setData({ generating: false, generateStage: '' });
            wx.redirectTo({ url: '/pages/result/result' });
          },
          fail: () => {
            this.setData({ generating: false, generateStage: '' });
            wx.showModal({
              title: '生成失败',
              content: '图片数据读取失败，请换一张图片或降低尺寸后重试',
              showCancel: false
            });
          }
        }, this);
      });
    });
  }
});
