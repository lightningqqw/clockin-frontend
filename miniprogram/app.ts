import { tokenStorage, userStorage } from './utils/storage';
import { ROUTES } from './constants/index';

// 应用实例
App<IAppOption>({
  globalData: {
    userInfo: null,
    systemInfo: null,
  },

  onLaunch() {
    // 获取系统信息
    this.globalData.systemInfo = wx.getSystemInfoSync();

    // 检查登录状态
    this.checkLoginStatus();
  },

  onShow() {
    // 应用进入前台
  },

  onHide() {
    // 应用进入后台
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = tokenStorage.get();
    const userInfo = userStorage.get();

    if (token && userInfo) {
      this.globalData.userInfo = userInfo;
    } else {
      // 未登录，跳转到登录页
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const route = (currentPage && currentPage.route) || '';

      // 避免重复跳转
      if (!route.includes('login')) {
        wx.redirectTo({ url: ROUTES.LOGIN });
      }
    }
  },

  // 更新用户信息
  updateUserInfo(userInfo: any) {
    this.globalData.userInfo = userInfo;
    userStorage.set(userInfo);
  },

  // 退出登录
  logout() {
    tokenStorage.remove();
    userStorage.remove();
    this.globalData.userInfo = null;
    wx.redirectTo({ url: ROUTES.LOGIN });
  },
});
