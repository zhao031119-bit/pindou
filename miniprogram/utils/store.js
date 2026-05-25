const { makeProjectThumbnail } = require('./project-preview');

const LEGACY_STORAGE_KEY = 'bead_projects_v1';
const INDEX_KEY = 'bead_projects_index_v2';
const ITEM_PREFIX = 'bead_project_item_v2_';
const THUMBNAIL_SIZE = 16;

function safeGetStorage(key, fallback) {
  try {
    const value = wx.getStorageSync(key);
    return value || fallback;
  } catch (error) {
    return fallback;
  }
}

function safeSetStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

function safeRemoveStorage(key) {
  if (!wx.removeStorageSync) return;
  try {
    wx.removeStorageSync(key);
  } catch (error) {}
}

function toSummary(project) {
  return {
    id: project.id,
    name: project.name,
    type: project.type,
    width: project.width,
    height: project.height,
    beadSize: project.beadSize,
    paletteId: project.paletteId,
    colorStats: project.colorStats,
    stats: project.stats,
    thumbnail: makeProjectThumbnail(project, THUMBNAIL_SIZE),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}

function sortByUpdated(items) {
  return items.slice().sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
}

function readLegacyProjects() {
  const legacy = safeGetStorage(LEGACY_STORAGE_KEY, []);
  return Array.isArray(legacy) ? legacy.filter((project) => project && project.id) : [];
}

function mergeLegacySummaries(index) {
  const summaries = Array.isArray(index)
    ? index.filter((summary) => summary && summary.id)
    : [];
  const seen = {};
  summaries.forEach((summary) => {
    seen[summary.id] = true;
  });
  readLegacyProjects().forEach((project) => {
    if (!seen[project.id]) {
      summaries.push(toSummary(project));
      seen[project.id] = true;
    }
  });
  return sortByUpdated(summaries);
}

function listProjects() {
  const index = safeGetStorage(INDEX_KEY, null);
  if (Array.isArray(index)) {
    return mergeLegacySummaries(index);
  }
  return sortByUpdated(readLegacyProjects().map(toSummary));
}

function getProject(id) {
  const item = safeGetStorage(ITEM_PREFIX + id, null);
  if (item) return item;
  const legacy = safeGetStorage(LEGACY_STORAGE_KEY, []);
  if (Array.isArray(legacy)) {
    return legacy.find((project) => project && project.id === id) || null;
  }
  return null;
}

function saveProject(project) {
  const next = Object.assign({}, project, { updatedAt: Date.now() });
  if (!safeSetStorage(ITEM_PREFIX + next.id, next)) {
    return null;
  }
  const others = listProjects().filter((item) => item && item.id !== next.id);
  const newIndex = sortByUpdated([toSummary(next)].concat(others));
  return safeSetStorage(INDEX_KEY, newIndex) ? next : null;
}

function deleteProject(id) {
  const currentIndex = safeGetStorage(INDEX_KEY, null);
  if (Array.isArray(currentIndex)) {
    safeSetStorage(INDEX_KEY, mergeLegacySummaries(currentIndex).filter((project) => project && project.id !== id));
    safeRemoveStorage(ITEM_PREFIX + id);
  }
  const legacy = readLegacyProjects();
  if (legacy.length) {
    safeSetStorage(LEGACY_STORAGE_KEY, legacy.filter((project) => project.id !== id));
  }
}

function renameProject(id, name) {
  const project = getProject(id);
  if (!project) return null;
  const next = Object.assign({}, project, { name: String(name || '').trim() || project.name });
  return saveProject(next);
}

module.exports = {
  listProjects,
  getProject,
  saveProject,
  deleteProject,
  renameProject
};
