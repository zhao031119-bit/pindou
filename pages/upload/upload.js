const { getHeaderStyle } = require('../../miniprogram/utils/layout');
const { STORAGE_KEYS } = require('../../miniprogram/utils/constants');
const haptic = require('../../miniprogram/utils/haptic');

const DRAFT_KEY = STORAGE_KEYS.UPLOAD_DRAFT;
const MAX_ZOOM = 6;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function inferImageFormat(path, info) {
  if (info && info.type) return String(info.type).toUpperCase();
  const match = String(path || '').match(/\.([a-z0-9]+)(?:\?|$)/i);
  return match ? match[1].toUpperCase() : '图片';
}

function persistImageFile(tempPath, callback) {
  if (!wx.saveFile) {
    callback(tempPath);
    return;
  }
  wx.saveFile({
    tempFilePath: tempPath,
    success(res) {
      callback(res.savedFilePath || tempPath);
    },
    fail() {
      callback(tempPath);
    }
  });
}

function makeCrop(stageWidth, stageHeight) {
  return { x: 0, y: 0, width: stageWidth, height: stageHeight };
}

function getCoverScale(imageInfo, crop) {
  return Math.max(crop.width / imageInfo.width, crop.height / imageInfo.height);
}

function clampImageRect(rect, imageInfo, crop) {
  const minScale = getCoverScale(imageInfo, crop);
  const scale = clamp(rect.width / imageInfo.width, minScale, minScale * MAX_ZOOM);
  const width = imageInfo.width * scale;
  const height = imageInfo.height * scale;
  const minX = crop.x + crop.width - width;
  const minY = crop.y + crop.height - height;
  return {
    x: width <= crop.width ? crop.x + (crop.width - width) / 2 : clamp(rect.x, minX, crop.x),
    y: height <= crop.height ? crop.y + (crop.height - height) / 2 : clamp(rect.y, minY, crop.y),
    width,
    height
  };
}

function fitImageToCrop(imageInfo, crop) {
  const scale = getCoverScale(imageInfo, crop);
  return clampImageRect({
    x: crop.x + (crop.width - imageInfo.width * scale) / 2,
    y: crop.y + (crop.height - imageInfo.height * scale) / 2,
    width: imageInfo.width * scale,
    height: imageInfo.height * scale
  }, imageInfo, crop);
}

function sourceCropToImageRect(sourceCrop, imageInfo, crop) {
  if (!sourceCrop || Number(sourceCrop.sw) <= 0 || Number(sourceCrop.sh) <= 0) return null;
  const sx = Number(sourceCrop.sx) || 0;
  const sy = Number(sourceCrop.sy) || 0;
  const sw = Number(sourceCrop.sw) || imageInfo.width;
  const sh = Number(sourceCrop.sh) || imageInfo.height;
  const scale = Math.max(crop.width / sw, crop.height / sh);
  const centerX = (sx + sw / 2) * scale;
  const centerY = (sy + sh / 2) * scale;
  return clampImageRect({
    x: crop.x + crop.width / 2 - centerX,
    y: crop.y + crop.height / 2 - centerY,
    width: imageInfo.width * scale,
    height: imageInfo.height * scale
  }, imageInfo, crop);
}

function displayCropToSource(imageInfo, crop, imageRect) {
  const scale = imageRect.width / imageInfo.width;
  const sw = Math.min(imageInfo.width, crop.width / scale);
  const sh = Math.min(imageInfo.height, crop.height / scale);
  const sx = clamp((crop.x - imageRect.x) / scale, 0, imageInfo.width - sw);
  const sy = clamp((crop.y - imageRect.y) / scale, 0, imageInfo.height - sh);
  return { sx, sy, sw: Math.max(1, sw), sh: Math.max(1, sh) };
}

function touchPoint(touch) {
  return {
    pageX: Number(touch.pageX !== undefined ? touch.pageX : touch.clientX),
    pageY: Number(touch.pageY !== undefined ? touch.pageY : touch.clientY)
  };
}

function touchDistance(touches) {
  const a = touchPoint(touches[0]);
  const b = touchPoint(touches[1]);
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
}

