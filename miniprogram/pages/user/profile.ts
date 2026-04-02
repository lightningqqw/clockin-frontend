import { userApi } from '../../services/auth';
import { userStorage } from '../../utils/storage';
import { ROUTES } from '../../constants/index';
import { showToast, showModal } from '../../utils/index';
import { IUserStats } from '../../types/index';

Page({
  data: {
    userInfo: null as any,
    stats: {
      totalThemes: 0,
      totalCheckins: 0,
      streakDays: 0,
      totalLikes: 0,
    } as IUserStats,
    unreadCount: 0,
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
    this.loadUserStats();
    this.loadUnreadCount();
  },

  loadUserInfo() {
    const userInfo = userStorage.get();
    this.setData({ userInfo });
  },

  async loadUserStats() {
    try {
      const res = await userApi.getStats();
      if (res.success && res.data) {
        this.setData({ stats: res.data });
      }
    } catch (err) {
      console.error('加载统计失败:', err);
    }
  },

  async loadUnreadCount() {
    try {
      const res = await userApi.getUnreadCount();
      if (res.success && res.data) {
        this.setData({ unreadCount: res.data.count });
      }
    } catch (err) {
      console.error('加载未读数失败:', err);
    }
  },

  editProfile() {
    // 编辑资料功能
    showToast('编辑资料功能开发中');
  },

  goToNotifications() {
    wx.navigateTo({ url: ROUTES.USER_NOTIFICATIONS });
  },

  goToStats() {
    wx.navigateTo({ url: ROUTES.USER_STATS });
  },

  goToThemes() {
    wx.switchTab({ url: ROUTES.THEME_LIST });
  },

  goToSettings() {
    wx.navigateTo({ url: ROUTES.SETTINGS });
  },

  showAbout() {
    wx.showModal({
      title: '关于每日打卡',
      content: '版本：1.0.0\n一款帮助您养成好习惯的小程序',
      showCancel: false,
    });
  },

  async logout() {
    const confirmed = await showModal('确认退出', '退出后将需要重新登录');
    if (!confirmed) return;

    // 清除登录信息
    const app = getApp<IAppOption>();
    if (app.logout) {
      app.logout();
    } else {
      // 手动清除
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
      wx.redirectTo({ url: ROUTES.LOGIN });
    }
  },
});
