function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function withTextAlign(ctx, align, baseline) {
  if (ctx.setTextAlign) ctx.setTextAlign(align);
  if (ctx.setTextBaseline) ctx.setTextBaseline(baseline);
}

function drawPattern(ctx, project, options) {
  const safeProject = project || {};
  const cells = Array.isArray(safeProject.cells) ? safeProject.cells : [];
  const mode = options.mode || 'color';
  const x0 = options.x || 0;
  const y0 = options.y || 0;
  const size = options.cellSize || 8;
  const highlightCode = options.highlightCode || '';
  const highlightHex = options.highlightHex || '';
  const widthPx = (safeProject.width || 0) * size;
  const heightPx = (safeProject.height || 0) * size;
  ctx.setFillStyle('#ffffff');
  ctx.fillRect(x0, y0, widthPx, heightPx);
  const dimmed = !!(highlightCode || highlightHex);
  cells.forEach((cell) => {
    const cellX = Number(cell && cell.x);
    const cellY = Number(cell && cell.y);
    if (!Number.isFinite(cellX) || !Number.isFinite(cellY)) return;
    const x = x0 + cellX * size;
    const y = y0 + cellY * size;
    const isMatch = dimmed && !cell.empty && (
      (highlightCode && cell.code === highlightCode) ||
      (highlightHex && cell.hex === highlightHex)
    );
    if (cell.empty) {
      ctx.setFillStyle('#ffffff');
    } else if (dimmed && !isMatch) {
      ctx.setFillStyle('#f0ebe1');
    } else {
      ctx.setFillStyle(cell.hex || '#ffffff');
    }
    ctx.fillRect(x, y, size, size);
    if (size >= 8) {
      ctx.setStrokeStyle(isMatch ? 'rgba(197,106,76,0.95)' : 'rgba(0,0,0,0.12)');
      if (isMatch && size >= 4) {
        ctx.setLineWidth && ctx.setLineWidth(2);
      } else {
        ctx.setLineWidth && ctx.setLineWidth(1);
      }
      ctx.strokeRect(x, y, size, size);
    }
    if (mode === 'code' && !cell.empty && size >= 12 && (!dimmed || isMatch)) {
      const code = String(cell.code || '');
      ctx.setFillStyle('#111111');
      const fontSize = Math.max(7, Math.min(
        Math.floor(size * 0.42),
        Math.floor((size - 4) / Math.max(1, code.length * 0.54))
      ));
      ctx.setFontSize(fontSize);
      withTextAlign(ctx, 'center', 'middle');
      ctx.fillText(code, x + size / 2, y + size / 2);
    }
  });
  withTextAlign(ctx, 'left', 'alphabetic');
  return { width: widthPx, height: heightPx };
}

function drawLegend(ctx, colorStats, x, y, maxWidth) {
  const stats = Array.isArray(colorStats) ? colorStats : [];
  const itemW = 170;
  const itemH = 94;
  const columns = Math.max(1, Math.floor(maxWidth / itemW));
  stats.forEach((item, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const px = x + col * itemW;
    const py = y + row * itemH;
    ctx.setFillStyle('#fffdf8');
    ctx.fillRect(px, py, itemW - 10, itemH - 10);
    ctx.setFillStyle(item.hex || '#FFFFFF');
    ctx.fillRect(px + 10, py + 10, 42, 42);
    ctx.setStrokeStyle('rgba(0,0,0,0.16)');
    ctx.strokeRect(px + 10, py + 10, 42, 42);
    ctx.setFillStyle('#222222');
    ctx.setFontSize(16);
    ctx.fillText(String(item.code || '-'), px + 62, py + 28);
    ctx.setFillStyle('#666666');
    ctx.setFontSize(13);
    const name = String(item.name || '').slice(0, 8);
    ctx.fillText(name || String(item.hex || ''), px + 62, py + 48);
    ctx.fillText(String(item.count || 0) + ' pcs', px + 62, py + 68);
  });
  return Math.ceil(stats.length / columns) * itemH;
}