Page({
  data: {
    navStyle: '',
    imagePath: '',
    imageInfo: null,
    imageFormat: '图片',
    stageWidth: 320,
    stageHeight: 320,
    maxStageHeight: 640,
    imageRect: { x: 0, y: 0, width: 320, height: 320 },
    crop: { x: 0, y: 0, width: 320, height: 320 },
    cropZoomLabel: '100%'
  },

  onLoad(options) {
    this.setData({ navStyle: getHeaderStyle(18) });
    const info = wx.getSystemInfoSync();
    const stageWidth = Math.min(info.windowWidth - 28, 360);
    const maxStageHeight = Math.min(480, Math.max(stageWidth, Math.floor((info.windowHeight || 720) * 0.48)));
    this.setData({
      stageWidth,
      stageHeight: stageWidth,
      maxStageHeight,
      crop: makeCrop(stageWidth, stageWidth),
      imageRect: { x: 0, y: 0, width: stageWidth, height: stageWidth }
    });

    if (options && options.recrop === '1') {
      const draft = wx.getStorageSync(DRAFT_KEY);
      if (draft && draft.imagePath) {
        this.prepareImage(draft.imagePath, null, draft.sourceCrop || draft.crop);
      }
    }
  },

  chooseFromAlbum() {
    this.chooseImage(['album']);
  },

  takePhoto() {
    this.chooseImage(['camera']);
  },

  replaceImage() {
    this.chooseImage(['album', 'camera']);
  },

  chooseImage(sourceType) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType,
      success: (res) => {
        persistImageFile(res.tempFilePaths[0], (path) => this.prepareImage(path));
      }
    });
  },

  prepareImage(path, savedCrop, savedSourceCrop) {
    wx.getImageInfo({
      src: path,
      success: (info) => {
        const stageWidth = this.data.stageWidth;
        const sourceRatio = savedSourceCrop && Number(savedSourceCrop.sw) > 0 && Number(savedSourceCrop.sh) > 0
          ? Number(savedSourceCrop.sh) / Number(savedSourceCrop.sw)
          : info.height / info.width;
        const naturalRatioHeight = Math.round(stageWidth * sourceRatio);
        const stageHeight = clamp(naturalRatioHeight, Math.round(stageWidth * 0.72), this.data.maxStageHeight);
        const crop = makeCrop(stageWidth, stageHeight);
        const restoredRect = sourceCropToImageRect(savedSourceCrop, info, crop);
        const imageRect = restoredRect || fitImageToCrop(info, crop);
        this.setData({
          imagePath: path,
          imageInfo: info,
          imageFormat: inferImageFormat(path, info),
          stageHeight,
          crop,
          imageRect,
          cropZoomLabel: this.makeZoomLabel(imageRect, info, crop)
        });
      },
      fail: () => {
        wx.showToast({ title: '图片读取失败', icon: 'none' });
      }
    });
  },

  makeZoomLabel(rect, imageInfo, crop) {
    if (!imageInfo || !crop) return '100%';
    const base = getCoverScale(imageInfo, crop);
    const zoom = rect.width / imageInfo.width / base;
    return Math.round(zoom * 100) + '%';
  },

  resetCrop() {
    const imageRect = fitImageToCrop(this.data.imageInfo, this.data.crop);
    this.setData({
      imageRect,
      cropZoomLabel: this.makeZoomLabel(imageRect, this.data.imageInfo, this.data.crop)
    });
  },

  onCropStart(event) {
    if (!this.data.imagePath) return;
    const touches = event.touches || [];
    if (touches.length >= 2) {
      this.cropGesture = {
        type: 'pinch',
        distance: touchDistance(touches),
        rect: Object.assign({}, this.data.imageRect)
      };
      return;
    }
    const point = touchPoint(touches[0]);
    this.cropGesture = {
      type: 'pan',
      pageX: point.pageX,
      pageY: point.pageY,
      rect: Object.assign({}, this.data.imageRect)
    };
  },

  onCropMove(event) {
    const gesture = this.cropGesture;
    if (!gesture || !this.data.imageInfo) return;
    const touches = event.touches || [];
    let imageRect;
    if (touches.length >= 2 && gesture.type === 'pinch') {
      const ratio = touchDistance(touches) / Math.max(1, gesture.distance);
      const crop = this.data.crop;
      const anchorX = crop.x + crop.width / 2;
      const anchorY = crop.y + crop.height / 2;
      imageRect = {
        x: anchorX - (anchorX - gesture.rect.x) * ratio,
        y: anchorY - (anchorY - gesture.rect.y) * ratio,
        width: gesture.rect.width * ratio,
        height: gesture.rect.height * ratio
      };
    } else if (gesture.type === 'pan' && touches[0]) {
      const point = touchPoint(touches[0]);
      imageRect = {
        x: gesture.rect.x + point.pageX - gesture.pageX,
        y: gesture.rect.y + point.pageY - gesture.pageY,
        width: gesture.rect.width,
        height: gesture.rect.height
      };
    } else {
      return;
    }
    const clamped = clampImageRect(imageRect, this.data.imageInfo, this.data.crop);
    this.setData({
      imageRect: clamped,
      cropZoomLabel: this.makeZoomLabel(clamped, this.data.imageInfo, this.data.crop)
    });
  },

  onCropEnd() {
    this.cropGesture = null;
  },

  goHome() {
    if (wx.reLaunch) {
      wx.reLaunch({ url: '/pages/home/home' });
      return;
    }
    wx.redirectTo({ url: '/pages/home/home' });
  },

  goBack() {
    wx.navigateBack({
      fail: () => this.goHome()
    });
  },

  goSize() {
    if (!this.data.imagePath) {
      wx.showToast({ title: '请先选择图片', icon: 'none' });
      return;
    }
    haptic.tap();
    try {
      const sourceCrop = displayCropToSource(
        this.data.imageInfo,
        this.data.crop,
        this.data.imageRect
      );
      wx.setStorageSync(DRAFT_KEY, {
        draftType: 'upload',
        stage: 'size',
        imagePath: this.data.imagePath,
        thumbnailPath: this.data.imagePath,
        imageInfo: this.data.imageInfo,
        crop: this.data.crop,
        sourceCrop,
        imageRect: this.data.imageRect,
        stageWidth: this.data.stageWidth,
        stageHeight: this.data.stageHeight,
        updatedAt: Date.now()
      });
    } catch (error) {
      wx.showModal({
        title: '无法继续',
        content: '本地缓存空间不足，请清理微信缓存或重启后再试。',
        showCancel: false
      });
      return;
    }
    wx.redirectTo({ url: '/pages/size/size' });
  }
});
