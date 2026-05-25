function getMenuRect() {
  try {
    if (wx.getMenuButtonBoundingClientRect) {
      const rect = wx.getMenuButtonBoundingClientRect();
      if (rect && rect.bottom) return rect;
    }
  } catch (error) {}
  return null;
}

function getSystemStatusTop() {
  try {
    const info = wx.getSystemInfoSync();
    return Number(info.statusBarHeight) || 24;
  } catch (error) {
    return 24;
  }
}

function getNavMetrics(extraBottomPx) {
  const extra = Number(extraBottomPx) || 14;
  const menu = getMenuRect();
  if (menu) {
    return {
      top: Math.max(24, Math.round(menu.top)),
      height: Math.round(menu.bottom + extra)
    };
  }
  const top = getSystemStatusTop();
  return {
    top,
    height: top + 58
  };
}

function getHeaderStyle(extraBottomPx) {
  const metrics = getNavMetrics(extraBottomPx);
  return '--nav-top: ' + metrics.top + 'px; --nav-height: ' + metrics.height + 'px;';
}

function getPageTopStyle(extraPx) {
  const extra = Number(extraPx) || 18;
  const metrics = getNavMetrics(extra);
  return 'padding-top: ' + Math.round(metrics.height + extra) + 'px;';
}

module.exports = {
  getHeaderStyle,
  getPageTopStyle
};
