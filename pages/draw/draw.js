const { DEFAULT_PALETTE_ID, DRAW_SIZE_PRESETS, STORAGE_KEYS } = require('../../miniprogram/utils/constants');
const { listPalettes, getPalette, getPaletteName, isPaletteVerified } = require('../../miniprogram/utils/palettes');
const { createProject } = require('../../miniprogram/utils/pattern');
const { saveProject: persistProject, getProject } = require('../../miniprogram/utils/store');
const { drawPattern, drawLegend, makePatternExportLayout, saveCanvasToAlbum } = require('../../miniprogram/utils/render');
const { hexToRgb } = require('../../miniprogram/utils/color');
const { getPageTopStyle, getHeaderStyle } = require('../../miniprogram/utils/layout');
const { makePaletteIconOptions } = require('../../miniprogram/utils/palette-icons');
const haptic = require('../../miniprogram/utils/haptic');

const MAX_HISTORY = 30;
const DRAW_DRAFT_KEY = STORAGE_KEYS.DRAW_DRAFT;
const DEFAULT_SIZE = DRAW_SIZE_PRESETS.find((item) => item.width === 29) || DRAW_SIZE_PRESETS[1];
const TOOLS = [
  { id: 'brush', label: '画笔', icon: 'brush' },
  { id: 'eraser', label: '橡皮', icon: 'eraser' },
  { id: 'fill', label: '填充', icon: 'fill' },
  { id: 'picker', label: '取色', icon: 'pipette' },
  { id: 'pan', label: '移动', icon: 'pan' }
];
const BRUSH_SIZES = [
  { id: 1, label: '1×1' },
  { id: 2, label: '2×2' },
  { id: 3, label: '3×3' }
];
const SYMMETRY_MODES = [
  { id: 'none', label: '关' },
  { id: 'h', label: '左右' },
  { id: 'v', label: '上下' },
  { id: 'both', label: '四向' }
];

function cloneCells(cells) {
  return cells.map((cell) => Object.assign({}, cell));
}

function colorToCell(color, x, y, index) {
  return {
    index,
    x,
    y,
    empty: !!color.empty,
    paletteId: color.paletteId || '',
    colorId: color.id || color.colorId || '',
    code: color.code || '',
    name: color.name || '',
    hex: color.hex || '#FFFFFF'
  };
}

function makeBlankColor() {
  return {
    id: 'blank-white',
    empty: true,
    paletteId: '',
    code: '',
    name: '',
    hex: '#FFFFFF'
  };
}

function makeCells(width, height) {
  const blank = makeBlankColor();
  const cells = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      cells.push(colorToCell(blank, x, y, index));
    }
  }
  return cells;
}

function normalizeCell(cell, index, width) {
  if (!cell) {
    return colorToCell(makeBlankColor(), index % width, Math.floor(index / width), index);
  }
  const x = cell.x === undefined ? index % width : cell.x;
  const y = cell.y === undefined ? Math.floor(index / width) : cell.y;
  const legacyBlank = cell.empty || cell.paletteId === 'blank' || cell.colorId === 'blank-white';
  if (legacyBlank) {
    return colorToCell(makeBlankColor(), x, y, index);
  }
  return Object.assign({}, cell, { index, x, y, empty: false });
}

function cellIdentity(cell) {
  if (!cell || cell.empty) return 'empty';
  return [cell.paletteId || '', cell.code || '', cell.hex || ''].join(':');
}

function hasPaintedCells(cells) {
  return Array.isArray(cells) && cells.some((cell) => cell && !cell.empty);
}

function removeDrawDraft() {
  if (!wx.removeStorageSync) return;
  try {
    wx.removeStorageSync(DRAW_DRAFT_KEY);
  } catch (error) {}
}

