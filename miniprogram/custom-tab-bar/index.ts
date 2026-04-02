Component({
  data: {
    selected: 0,
    isIpx: false,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        iconPath: '🏠',
        selectedIconPath: '🏡',
      },
      {
        pagePath: '/pages/theme/list',
        text: '主题',
        iconPath: '📋',
        selectedIconPath: '📑',
      },
      {
        pagePath: '/pages/user/profile',
        text: '我的',
        iconPath: '👤',
        selectedIconPath: '👥',
      },
    ],
  },

  lifetimes: {
    attached() {
      // 检测是否是 iPhone X 系列
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        isIpx: systemInfo.screenHeight >= 812,
      });
    },
  },

  methods: {
    switchTab(e: WechatMiniprogram.TouchEvent) {
      const { index, url } = e.currentTarget.dataset;
      const app = getApp<IAppOption>();

      if (this.data.selected !== index) {
        this.setData({ selected: index });
        wx.switchTab({ url });
      }
    },
  },
});
