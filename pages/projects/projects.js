const { listProjects, deleteProject: removeProject, renameProject } = require('../../miniprogram/utils/store');
const { getPageTopStyle, getHeaderStyle } = require('../../miniprogram/utils/layout');
const { formatTime, typeLabel, makeProjectThumbnail } = require('../../miniprogram/utils/project-preview');
const { STORAGE_KEYS } = require('../../miniprogram/utils/constants');
const haptic = require('../../miniprogram/utils/haptic');

const CURRENT_PROJECT_KEY = STORAGE_KEYS.CURRENT_PROJECT;

const FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'draw', label: '画豆图' },
  { id: 'generated', label: '图片生成' },
  { id: 'extracted', label: '提取色号' }
];

const SORTS = [
  { id: 'updated', label: '最近更新' },
  { id: 'created', label: '创建时间' },
  { id: 'size', label: '颗数' },
  { id: 'name', label: '名称' }
];

function compareProjects(sortId) {
  return function compare(a, b) {
    if (sortId === 'created') {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
    if (sortId === 'size') {
      return (Number(b.width || 0) * Number(b.height || 0)) - (Number(a.width || 0) * Number(a.height || 0));
    }
    if (sortId === 'name') {
      return String(a.name || '').localeCompare(String(b.name || ''), 'zh-Hans');
    }
    return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
  };
}

Page({
  data: {
    pageStyle: '',
    navStyle: '',
    filters: FILTERS,
    filter: 'all',
    sorts: SORTS,
    sort: 'updated',
    projectCount: 0,
    projects: []
  },

  onShow() {
    if (!this.data.pageStyle) {
      this.setData({ pageStyle: getPageTopStyle(18), navStyle: getHeaderStyle(18) });
    }
    this.loadProjects();
  },

  changeFilter(event) {
    haptic.tap();
    this.setData({ filter: event.currentTarget.dataset.id }, () => this.loadProjects());
  },

  changeSort(event) {
    haptic.tap();
    this.setData({ sort: event.currentTarget.dataset.id }, () => this.loadProjects());
  },

  loadProjects() {
    const filter = this.data.filter;
    const allProjects = listProjects();
    const projects = allProjects
      .filter((project) => project && project.id)
      .filter((project) => filter === 'all' || project.type === filter)
      .sort(compareProjects(this.data.sort))
      .map((project) => {
        const thumbnail = project.thumbnail || makeProjectThumbnail(project, 16);
        return Object.assign({}, project, thumbnail, {
          typeLabel: typeLabel(project.type),
          colorCount: Array.isArray(project.colorStats) ? project.colorStats.length : 0,
          totalCount: Number(project.width || 0) * Number(project.height || 0),
          updatedText: formatTime(project.updatedAt || project.createdAt)
        });
      });
    this.setData({ projects, projectCount: allProjects.length });
  },

  openProject(event) {
    wx.navigateTo({ url: '/pages/detail/detail?id=' + event.currentTarget.dataset.id });
  },

  renameItem(event) {
    const id = event.currentTarget.dataset.id;
    const project = this.data.projects.find((item) => item.id === id);
    if (!project) return;
    haptic.tap();
    wx.showModal({
      title: '重命名作品',
      editable: true,
      placeholderText: '输入新名称',
      content: project.name || '',
      success: (res) => {
        if (!res.confirm) return;
        const next = String(res.content || '').trim();
        if (!next) return;
        const saved = renameProject(id, next);
        if (!saved) {
          wx.showToast({ title: '重命名失败', icon: 'none' });
          return;
        }
        haptic.success();
        wx.showToast({ title: '已重命名', icon: 'success' });
        this.loadProjects();
      }
    });
  },

  deleteProject(event) {
    const id = event.currentTarget.dataset.id;
    const project = this.data.projects.find((item) => item.id === id);
    if (!project) return;
    wx.showModal({
      title: '删除作品',
      content: '确认删除「' + (project.name || '未命名作品') + '」吗？删除后不能恢复。',
      confirmColor: '#B84B3A',
      success: (res) => {
        if (!res.confirm) return;
        removeProject(id);
        const current = wx.getStorageSync(CURRENT_PROJECT_KEY);
        if (current && current.id === id && wx.removeStorageSync) {
          try {
            wx.removeStorageSync(CURRENT_PROJECT_KEY);
          } catch (error) {}
        }
        wx.showToast({ title: '已删除', icon: 'success' });
        this.loadProjects();
      }
    });
  },

  goDraw() {
    wx.navigateTo({ url: '/pages/draw/draw' });
  },

  goHome() {
    if (wx.reLaunch) {
      wx.reLaunch({ url: '/pages/home/home' });
      return;
    }
    wx.redirectTo({ url: '/pages/home/home' });
  },

  goBack() {
    wx.navigateBack({
      fail: () => this.goHome()
    });
  }
});