function measureLegend(colorStats, maxWidth) {
  const stats = Array.isArray(colorStats) ? colorStats : [];
  if (!stats.length) return 0;
  const itemW = 170;
  const columns = Math.max(1, Math.floor(maxWidth / itemW));
  return Math.ceil(stats.length / columns) * 94;
}

function makePatternExportLayout(project, options) {
  const opts = options || {};
  const width = Math.max(1, Number(project && project.width) || 1);
  const height = Math.max(1, Number(project && project.height) || 1);
  const mode = opts.mode || 'code';
  const padding = Number(opts.padding) || 36;
  const maxCanvasWidth = Number(opts.maxCanvasWidth) || 2600;
  const targetPatternWidth = Number(opts.maxPatternWidth) || 2200;
  const minCellSize = Number(opts.minCellSize) || (mode === 'code' ? 12 : 8);
  const maxCellSize = Number(opts.maxCellSize) || (mode === 'code' ? 38 : 34);
  let cellSize = clamp(Math.floor(targetPatternWidth / width), minCellSize, maxCellSize);
  let patternWidth = width * cellSize;
  if (patternWidth + padding * 2 > maxCanvasWidth) {
    cellSize = Math.max(minCellSize, Math.floor((maxCanvasWidth - padding * 2) / width));
    patternWidth = width * cellSize;
  }
  const patternHeight = height * cellSize;
  const exportWidth = Math.min(maxCanvasWidth, Math.max(1080, patternWidth + padding * 2));
  const legendWidth = exportWidth - padding * 2;
  const legendHeight = Math.max(120, measureLegend(project && project.colorStats, legendWidth));
  const headerHeight = 148;
  const titleGap = 44;
  const exportHeight = headerHeight + patternHeight + titleGap + legendHeight + padding;
  return {
    padding,
    cellSize,
    patternX: Math.floor((exportWidth - patternWidth) / 2),
    patternY: headerHeight,
    patternWidth,
    patternHeight,
    legendX: padding,
    legendY: headerHeight + patternHeight + titleGap,
    legendWidth,
    legendHeight,
    exportWidth,
    exportHeight
  };
}

function openAlbumSetting() {
  wx.showModal({
    title: '无法保存',
    content: '需要开启相册权限后才能保存长图。',
    confirmText: '去开启',
    success(res) {
      if (res.confirm && wx.openSetting) {
        wx.openSetting();
      }
    }
  });
}

function saveImageFileToAlbum(filePath, successText) {
  const doSave = () => {
    wx.saveImageToPhotosAlbum({
      filePath,
      success() {
        wx.showToast({ title: successText || '已保存到相册', icon: 'success' });
      },
      fail(error) {
        const message = error && error.errMsg ? error.errMsg : '';
        if (message.indexOf('auth') >= 0 || message.indexOf('authorize') >= 0 || message.indexOf('deny') >= 0) {
          openAlbumSetting();
          return;
        }
        wx.showModal({
          title: '保存失败',
          content: '图片保存失败，请稍后重试。',
          showCancel: false
        });
      }
    });
  };

  if (!wx.getSetting || !wx.authorize) {
    doSave();
    return;
  }

  wx.getSetting({
    success(res) {
      const auth = res.authSetting && res.authSetting['scope.writePhotosAlbum'];
      if (auth === true) {
        doSave();
        return;
      }
      if (auth === false) {
        openAlbumSetting();
        return;
      }
      wx.authorize({
        scope: 'scope.writePhotosAlbum',
        success: doSave,
        fail: openAlbumSetting
      });
    },
    fail: doSave
  });
}

function saveCanvasToAlbum(canvasId, page, successText, options) {
  const sizeOptions = options || {};
  wx.canvasToTempFilePath(Object.assign({
    canvasId,
    success(res) {
      saveImageFileToAlbum(res.tempFilePath, successText);
    },
    fail() {
      wx.showModal({
        title: '保存失败',
        content: '图纸尺寸过大，暂时无法生成长图，请降低尺寸后重试。',
        showCancel: false
      });
    }
  }, sizeOptions), page);
}

module.exports = {
  drawPattern,
  drawLegend,
  measureLegend,
  makePatternExportLayout,
  saveCanvasToAlbum,
  saveImageFileToAlbum
};
