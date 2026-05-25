const { estimateStats } = require('./pattern');
const { MAX_GENERATE_CELLS, MAX_DIMENSION } = require('./constants');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clampDimension(value) {
  return Math.max(1, Math.min(MAX_DIMENSION, Math.round(value)));
}

function entropyFromCounts(counts, total, maxBins) {
  if (!total) return 0;
  let entropy = 0;
  Object.keys(counts).forEach((key) => {
    const p = counts[key] / total;
    if (p > 0) entropy -= p * Math.log2(p);
  });
  return clamp(entropy / Math.log2(Math.max(2, maxBins)), 0, 1);
}

function analyzeImageData(data, width, height) {
  const gray = new Array(width * height);
  const toneCounts = {};
  const colorCounts = {};
  let total = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = y * width + x;
      const offset = index * 4;
      const alpha = data[offset + 3] / 255;
      const r = data[offset] * alpha + 255 * (1 - alpha);
      const g = data[offset + 1] * alpha + 255 * (1 - alpha);
      const b = data[offset + 2] * alpha + 255 * (1 - alpha);
      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      gray[index] = luma;

      const toneKey = Math.min(15, Math.floor(luma / 16));
      const colorKey = (Math.floor(r / 32) << 6) | (Math.floor(g / 32) << 3) | Math.floor(b / 32);
      toneCounts[toneKey] = (toneCounts[toneKey] || 0) + 1;
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
      total += 1;
    }
  }

  let edgePixels = 0;
  let edgeSum = 0;
  let edgeTotal = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const gx =
        -gray[i - width - 1] + gray[i - width + 1] -
        2 * gray[i - 1] + 2 * gray[i + 1] -
        gray[i + width - 1] + gray[i + width + 1];
      const gy =
        gray[i - width - 1] + 2 * gray[i - width] + gray[i - width + 1] -
        gray[i + width - 1] - 2 * gray[i + width] - gray[i + width + 1];
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      edgeSum += magnitude;
      edgeTotal += 1;
      if (magnitude > 80) edgePixels += 1;
    }
  }

  const edgeDensity = edgeTotal ? edgePixels / edgeTotal : 0;
  const edgeStrength = edgeTotal ? clamp(edgeSum / edgeTotal / 220, 0, 1) : 0;
  const toneEntropy = entropyFromCounts(toneCounts, total, 16);
  const colorEntropy = entropyFromCounts(colorCounts, total, 512);
  const detailScore = clamp(
    edgeDensity * 2.1 +
    edgeStrength * 0.42 +
    toneEntropy * 0.18 +
    colorEntropy * 0.28,
    0,
    1
  );

  return {
    detailScore,
    edgeDensity,
    edgeStrength,
    toneEntropy,
    colorEntropy,
    occupiedColorBins: Object.keys(colorCounts).length
  };
}

function getComplexityText(score) {
  if (score < 0.24) return '轮廓清楚';
  if (score < 0.48) return '细节适中';
  if (score < 0.72) return '细节较多';
  return '细节很多';
}

function getCandidateSides(beadSize) {
  return beadSize === '2.6mm' ? [50, 100, 130] : [29, 58, 87, 116];
}

function pickTargetIndex(score, sides) {
  if (sides.length <= 3) {
    if (score < 0.42) return 0;
    if (score < 0.74) return 1;
    return 2;
  }
  if (score < 0.24) return 0;
  if (score < 0.48) return 1;
  if (score < 0.72) return 2;
  return 3;
}

function dimensionsFromRatio(baseSide, ratio) {
  const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 1;
  let width;
  let height;
  if (safeRatio >= 1) {
    width = clampDimension(baseSide);
    height = clampDimension(baseSide / safeRatio);
  } else {
    width = clampDimension(baseSide * safeRatio);
    height = clampDimension(baseSide);
  }
  while (width * height > MAX_GENERATE_CELLS && (width > 1 || height > 1)) {
    width = clampDimension(width * 0.95);
    height = clampDimension(height * 0.95);
  }
  return { width, height };
}

function makeOption(id, title, side, ratio, beadSize, description, active) {
  const size = dimensionsFromRatio(side, ratio);
  const stats = estimateStats(size.width, size.height, beadSize);
  return {
    id,
    title,
    width: size.width,
    height: size.height,
    beadSize,
    total: stats.total,
    boardText: stats.boardColumns * stats.boardRows + ' 板',
    physicalText: stats.physicalWidthCm + ' × ' + stats.physicalHeightCm + ' cm',
    description,
    active
  };
}

function buildSizeRecommendations(analysis, ratio, beadSize) {
  const score = analysis && Number.isFinite(analysis.detailScore) ? analysis.detailScore : 0.35;
  const sides = getCandidateSides(beadSize);
  const targetIndex = pickTargetIndex(score, sides);
  const options = [];
  const used = {};

  function add(id, title, index, description, active) {
    const side = sides[clamp(index, 0, sides.length - 1)];
    if (used[side]) return;
    used[side] = true;
    options.push(makeOption(id, title, side, ratio, beadSize, description, active));
  }

  if (targetIndex > 0) {
    add('economy', '省豆', targetIndex - 1, '豆数更少，适合轮廓清楚的图', false);
  }
  add('recommended', '推荐', targetIndex, getComplexityText(score) + '，适合直接生成', true);
  add('detail', '精细', targetIndex + 1, '保留更多细节，豆量会增加', false);

  for (let i = 0; i < sides.length && options.length < 3; i += 1) {
    add('more-' + i, i < targetIndex ? '省豆' : '精细', i, i < targetIndex ? '豆数更少' : '保留更多细节', false);
  }

  const recommended = options.find((item) => item.active) || options[0];
  return {
    summary: getComplexityText(score) + ' · 推荐 ' + recommended.width + '×' + recommended.height,
    scoreText: Math.round(score * 100) + '%',
    options
  };
}

module.exports = {
  analyzeImageData,
  buildSizeRecommendations,
  dimensionsFromRatio
};