Page({
  data: {
    pageStyle: '',
    navStyle: '',
    sizes: DRAW_SIZE_PRESETS.filter((item) => [16, 29, 50, 100].indexOf(item.width) >= 0),
    sizeId: DEFAULT_SIZE.id,
    width: DEFAULT_SIZE.width,
    height: DEFAULT_SIZE.height,
    tools: TOOLS,
    tool: 'brush',
    brushSizes: BRUSH_SIZES,
    brushSize: 1,
    symmetryModes: SYMMETRY_MODES,
    symmetry: 'none',
    palettes: [],
    paletteId: DEFAULT_PALETTE_ID,
    colors: [],
    selectedColor: null,
    canvasSize: 320,
    zoomLabel: '100%',
    canUndo: false,
    canRedo: false,
    isSaved: false,
    saving: false,
    draftStatus: '',
    showGrid: true,
    exportWidth: 320,
    exportHeight: 420
  },

  onLoad(query) {
    this.setData({ pageStyle: getPageTopStyle(22), navStyle: getHeaderStyle(18) });
    this.cells = makeCells(DEFAULT_SIZE.width, DEFAULT_SIZE.height);
    this.history = [];
    this.redoStack = [];
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.currentProjectId = '';
    this.projectMeta = null;
    this.draftSaveTimer = null;
    this.manageDrawDraft = false;
    this.lastCellKey = '';
    this.gesture = null;
    this.dirtyCells = {};
    this.dirtyDrawTimer = null;
    this.fullDrawTimer = null;
    const palettes = makePaletteIconOptions(listPalettes(), getPalette);
    const colors = getPalette(DEFAULT_PALETTE_ID);
    this.setData({
      palettes,
      colors,
      selectedColor: colors[0]
    });
    this.initCanvasSize();
    if (query && query.id) {
      this.loadProject(query.id);
    } else if (query && query.draft === '1') {
      this.loadDrawDraft();
    } else {
      this.resetView();
    }
  },

  onHide() {
    this.saveDrawDraftNow();
  },

  onUnload() {
    this.saveDrawDraftNow();
  },

  initCanvasSize() {
    const info = wx.getSystemInfoSync();
    const maxByWidth = Math.floor((info.windowWidth || 360) - 36);
    const maxByHeight = Math.floor((info.windowHeight || 760) * 0.46);
    const canvasSize = Math.max(280, Math.min(maxByWidth, maxByHeight));
    this.setData({ canvasSize });
  },

  loadProject(id) {
    const project = getProject(id);
    if (!project) {
      this.resetView();
      return;
    }
    this.loadProjectData(project, { savedProject: true });
  },

  loadDrawDraft() {
    const draft = wx.getStorageSync(DRAW_DRAFT_KEY);
    if (!draft || !hasPaintedCells(draft.cells)) {
      removeDrawDraft();
      this.resetView();
      return;
    }
    this.manageDrawDraft = true;
    this.loadProjectData(draft, { draft: true });
  },

  loadProjectData(project, options) {
    const loadOptions = options || {};
    const width = Math.max(1, Number(project.width) || DEFAULT_SIZE.width);
    const height = Math.max(1, Number(project.height) || DEFAULT_SIZE.height);
    this.currentProjectId = loadOptions.draft ? '' : project.id;
    this.projectMeta = Object.assign({}, project, loadOptions.draft ? { id: '' } : {});
    const sourceCells = Array.isArray(project.cells) ? project.cells : [];
    this.cells = makeCells(width, height).map((cell, index) => normalizeCell(sourceCells[index] || cell, index, width));
    this.history = [];
    this.redoStack = [];
    const size = this.data.sizes.find((item) => item.width === width) || {
      id: 'custom',
      width,
      height
    };
    const colors = getPalette(project.paletteId || DEFAULT_PALETTE_ID);
    this.setData({
      sizeId: size.id,
      width: project.width,
      height: project.height,
      paletteId: project.paletteId || DEFAULT_PALETTE_ID,
      colors,
      selectedColor: colors[0],
      canUndo: false,
      canRedo: false
    });
    this.resetView();
  },

  pushHistory() {
    this.history.push(cloneCells(this.cells));
    if (this.history.length > MAX_HISTORY) {
      this.history.shift();
    }
    this.redoStack = [];
    this.updateHistoryState();
  },

  updateHistoryState() {
    this.setData({
      canUndo: this.history.length > 0,
      canRedo: this.redoStack.length > 0
    });
  },

  changeSize(event) {
    const id = event.currentTarget.dataset.id;
    const size = this.data.sizes.find((item) => item.id === id);
    if (!size || id === this.data.sizeId) return;
    const shrinking = size.width < this.data.width || size.height < this.data.height;
    wx.showModal({
      title: '切换画布',
      content: shrinking ? '缩小画布可能裁掉边缘内容，确定继续吗？' : '将保留现有内容并居中到新画布。',
      success: (res) => {
        if (!res.confirm) return;
        const oldCells = this.cells;
        const oldWidth = this.data.width;
        const oldHeight = this.data.height;
        const nextCells = makeCells(size.width, size.height);
        const dx = Math.floor((size.width - oldWidth) / 2);
        const dy = Math.floor((size.height - oldHeight) / 2);
        oldCells.forEach((cell) => {
          const nx = cell.x + dx;
          const ny = cell.y + dy;
          if (nx < 0 || ny < 0 || nx >= size.width || ny >= size.height) return;
          const index = ny * size.width + nx;
          nextCells[index] = Object.assign({}, cell, { x: nx, y: ny, index });
        });
        this.cells = nextCells;
        this.history = [];
        this.redoStack = [];
        this.currentProjectId = '';
        this.projectMeta = null;
        this.setData({
          sizeId: size.id,
          width: size.width,
          height: size.height,
          canUndo: false,
          canRedo: false
        });
        this.resetView();
        this.scheduleDrawDraftSave();
      }
    });
  },

  changePalette(event) {
    const paletteId = event.currentTarget.dataset.id;
    const colors = getPalette(paletteId);
    this.setData({
      paletteId,
      colors,
      selectedColor: colors[0]
    });
    this.scheduleDrawDraftSave();
    if (!isPaletteVerified(paletteId)) {
      wx.showToast({ title: '该色卡待校准', icon: 'none' });
    }
  },

  chooseColor(event) {
    haptic.tap();
    const color = this.data.colors[event.currentTarget.dataset.index];
    this.setData({
      selectedColor: color,
      tool: this.data.tool === 'eraser' ? 'brush' : this.data.tool
    });
  },

  chooseTool(event) {
    haptic.tap();
    this.setData({ tool: event.currentTarget.dataset.tool });
  },

  chooseBrushSize(event) {
    haptic.tap();
    const id = Number(event.currentTarget.dataset.id) || 1;
    this.setData({ brushSize: id });
  },

  chooseSymmetry(event) {
    haptic.tap();
    const id = event.currentTarget.dataset.id || 'none';
    this.setData({ symmetry: id });
  },

  resetView() {
    const padding = 14;
    const fit = (this.data.canvasSize - padding * 2) / Math.max(this.data.width, this.data.height);
    this.baseCell = fit;
    this.scale = 1;
    this.offsetX = (this.data.canvasSize - this.data.width * fit) / 2;
    this.offsetY = (this.data.canvasSize - this.data.height * fit) / 2;
    this.updateZoomLabel();
    this.drawCanvas();
  },

  toggleGrid() {
    this.setData({ showGrid: !this.data.showGrid }, () => this.drawCanvas());
  },

  updateZoomLabel() {
    this.setData({ zoomLabel: Math.round(this.scale * 100) + '%' });
  },

  pointToCell(point) {
    const size = this.baseCell * this.scale;
    const x = Math.floor((point.x - this.offsetX) / size);
    const y = Math.floor((point.y - this.offsetY) / size);
    if (x < 0 || y < 0 || x >= this.data.width || y >= this.data.height) return null;
    return { x, y, index: y * this.data.width + x };
  },

  requestFullDraw() {
    if (this.fullDrawTimer) return;
    this.fullDrawTimer = setTimeout(() => {
      this.fullDrawTimer = null;
      this.drawCanvas();
    }, 16);
  },

  queueDirtyDraw(cells) {
    if (!cells || !cells.length) return;
    cells.forEach((cell) => {
      this.dirtyCells[cell.index] = cell;
    });
    if (this.dirtyDrawTimer) return;
    this.dirtyDrawTimer = setTimeout(() => {
      this.dirtyDrawTimer = null;
      this.drawDirtyCells();
    }, 16);
  },

  onCanvasTouchStart(event) {
    if (event.touches.length >= 2) {
      this.gesture = this.makePinch(event.touches);
      return;
    }
    const point = event.touches[0];
    this.lastPoint = { x: point.x, y: point.y };
    this.lastCellKey = '';
    if (this.data.tool !== 'picker' && this.data.tool !== 'pan') {
      this.pushHistory();
    }
    this.applyToolAt(point);
  },

  onCanvasTouchMove(event) {
    if (event.touches.length >= 2 && this.gesture) {
      this.applyPinch(event.touches);
      return;
    }
    const point = event.touches[0];
    if (this.data.tool === 'pan') {
      this.offsetX += point.x - this.lastPoint.x;
      this.offsetY += point.y - this.lastPoint.y;
      this.lastPoint = { x: point.x, y: point.y };
      this.requestFullDraw();
      return;
    }
    if (this.data.tool === 'brush' || this.data.tool === 'eraser') {
      this.applyToolAt(point);
    }
  },

  onCanvasTouchEnd() {
    this.gesture = null;
    this.lastCellKey = '';
  },

  makePinch(touches) {
    const a = touches[0];
    const b = touches[1];
    return {
      distance: Math.hypot(a.x - b.x, a.y - b.y),
      scale: this.scale,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      centerX: (a.x + b.x) / 2,
      centerY: (a.y + b.y) / 2
    };
  },

  applyPinch(touches) {
    const a = touches[0];
    const b = touches[1];
    const distance = Math.hypot(a.x - b.x, a.y - b.y);
    const centerX = (a.x + b.x) / 2;
    const centerY = (a.y + b.y) / 2;
    const nextScale = Math.max(0.45, Math.min(8, this.gesture.scale * (distance / this.gesture.distance)));
    this.offsetX = centerX - ((this.gesture.centerX - this.gesture.offsetX) / this.gesture.scale) * nextScale;
    this.offsetY = centerY - ((this.gesture.centerY - this.gesture.offsetY) / this.gesture.scale) * nextScale;
    this.scale = nextScale;
    this.updateZoomLabel();
    this.requestFullDraw();
  },

  applyToolAt(point) {
    const cell = this.pointToCell(point);
    if (!cell) return;
    const key = cell.x + ',' + cell.y;
    if (key === this.lastCellKey && this.data.tool !== 'fill') return;
    this.lastCellKey = key;
    if (this.data.tool === 'picker') {
      const picked = this.cells[cell.index];
      if (picked.empty) {
        wx.showToast({ title: '这是空白格', icon: 'none' });
        this.setData({ tool: 'brush' });
        return;
      }
      this.setData({ selectedColor: picked, tool: 'brush' });
      return;
    }
    if (this.data.tool === 'fill') {
      this.fillCell(cell.index, this.data.selectedColor);
      this.drawCanvas();
      this.scheduleDrawDraftSave();
      return;
    }
    const color = this.data.tool === 'eraser' ? makeBlankColor() : this.data.selectedColor;
    const changed = this.paintBrushAt(cell.x, cell.y, color);
    if (changed.length) {
      this.queueDirtyDraw(changed);
      this.scheduleDrawDraftSave();
    }
  },

  paintBrushAt(centerX, centerY, color) {
    const brush = Math.max(1, Number(this.data.brushSize) || 1);
    const half = Math.floor(brush / 2);
    const width = this.data.width;
    const height = this.data.height;
    const symmetry = this.data.symmetry;
    const points = {};
    for (let dy = 0; dy < brush; dy += 1) {
      for (let dx = 0; dx < brush; dx += 1) {
        const px = centerX - half + dx;
        const py = centerY - half + dy;
        this.collectSymmetricPoints(points, px, py, width, height, symmetry);
      }
    }
    const changed = [];
    Object.keys(points).forEach((key) => {
      const [px, py] = key.split(',').map(Number);
      if (px < 0 || py < 0 || px >= width || py >= height) return;
      const index = py * width + px;
      const nextCell = colorToCell(color, px, py, index);
      if (cellIdentity(this.cells[index]) === cellIdentity(nextCell)) return;
      this.cells[index] = nextCell;
      changed.push(nextCell);
    });
    return changed;
  },

  collectSymmetricPoints(target, x, y, width, height, symmetry) {
    const add = (px, py) => {
      target[px + ',' + py] = true;
    };
    add(x, y);
    if (symmetry === 'h' || symmetry === 'both') add(width - 1 - x, y);
    if (symmetry === 'v' || symmetry === 'both') add(x, height - 1 - y);
    if (symmetry === 'both') add(width - 1 - x, height - 1 - y);
  },

  fillCell(startIndex, color) {
    const targetKey = cellIdentity(this.cells[startIndex]);
    const nextCell = colorToCell(color, this.cells[startIndex].x, this.cells[startIndex].y, startIndex);
    const nextKey = cellIdentity(nextCell);
    if (targetKey === nextKey) return;
    const width = this.data.width;
    const height = this.data.height;
    const stack = [startIndex];
    const seen = {};
    while (stack.length) {
      const index = stack.pop();
      if (seen[index] || !this.cells[index] || cellIdentity(this.cells[index]) !== targetKey) continue;
      seen[index] = true;
      const x = index % width;
      const y = Math.floor(index / width);
      this.cells[index] = colorToCell(color, x, y, index);
      if (x > 0) stack.push(index - 1);
      if (x < width - 1) stack.push(index + 1);
      if (y > 0) stack.push(index - width);
      if (y < height - 1) stack.push(index + width);
    }
  },

  undo() {
    if (!this.history.length) return;
    this.redoStack.push(cloneCells(this.cells));
    this.cells = this.history.pop();
    this.updateHistoryState();
    this.drawCanvas();
    this.scheduleDrawDraftSave();
  },

  redo() {
    if (!this.redoStack.length) return;
    this.history.push(cloneCells(this.cells));
    this.cells = this.redoStack.pop();
    this.updateHistoryState();
    this.drawCanvas();
    this.scheduleDrawDraftSave();
  },

  clearCanvas() {
    if (!hasPaintedCells(this.cells)) return;
    wx.showModal({
      title: '清空画布',
      content: '确定清空当前画豆图吗？',
      confirmColor: '#B84B3A',
      success: (res) => {
        if (!res.confirm) return;
        this.pushHistory();
        this.cells = makeCells(this.data.width, this.data.height);
        this.currentProjectId = '';
        this.projectMeta = null;
        this.setData({ isSaved: false });
        this.drawCanvas();
        this.scheduleDrawDraftSave();
      }
    });
  },

  drawSingleCell(ctx, cell, size) {
    const x = this.offsetX + cell.x * size;
    const y = this.offsetY + cell.y * size;
    if (x + size < 0 || y + size < 0 || x > this.data.canvasSize || y > this.data.canvasSize) return;
    ctx.setFillStyle(cell.hex);
    ctx.fillRect(x, y, Math.ceil(size), Math.ceil(size));
    if (this.data.showGrid && size >= 5) {
      ctx.setStrokeStyle('rgba(0,0,0,0.14)');
      ctx.strokeRect(x, y, size, size);
    }
  },

  drawDirtyCells() {
    const cells = Object.keys(this.dirtyCells || {}).map((key) => this.dirtyCells[key]);
    this.dirtyCells = {};
    if (!cells.length) return;
    const ctx = wx.createCanvasContext('drawCanvas', this);
    const size = this.baseCell * this.scale;
    cells.forEach((cell) => this.drawSingleCell(ctx, cell, size));
    ctx.draw(true);
  },

  drawCanvas() {
    this.dirtyCells = {};
    const ctx = wx.createCanvasContext('drawCanvas', this);
    const size = this.baseCell * this.scale;
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, this.data.canvasSize, this.data.canvasSize);
    this.cells.forEach((cell) => this.drawSingleCell(ctx, cell, size));
    ctx.draw();
  },

  buildProject() {
    const averageGrid = this.cells.map((cell) => {
      const rgb = hexToRgb(cell.hex);
      return {
        x: cell.x,
        y: cell.y,
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        hex: cell.hex
      };
    });
    const counts = {};
    this.cells.forEach((cell) => {
      if (cell.empty) return;
      const key = cell.paletteId + ':' + cell.code + ':' + cell.hex;
      if (!counts[key]) {
        counts[key] = {
          statKey: key,
          paletteId: cell.paletteId,
          colorId: cell.colorId,
          paletteName: getPaletteName(cell.paletteId),
          code: cell.code,
          name: cell.name,
          hex: cell.hex,
          count: 0
        };
      }
      counts[key].count += 1;
    });
    const colorStats = Object.keys(counts)
      .map((key) => counts[key])
      .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
    const meta = this.projectMeta || {};
    return createProject({
      id: this.currentProjectId || undefined,
      name: meta.name || ('画豆图 ' + this.data.width + 'x' + this.data.height),
      type: 'draw',
      sourceImage: meta.sourceImage || '',
      crop: meta.crop || null,
      width: this.data.width,
      height: this.data.height,
      beadSize: this.data.width >= 50 ? '2.6mm' : '5mm',
      paletteId: this.data.paletteId,
      defaultPaletteId: meta.defaultPaletteId || this.data.paletteId,
      averageGrid,
      cells: cloneCells(this.cells),
      colorStats,
      createdAt: meta.createdAt
    });
  },

  scheduleDrawDraftSave() {
    if (!this.manageDrawDraft && !hasPaintedCells(this.cells)) return;
    this.manageDrawDraft = true;
    if (!this.draftSaveTimer && this.data.draftStatus !== '草稿保存中...') {
      this.setData({ draftStatus: '草稿保存中...', isSaved: false });
    } else if (this.data.isSaved) {
      this.setData({ isSaved: false });
    }
    if (this.draftSaveTimer) clearTimeout(this.draftSaveTimer);
    this.draftSaveTimer = setTimeout(() => {
      this.draftSaveTimer = null;
      this.saveDrawDraftNow();
    }, 900);
  },

  saveDrawDraftNow() {
    if (this.draftSaveTimer) {
      clearTimeout(this.draftSaveTimer);
      this.draftSaveTimer = null;
    }
    if (!this.manageDrawDraft) return;
    if (!hasPaintedCells(this.cells)) {
      if (this.manageDrawDraft) removeDrawDraft();
      this.manageDrawDraft = false;
      this.setData({ draftStatus: '' });
      return;
    }
    this.manageDrawDraft = true;
    const project = this.buildProject();
    const draft = Object.assign({}, project, {
      id: 'draw-draft',
      draftType: 'draw',
      updatedAt: Date.now()
    });
    try {
      wx.setStorageSync(DRAW_DRAFT_KEY, draft);
      this.projectMeta = Object.assign({}, this.projectMeta || {}, {
        name: draft.name,
        sourceImage: draft.sourceImage,
        crop: draft.crop,
        defaultPaletteId: draft.defaultPaletteId,
        createdAt: draft.createdAt
      });
      const stamp = new Date(draft.updatedAt);
      const hh = String(stamp.getHours()).padStart(2, '0');
      const mm = String(stamp.getMinutes()).padStart(2, '0');
      this.setData({ draftStatus: '已自动保存草稿 ' + hh + ':' + mm });
    } catch (error) {
      this.setData({ draftStatus: '草稿保存失败' });
    }
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
  },

  saveProject() {
    if (this.data.saving) return;
    if (this.data.isSaved && this.currentProjectId) {
      wx.navigateTo({ url: '/pages/detail/detail?id=' + this.currentProjectId });
      return;
    }
    this.setData({ saving: true });
    const saved = persistProject(this.buildProject());
    if (!saved) {
      this.setData({ saving: false });
      wx.showModal({
        title: '保存失败',
        content: '本地存储空间不足，请删除一些旧作品后重试。',
        showCancel: false
      });
      return;
    }
    this.currentProjectId = saved.id;
    this.projectMeta = saved;
    if (this.draftSaveTimer) {
      clearTimeout(this.draftSaveTimer);
      this.draftSaveTimer = null;
    }
    if (this.manageDrawDraft) removeDrawDraft();
    this.manageDrawDraft = false;
    haptic.success();
    this.setData({ saving: false, isSaved: true, draftStatus: '' });
    wx.showToast({ title: '已加入我的作品', icon: 'success' });
  },

  saveLongImage() {
    const project = this.buildProject();
    const layout = makePatternExportLayout(project, { mode: 'code' });
    this.setData({ exportWidth: layout.exportWidth, exportHeight: layout.exportHeight }, () => {
      const ctx = wx.createCanvasContext('exportCanvas', this);
      ctx.setFillStyle('#fffdf8');
      ctx.fillRect(0, 0, layout.exportWidth, layout.exportHeight);
      ctx.setFillStyle('#222222');
      ctx.setFontSize(34);
      ctx.fillText(project.width + ' x ' + project.height + ' 画豆图纸', layout.padding, 54);
      ctx.setFillStyle('#6c6258');
      ctx.setFontSize(20);
      ctx.fillText(getPaletteName(project.paletteId) + ' · ' + project.stats.total + ' 颗 · ' + project.colorStats.length + ' 色', layout.padding, 90);
      drawPattern(ctx, project, {
        x: layout.patternX,
        y: layout.patternY,
        cellSize: layout.cellSize,
        mode: 'code'
      });
      ctx.setFillStyle('#222222');
      ctx.setFontSize(24);
      ctx.fillText('用豆清单', layout.legendX, layout.legendY - 18);
      drawLegend(ctx, project.colorStats, layout.legendX, layout.legendY, layout.legendWidth);
      ctx.draw(false, () => {
        saveCanvasToAlbum('exportCanvas', this, '长图已保存', {
          width: layout.exportWidth,
          height: layout.exportHeight,
          destWidth: layout.exportWidth,
          destHeight: layout.exportHeight
        });
      });
    });
  }
});
