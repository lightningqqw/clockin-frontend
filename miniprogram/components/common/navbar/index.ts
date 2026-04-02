Component({
  options: {
    addGlobalClass: true,
    styleIsolation: 'shared',
  },

  properties: {
    title: {
      type: String,
      value: '',
    },
    showBack: {
      type: Boolean,
      value: true,
    },
    showHome: {
      type: Boolean,
      value: false,
    },
    fixed: {
      type: Boolean,
      value: true,
    },
    background: {
      type: String,
      value: '#fff',
    },
  },

  data: {
    height: 0,
    navbarStyle: '',
  },

  lifetimes: {
    attached() {
      const systemInfo = wx.getSystemInfoSync();
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      const statusBarHeight = systemInfo.statusBarHeight || 0;
      const navBarHeight = (menuButtonInfo.top - statusBarHeight) * 2 + menuButtonInfo.height;
      const totalHeight = statusBarHeight + navBarHeight;

      this.setData({
        height: totalHeight,
        navbarStyle: `
          height: ${totalHeight}px;
          padding-top: ${statusBarHeight}px;
          background: ${this.data.background};
        `,
      });
    },
  },

  methods: {
    onBack() {
      wx.navigateBack();
    },

    onHome() {
      wx.switchTab({ url: '/pages/index/index' });
    },
  },
});
