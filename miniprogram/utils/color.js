function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function componentToHex(value) {
  const hex = clamp(Math.round(value), 0, 255).toString(16).toUpperCase();
  return hex.length === 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  const clean = String(hex).replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('hexToRgb received invalid hex:', hex);
    }
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function pivotRgb(value) {
  const normalized = value / 255;
  return normalized > 0.04045
    ? Math.pow((normalized + 0.055) / 1.055, 2.4)
    : normalized / 12.92;
}

function rgbToXyz(r, g, b) {
  const rr = pivotRgb(r);
  const gg = pivotRgb(g);
  const bb = pivotRgb(b);
  return {
    x: (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) * 100,
    y: (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) * 100,
    z: (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) * 100
  };
}

function pivotXyz(value) {
  return value > 0.008856 ? Math.cbrt(value) : (7.787 * value) + 16 / 116;
}

function rgbToLab(r, g, b) {
  const xyz = rgbToXyz(r, g, b);
  const x = pivotXyz(xyz.x / 95.047);
  const y = pivotXyz(xyz.y / 100);
  const z = pivotXyz(xyz.z / 108.883);
  return {
    l: (116 * y) - 16,
    a: 500 * (x - y),
    b: 200 * (y - z)
  };
}

function hexToLab(hex) {
  const rgb = hexToRgb(hex);
  return rgbToLab(rgb.r, rgb.g, rgb.b);
}

function deltaE76(labA, labB) {
  const dl = labA.l - labB.l;
  const da = labA.a - labB.a;
  const db = labA.b - labB.b;
  return Math.sqrt(dl * dl + da * da + db * db);
}

function normalizeColor(color) {
  if (color.lab) {
    return color;
  }
  const rgb = color.rgb || hexToRgb(color.hex);
  return Object.assign({}, color, {
    rgb,
    lab: rgbToLab(rgb.r, rgb.g, rgb.b)
  });
}

function nearestColor(input, palette) {
  if (!Array.isArray(palette) || !palette.length) {
    return {
      color: normalizeColor({ id: 'fallback-white', code: '-', name: '白色', hex: '#FFFFFF' }),
      distance: Infinity
    };
  }
  const lab = input.lab || (input.hex ? hexToLab(input.hex) : rgbToLab(input.r, input.g, input.b));
  let best = null;
  let bestDistance = Infinity;
  for (let i = 0; i < palette.length; i += 1) {
    const candidate = normalizeColor(palette[i]);
    const distance = deltaE76(lab, candidate.lab);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return {
    color: best,
    distance: bestDistance
  };
}

function averagePixels(data, width, height, x0, y0, w, h) {
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  const startX = clamp(Math.floor(x0), 0, width - 1);
  const startY = clamp(Math.floor(y0), 0, height - 1);
  const endX = clamp(Math.ceil(x0 + w), startX + 1, width);
  const endY = clamp(Math.ceil(y0 + h), startY + 1, height);
  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3] / 255;
      r += data[idx] * alpha + 255 * (1 - alpha);
      g += data[idx + 1] * alpha + 255 * (1 - alpha);
      b += data[idx + 2] * alpha + 255 * (1 - alpha);
      count += 1;
    }
  }
  if (!count) {
    return { r: 255, g: 255, b: 255, hex: '#FFFFFF' };
  }
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
    hex: rgbToHex(r / count, g / count, b / count)
  };
}

module.exports = {
  clamp,
  rgbToHex,
  hexToRgb,
  rgbToLab,
  hexToLab,
  deltaE76,
  nearestColor,
  normalizeColor,
  averagePixels
};
