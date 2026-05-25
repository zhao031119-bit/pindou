// miniprogram/app.js
App({
  globalData: {
    systemInfo: null,
    menuRect: null,
  },

  onLaunch() {
    try {
      this.globalData.systemInfo = wx.getSystemInfoSync()
      this.globalData.menuRect = wx.getMenuButtonBoundingClientRect()
    } catch (e) {
      // 旧基础库静默降级
    }
  },
})
