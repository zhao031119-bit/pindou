const { averagePixels, nearestColor, rgbToLab } = require('../../miniprogram/utils/color');
const { listPalettes, getPalette } = require('../../miniprogram/utils/palettes');
const { getPaletteIcon } = require('../../miniprogram/utils/palette-icons');
const { getHeaderStyle } = require('../../miniprogram/utils/layout');
const { chooseOneImage } = require('../../miniprogram/utils/media');
const haptic = require('../../miniprogram/utils/haptic');

const SAMPLE_SIZE_OPTIONS = [
  { id: 1, label: '精准 1px' },
  { id: 5, label: '小 5px' },
  { id: 9, label: '大 9px' }
];

const LOUPE_SIZE = 88;
const LOUPE_ZOOM = 2.4;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getPoint(touch) {
  if (!touch) return null;
  return {
    x: Number(touch.x !== undefined ? touch.x : touch.pageX),
    y: Number(touch.y !== undefined ? touch.y : touch.pageY)
  };
}

function touchCenter(touches) {
  const a = getPoint(touches[0]);
  const b = getPoint(touches[1]);
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2
  };
}

function touchDistance(touches) {
  const a = getPoint(touches[0]);
  const b = getPoint(touches[1]);
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function makeLoupeImageStyle(drawRect, x, y) {
  if (!drawRect) return '';
  const width = Math.round(drawRect.width * LOUPE_ZOOM);
  const height = Math.round(drawRect.height * LOUPE_ZOOM);
  const left = Math.round(LOUPE_SIZE / 2 - (x - drawRect.x) * LOUPE_ZOOM);
  const top = Math.round(LOUPE_SIZE / 2 - (y - drawRect.y) * LOUPE_ZOOM);
  return `width: ${width}px; height: ${height}px; left: ${left}px; top: ${top}px;`;
}

Page({
  data: {
    navStyle: '',
    imagePath: '',
    imageWidth: 0,
    imageHeight: 0,
    canvasWidth: 320,
    canvasHeight: 320,
    drawRect: null,
    picked: null,
    pickedRgb: '',
    matches: [],
    recentPicks: [],
    markerLeft: 0,
    markerTop: 0,
    showLoupe: false,
    loupeImageStyle: '',
    sampleSize: 5,
    sampleSizeOptions: SAMPLE_SIZE_OPTIONS,
    zoom: 1,
    zoomLabel: '100%',
    canZoomIn: true,
    canZoomOut: false,
    pickerMode: 'pick'
  },

  selectSampleSize(event) {
    haptic.tap();
    const id = Number(event.currentTarget.dataset.id) || 1;
    this.setData({ sampleSize: id });
    if (this.data.picked && this.data.markerLeft && this.data.markerTop) {
      this.pickAt(this.data.markerLeft, this.data.markerTop);
    }
  },

  recallPick(event) {
    haptic.tap();
    const hex = event.currentTarget.dataset.hex;
    const item = this.data.recentPicks.find((p) => p.hex === hex);
    if (!item) return;
    const picked = Object.assign({}, item);
    this.setData({
      picked,
      pickedRgb: picked.r + ',' + picked.g + ',' + picked.b,
      matches: this.makeMatches(picked)
    });
  },

  onLoad() {
    this.setData({ navStyle: getHeaderStyle(18) });
  },

  onReady() {
    this.updateCanvasSize();
  },

  updateCanvasSize() {
    wx.createSelectorQuery()
      .in(this)
      .select('.picker-canvas-shell')
      .boundingClientRect((rect) => {
        if (!rect) return;
        const size = Math.round(rect.width);
        this.setData({ canvasWidth: size, canvasHeight: size }, () => {
          if (this.data.imagePath) this.drawImage();
        });
      })
      .exec();
  },

  chooseImage() {
    chooseOneImage((path) => {
      wx.getImageInfo({
        src: path,
        success: (info) => {
          this.zoom = 1;
          this.panX = 0;
          this.panY = 0;
          this.setData({
            imagePath: path,
            imageWidth: info.width,
            imageHeight: info.height,
            picked: null,
            pickedRgb: '',
            matches: [],
            showLoupe: false,
            loupeImageStyle: '',
            zoom: 1,
            zoomLabel: '100%',
            canZoomIn: true,
            canZoomOut: false,
            pickerMode: 'pick'
          }, () => this.drawImage());
        },
        fail() {
          wx.showToast({ title: '图片读取失败', icon: 'none' });
        }
      });
    });
  },

  drawImage() {
    const { imagePath, imageWidth, imageHeight, canvasWidth, canvasHeight } = this.data;
    if (!imagePath || !imageWidth || !imageHeight) return;
    const zoom = this.zoom || this.data.zoom || 1;
    const pan = this.clampPan(zoom, this.panX || 0, this.panY || 0);
    this.panX = pan.x;
    this.panY = pan.y;
    const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight) * zoom;
    const drawW = imageWidth * scale;
    const drawH = imageHeight * scale;
    const drawX = (canvasWidth - drawW) / 2 + this.panX;
    const drawY = (canvasHeight - drawH) / 2 + this.panY;
    const nextDrawRect = { x: drawX, y: drawY, width: drawW, height: drawH };
    const ctx = wx.createCanvasContext('pickerCanvas', this);
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(imagePath, drawX, drawY, drawW, drawH);
    ctx.draw(false, () => {
      this.setData({
        drawRect: nextDrawRect,
        loupeImageStyle: this.data.showLoupe
          ? makeLoupeImageStyle(nextDrawRect, this.data.markerLeft, this.data.markerTop)
          : '',
        zoom,
        zoomLabel: Math.round(zoom * 100) + '%',
        canZoomIn: zoom < 5,
        canZoomOut: zoom > 1
      });
    });
  },

  onCanvasTap(event) {
    if (this.data.pickerMode === 'pan') return;
    const touch = event.detail && event.detail.x !== undefined
      ? event.detail
      : (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]);
    const point = getPoint(touch);
    if (point) this.pickAt(point.x, point.y);
  },

  onCanvasTouchStart(event) {
    const touches = event.touches || [];
    if (touches.length >= 2) {
      const center = touchCenter(touches);
      this.gesture = {
        type: 'pinch',
        distance: touchDistance(touches),
        zoom: this.zoom || this.data.zoom || 1,
        imagePoint: this.screenToImage(center)
      };
      return;
    }
    const point = getPoint(touches[0]);
    if (!point) return;
    this.touchStart = {
      x: point.x,
      y: point.y,
      panX: this.panX || 0,
      panY: this.panY || 0
    };
    if (this.data.pickerMode === 'pick') {
      this.updateMarker(point.x, point.y);
      this.schedulePick(point.x, point.y);
    }
  },

  onCanvasTouchMove(event) {
    const touches = event.touches || [];
    if (touches.length >= 2 && this.gesture && this.gesture.type === 'pinch') {
      const distance = touchDistance(touches);
      const center = touchCenter(touches);
      const zoom = clamp(this.gesture.zoom * distance / Math.max(1, this.gesture.distance), 1, 5);
      this.setZoomAround(zoom, center, this.gesture.imagePoint);
      return;
    }
    const touch = event.touches && event.touches[0];
    const point = getPoint(touch);
    if (!point) return;
    if (this.data.pickerMode === 'pan') {
      const start = this.touchStart || { x: point.x, y: point.y, panX: this.panX || 0, panY: this.panY || 0 };
      const pan = this.clampPan(this.zoom || this.data.zoom || 1, start.panX + point.x - start.x, start.panY + point.y - start.y);
      this.panX = pan.x;
      this.panY = pan.y;
      this.viewChanged = true;
      this.drawImage();
      return;
    }
    this.updateMarker(point.x, point.y);
    this.schedulePick(point.x, point.y);
  },

  onCanvasTouchEnd() {
    if (this.viewChanged && this.data.picked) {
      const x = this.data.markerLeft;
      const y = this.data.markerTop;
      setTimeout(() => this.schedulePick(x, y), 40);
    }
    this.viewChanged = false;
    this.gesture = null;
    this.touchStart = null;
  },

  schedulePick(x, y) {
    this.pendingPick = { x, y };
    const now = Date.now();
    const wait = Math.max(0, 36 - (now - (this.lastPickAt || 0)));
    if (this.pickTimer) clearTimeout(this.pickTimer);
    if (!wait) {
      this.flushPendingPick();
      return;
    }
    this.pickTimer = setTimeout(() => this.flushPendingPick(), wait);
  },

  flushPendingPick() {
    const pending = this.pendingPick;
    if (!pending) return;
    this.pendingPick = null;
    this.lastPickAt = Date.now();
    this.pickAt(pending.x, pending.y);
  },

  pickAt(x, y) {
    const { imagePath, drawRect, canvasWidth, canvasHeight, sampleSize } = this.data;
    if (!imagePath || !drawRect) return;
    const px = Math.max(0, Math.min(canvasWidth - 1, Math.round(x)));
    const py = Math.max(0, Math.min(canvasHeight - 1, Math.round(y)));
    if (
      px < drawRect.x ||
      py < drawRect.y ||
      px > drawRect.x + drawRect.width ||
      py > drawRect.y + drawRect.height
    ) {
      return;
    }
    this.updateMarker(px, py);
    const half = Math.floor(sampleSize / 2);
    const sx = Math.max(0, Math.ceil(drawRect.x), px - half);
    const sy = Math.max(0, Math.ceil(drawRect.y), py - half);
    const right = Math.min(Math.floor(drawRect.x + drawRect.width), px + half + 1, canvasWidth);
    const bottom = Math.min(Math.floor(drawRect.y + drawRect.height), py + half + 1, canvasHeight);
    const sw = Math.max(1, right - sx);
    const sh = Math.max(1, bottom - sy);
    const requestId = (this.pickRequestId || 0) + 1;
    this.pickRequestId = requestId;
    wx.canvasGetImageData({
      canvasId: 'pickerCanvas',
      x: sx,
      y: sy,
      width: sw,
      height: sh,
      success: (res) => {
        if (requestId !== this.pickRequestId) return;
        const avg = averagePixels(res.data, sw, sh, 0, 0, sw, sh);
        const picked = Object.assign({}, avg, {
          lab: rgbToLab(avg.r, avg.g, avg.b)
        });
        const matches = this.makeMatches(picked);
        const recentPicks = this.data.recentPicks.filter((item) => item.hex !== picked.hex).slice(0, 4);
        recentPicks.unshift({ hex: picked.hex, r: picked.r, g: picked.g, b: picked.b, lab: picked.lab });
        if (recentPicks.length > 5) recentPicks.length = 5;
        this.setData({
          picked,
          pickedRgb: picked.r + ',' + picked.g + ',' + picked.b,
          matches,
          recentPicks,
          markerLeft: px,
          markerTop: py
        });
      },
      fail() {
        wx.showToast({ title: '取色失败', icon: 'none' });
      }
    }, this);
  },

  updateMarker(x, y) {
    const { drawRect, canvasWidth, canvasHeight } = this.data;
    if (!drawRect) return false;
    const px = Math.max(0, Math.min(canvasWidth - 1, Math.round(x)));
    const py = Math.max(0, Math.min(canvasHeight - 1, Math.round(y)));
    if (px < drawRect.x || py < drawRect.y || px > drawRect.x + drawRect.width || py > drawRect.y + drawRect.height) {
      if (this.data.showLoupe) this.setData({ showLoupe: false });
      return false;
    }
    this.setData({
      markerLeft: px,
      markerTop: py,
      showLoupe: true,
      loupeImageStyle: makeLoupeImageStyle(drawRect, px, py)
    });
    return true;
  },

  clampPan(zoom, panX, panY) {
    const { imageWidth, imageHeight, canvasWidth, canvasHeight } = this.data;
    if (!imageWidth || !imageHeight) return { x: 0, y: 0 };
    const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight) * zoom;
    const drawW = imageWidth * scale;
    const drawH = imageHeight * scale;
    const maxX = Math.max(0, (drawW - canvasWidth) / 2);
    const maxY = Math.max(0, (drawH - canvasHeight) / 2);
    return {
      x: drawW <= canvasWidth ? 0 : clamp(panX, -maxX, maxX),
      y: drawH <= canvasHeight ? 0 : clamp(panY, -maxY, maxY)
    };
  },

  screenToImage(point) {
    const { drawRect, imageWidth, imageHeight } = this.data;
    if (!drawRect || !imageWidth || !imageHeight) {
      return { x: imageWidth / 2, y: imageHeight / 2 };
    }
    return {
      x: clamp((point.x - drawRect.x) / drawRect.width * imageWidth, 0, imageWidth),
      y: clamp((point.y - drawRect.y) / drawRect.height * imageHeight, 0, imageHeight)
    };
  },

  setZoomAround(zoom, anchor, imagePoint) {
    const { imageWidth, imageHeight, canvasWidth, canvasHeight } = this.data;
    if (!imageWidth || !imageHeight) return;
    const nextZoom = clamp(zoom, 1, 5);
    const point = imagePoint || this.screenToImage(anchor);
    const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight) * nextZoom;
    const drawW = imageWidth * scale;
    const drawH = imageHeight * scale;
    const baseX = (canvasWidth - drawW) / 2;
    const baseY = (canvasHeight - drawH) / 2;
    const pan = this.clampPan(nextZoom, anchor.x - point.x * scale - baseX, anchor.y - point.y * scale - baseY);
    this.zoom = nextZoom;
    this.panX = pan.x;
    this.panY = pan.y;
    this.viewChanged = true;
    this.drawImage();
  },

  zoomIn() {
    const zoom = this.zoom || this.data.zoom || 1;
    const anchor = this.data.picked
      ? { x: this.data.markerLeft, y: this.data.markerTop }
      : { x: this.data.canvasWidth / 2, y: this.data.canvasHeight / 2 };
    this.setZoomAround(Math.min(5, zoom * 1.5), anchor);
  },

  zoomOut() {
    const zoom = this.zoom || this.data.zoom || 1;
    const anchor = this.data.picked
      ? { x: this.data.markerLeft, y: this.data.markerTop }
      : { x: this.data.canvasWidth / 2, y: this.data.canvasHeight / 2 };
    this.setZoomAround(Math.max(1, zoom / 1.5), anchor);
  },

  resetZoom() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.drawImage();
  },

  togglePickerMode() {
    haptic.tap();
    this.setData({ pickerMode: this.data.pickerMode === 'pick' ? 'pan' : 'pick' });
  },

  makeMatches(color) {
    return listPalettes().map((meta) => {
      const match = nearestColor(color, getPalette(meta.id));
      return {
        paletteId: meta.id,
        paletteName: meta.name,
        icon: getPaletteIcon(meta.id),
        verified: meta.verified,
        code: match.color.code,
        name: match.color.name,
        hex: match.color.hex,
        distanceValue: match.distance,
        distance: match.distance.toFixed(1)
      };
    }).sort((a, b) => a.distanceValue - b.distanceValue);
  },

  goBack() {
    wx.navigateBack({
      fail: () => this.goHome()
    });
  },

  goHome() {
    if (wx.reLaunch) {
      wx.reLaunch({ url: '/pages/home/home' });
      return;
    }
    wx.redirectTo({ url: '/pages/home/home' });
  }
});
