import { authApi } from '../../services/auth';
import { tokenStorage, userStorage } from '../../utils/storage';
import { ROUTES } from '../../constants/index';
import { showToast, showLoading, hideLoading } from '../../utils/index';

Page({
  data: {
    loading: false,
  },

  onLoad() {
    // 检查是否已登录
    const token = tokenStorage.get();
    if (token) {
      wx.switchTab({ url: ROUTES.HOME });
    }
  },

  // 获取用户信息
  onGetUserInfo(e: WechatMiniprogram.GetUserInfoSuccessCallbackResult) {
    if (e.detail.errMsg === 'getUserInfo:ok') {
      this.handleLogin(e.detail);
    } else {
      showToast('需要授权才能登录', 'error');
    }
  },

  // 处理登录
  async handleLogin(userInfo: WechatMiniprogram.GetUserInfoSuccessCallbackResult) {
    this.setData({ loading: true });
    showLoading('登录中...');

    try {
      // 获取微信登录 code
      const loginRes = await wx.login();
      if (!loginRes.code) {
        throw new Error('获取登录凭证失败');
      }

      // 调用后端登录接口
      const res = await authApi.wechatLogin(loginRes.code, userInfo);

      if (!res.success || !res.data) {
        throw new Error(res.message || '登录失败');
      }

      // 保存登录信息
      tokenStorage.set(res.data.token);
      if (res.data.refreshToken) {
        wx.setStorageSync('refreshToken', res.data.refreshToken);
      }
      userStorage.set(res.data.user);

      // 更新全局数据
      const app = getApp<IAppOption>();
      if (app.globalData) {
        app.globalData.userInfo = res.data.user;
      }

      hideLoading();
      showToast('登录成功', 'success');

      // 跳转到首页
      setTimeout(() => {
        wx.switchTab({ url: ROUTES.HOME });
      }, 500);
    } catch (err: any) {
      hideLoading();
      this.setData({ loading: false });
      showToast(err.message || '登录失败，请重试', 'error');
    }
  },

  // 显示用户协议
  showPrivacy() {
    wx.navigateTo({
      url: '/pages/privacy/privacy',
    });
  },

  // 显示隐私政策
  showTerms() {
    wx.navigateTo({
      url: '/pages/terms/terms',
    });
  },
});
