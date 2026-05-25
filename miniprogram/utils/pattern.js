const { averagePixels, nearestColor, rgbToHex } = require('./color');
const { getPalette } = require('./palettes');
const { BEAD_SIZE_OPTIONS } = require('./constants');

function beadSizeMeta(beadSize) {
  return BEAD_SIZE_OPTIONS.find((item) => item.id === beadSize) || BEAD_SIZE_OPTIONS[0];
}

function estimateStats(width, height, beadSize) {
  const meta = beadSizeMeta(beadSize);
  const total = width * height;
  return {
    total,
    boardColumns: Math.ceil(width / meta.board.width),
    boardRows: Math.ceil(height / meta.board.height),
    physicalWidthCm: +(width * meta.cmPerBead).toFixed(1),
    physicalHeightCm: +(height * meta.cmPerBead).toFixed(1)
  };
}

function mapAverageGridToPalette(averageGrid, paletteId) {
  const palette = getPalette(paletteId);
  const cells = [];
  const counts = {};
  const matchCache = {};
  const grid = Array.isArray(averageGrid) ? averageGrid : [];
  for (let i = 0; i < grid.length; i += 1) {
    const avg = grid[i];
    const cacheKey = avg.hex || (avg.r + ',' + avg.g + ',' + avg.b);
    let match = matchCache[cacheKey];
    if (!match) {
      match = nearestColor(avg, palette).color;
      matchCache[cacheKey] = match;
    }
    const statKey = paletteId + ':' + match.code + ':' + match.hex;
    const cell = {
      index: i,
      x: avg.x,
      y: avg.y,
      sourceHex: avg.hex,
      paletteId,
      colorId: match.id,
      code: match.code,
      name: match.name,
      hex: match.hex
    };
    cells.push(cell);
    if (!counts[statKey]) {
      counts[statKey] = {
        statKey,
        paletteId,
        colorId: match.id,
        code: match.code,
        name: match.name,
        hex: match.hex,
        count: 0
      };
    }
    counts[statKey].count += 1;
  }
  const colorStats = Object.keys(counts)
    .map((key) => counts[key])
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
  return { cells, colorStats };
}

function imageDataToAverageGrid(imageData, sourceWidth, sourceHeight, targetWidth, targetHeight, insetRatio) {
  const grid = [];
  const cellW = sourceWidth / targetWidth;
  const cellH = sourceHeight / targetHeight;
  const inset = Math.max(0, Math.min(0.45, Number(insetRatio) || 0));
  for (let y = 0; y < targetHeight; y += 1) {
    for (let x = 0; x < targetWidth; x += 1) {
      const avg = averagePixels(
        imageData,
        sourceWidth,
        sourceHeight,
        x * cellW + cellW * inset,
        y * cellH + cellH * inset,
        cellW * (1 - inset * 2),
        cellH * (1 - inset * 2)
      );
      grid.push({
        x,
        y,
        r: avg.r,
        g: avg.g,
        b: avg.b,
        hex: avg.hex
      });
    }
  }
  return grid;
}

function makeBlankProject(width, height, paletteId, beadSize) {
  const averageGrid = [];
  const cells = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      averageGrid.push({
        x,
        y,
        r: 255,
        g: 255,
        b: 255,
        hex: '#FFFFFF'
      });
      cells.push({
        index,
        x,
        y,
        empty: true,
        paletteId: '',
        colorId: '',
        code: '',
        name: '',
        hex: '#FFFFFF'
      });
    }
  }
  return createProject({
    type: 'draw',
    width,
    height,
    beadSize,
    paletteId,
    averageGrid,
    cells,
    colorStats: []
  });
}

function createProject(input) {
  const now = Date.now();
  const stats = estimateStats(input.width, input.height, input.beadSize || '5mm');
  return {
    id: input.id || 'project-' + now,
    name: input.name || '拼豆图纸 ' + new Date(now).toLocaleString(),
    type: input.type || 'generated',
    sourceImage: input.sourceImage || '',
    crop: input.crop || null,
    width: input.width,
    height: input.height,
    beadSize: input.beadSize || '5mm',
    paletteId: input.paletteId,
    defaultPaletteId: input.defaultPaletteId || input.paletteId,
    averageGrid: input.averageGrid || [],
    cells: input.cells || [],
    colorStats: input.colorStats || [],
    stats,
    createdAt: input.createdAt || now,
    updatedAt: now
  };
}

function remapProject(project, paletteId) {
  const width = Math.max(1, Number(project && project.width) || 1);
  const expected = width * Math.max(1, Number(project && project.height) || 1);
  const sourceGrid = Array.isArray(project.averageGrid) && project.averageGrid.length === expected
    ? project.averageGrid
    : cellsToAverageGrid(Array.isArray(project.cells) ? project.cells : [], width);
  const mapped = mapAverageGridToPalette(sourceGrid, paletteId);
  return Object.assign({}, project, {
    paletteId,
    averageGrid: sourceGrid,
    cells: mapped.cells,
    colorStats: mapped.colorStats,
    updatedAt: Date.now()
  });
}

function cellsToAverageGrid(cells, width) {
  const safeWidth = Math.max(1, Number(width) || 1);
  const sourceCells = Array.isArray(cells) ? cells : [];
  return sourceCells.map((cell, index) => {
    const rgb = cell.rgb || require('./color').hexToRgb(cell.hex || '#FFFFFF');
    return {
      x: index % safeWidth,
      y: Math.floor(index / safeWidth),
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      hex: rgbToHex(rgb.r, rgb.g, rgb.b)
    };
  });
}

module.exports = {
  estimateStats,
  imageDataToAverageGrid,
  mapAverageGridToPalette,
  createProject,
  remapProject,
  makeBlankProject,
  cellsToAverageGrid
};
