const { STORAGE_KEYS } = require('./constants');

function readAll() {
  try {
    const value = wx.getStorageSync(STORAGE_KEYS.PROJECT_CHECKS);
    return value && typeof value === 'object' ? value : {};
  } catch (error) {
    return {};
  }
}

function getChecks(projectId) {
  if (!projectId) return [];
  const all = readAll();
  return Array.isArray(all[projectId]) ? all[projectId].slice() : [];
}

function setChecks(projectId, codes) {
  if (!projectId) return false;
  const all = readAll();
  if (!Array.isArray(codes) || !codes.length) {
    delete all[projectId];
  } else {
    all[projectId] = codes.slice();
  }
  try {
    wx.setStorageSync(STORAGE_KEYS.PROJECT_CHECKS, all);
    return true;
  } catch (error) {
    return false;
  }
}

function toggleCheck(projectId, code) {
  const current = getChecks(projectId);
  const idx = current.indexOf(code);
  if (idx >= 0) {
    current.splice(idx, 1);
  } else {
    current.push(code);
  }
  setChecks(projectId, current);
  return current;
}

function clearChecks(projectId) {
  setChecks(projectId, []);
}

module.exports = { getChecks, setChecks, toggleCheck, clearChecks };
