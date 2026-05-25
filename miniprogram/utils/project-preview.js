function safeCells(project) {
  return Array.isArray(project && project.cells) ? project.cells : [];
}

function typeLabel(type) {
  if (type === 'draw') return '画豆图';
  if (type === 'extracted') return '提取色号';
  return '图片生成';
}

function formatTime(time) {
  if (!time) return '';
  const date = new Date(time);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return month + '/' + day + ' ' + hour + ':' + minute;
}

function countPaintedCells(project) {
  return safeCells(project).filter((cell) => cell && !cell.empty).length;
}

function makeProjectThumbnail(project, maxSize) {
  const width = Math.max(1, Number(project && project.width) || 1);
  const height = Math.max(1, Number(project && project.height) || 1);
  const cells = safeCells(project);
  const limit = Math.max(4, Number(maxSize) || 14);
  const ratio = width / height;
  let previewWidth = Math.min(limit, width);
  let previewHeight = Math.min(limit, height);
  if (ratio > 1) {
    previewHeight = Math.max(1, Math.min(limit, Math.round(previewWidth / ratio)));
  } else if (ratio < 1) {
    previewWidth = Math.max(1, Math.min(limit, Math.round(previewHeight * ratio)));
  }
  const previewRatio = previewWidth / previewHeight;
  const thumbWidthPercent = previewRatio >= 1 ? 100 : Math.max(18, Math.round(previewRatio * 100));
  const thumbHeightPercent = previewRatio >= 1 ? Math.max(18, Math.round(100 / previewRatio)) : 100;

  const previewCells = [];
  for (let y = 0; y < previewHeight; y += 1) {
    const sourceY = Math.min(height - 1, Math.floor((y / previewHeight) * height));
    for (let x = 0; x < previewWidth; x += 1) {
      const sourceX = Math.min(width - 1, Math.floor((x / previewWidth) * width));
      const cell = cells[sourceY * width + sourceX];
      previewCells.push({
        index: y * previewWidth + x,
        hex: cell && !cell.empty ? (cell.hex || '#FFFFFF') : '#FFFFFF',
        empty: !cell || cell.empty
      });
    }
  }

  return {
    previewWidth,
    previewHeight,
    thumbWidthPercent,
    thumbHeightPercent,
    previewCells
  };
}

module.exports = {
  safeCells,
  typeLabel,
  formatTime,
  countPaintedCells,
  makeProjectThumbnail
};
