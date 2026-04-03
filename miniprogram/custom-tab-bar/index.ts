Component({
  data: {
    selected: -1,
    isIpx: false,
    switching: false,
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
      // 初始化时根据当前页面设置选中状态
      this.updateSelectedByCurrentPage();
    },
    show() {
      // 每次显示时更新选中状态
      this.updateSelectedByCurrentPage();
    },
  },

  methods: {
    // 根据当前页面路径更新选中状态
    updateSelectedByCurrentPage() {
      const pages = getCurrentPages();
      if (pages.length === 0) return;

      const currentPage = pages[pages.length - 1];
      const route = currentPage.route || '';
      const { list } = this.data;

      // 找到匹配的 tab 索引
      const index = list.findIndex(item => {
        // 移除开头的斜杠进行比较
        const itemPath = item.pagePath.replace(/^\//, '');
        return route === itemPath;
      });

      if (index !== -1 && index !== this.data.selected) {
        this.setData({ selected: index });
      }
    },

    // 主动设置选中状态（供页面调用）
    setSelected(index: number) {
      if (index !== this.data.selected && index >= 0 && index < this.data.list.length) {
        this.setData({ selected: index });
      }
    },

    switchTab(e: WechatMiniprogram.TouchEvent) {
      const { index, url } = e.currentTarget.dataset;

      // 防止重复点击或正在切换中
      if (this.data.switching) {
        return;
      }

      // 如果点击的是当前页面，不执行切换
      if (this.data.selected === index) {
        return;
      }

      // 设置切换中状态，防止快速点击
      this.setData({ switching: true });

      // 立即更新UI，提升响应感
      this.setData({ selected: index });

      // 添加小延迟确保UI更新后再切换页面
      setTimeout(() => {
        wx.switchTab({
          url,
          success: () => {
            // 切换成功后重置状态
            setTimeout(() => {
              this.setData({ switching: false });
            }, 300);
          },
          fail: () => {
            // 切换失败，恢复选中状态并提示
            this.updateSelectedByCurrentPage();
            this.setData({ switching: false });
            wx.showToast({
              title: '页面切换失败',
              icon: 'none',
            });
          },
        });
      }, 50);
    },
  },
});
