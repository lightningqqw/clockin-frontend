import { ROUTES } from '../../../constants/index';

Page({
  data: {
    statusBarHeight: 44,
    navBarHeight: 76,
  },

  onLoad() {
    // 获取系统信息，计算状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 44;
    // 导航栏总高度 = 状态栏高度 + 内容区高度(64rpx≈32px)
    const navBarHeight = statusBarHeight + 32;
    this.setData({
      statusBarHeight,
      navBarHeight,
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 跳转到创建主题页面
  goToCreate() {
    wx.navigateTo({
      url: ROUTES.THEME_CREATE,
    });
  },

  // 跳转到加入主题页面
  goToJoin() {
    wx.navigateTo({
      url: ROUTES.THEME_JOIN,
    });
  },
});
