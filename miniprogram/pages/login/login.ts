import { authApi } from '../../services/auth';
import { tokenStorage, userStorage } from '../../utils/storage';
import { ROUTES } from '../../constants/index';
import { showToast, showLoading, hideLoading } from '../../utils/index';

Page({
  data: {
    loading: false,
    agreed: true, // 默认勾选隐私协议
  },

  onLoad() {
    // 检查是否已登录
    const token = tokenStorage.get();
    if (token) {
      wx.switchTab({ url: ROUTES.HOME });
    }
  },

  // 切换隐私协议勾选状态
  toggleAgree() {
    this.setData({
      agreed: !this.data.agreed
    });
  },

  // 检查是否同意隐私协议
  checkAgreement(): boolean {
    if (!this.data.agreed) {
      showToast('请先阅读并同意用户协议和隐私政策', 'none');
      return false;
    }
    return true;
  },

  // 微信登录按钮点击
  async onWechatLogin() {
    if (!this.checkAgreement()) return;

    this.setData({ loading: true });
    showLoading('登录中...');

    try {
      // 获取微信登录 code
      const loginRes = await wx.login();
      if (!loginRes.code) {
        throw new Error('获取登录凭证失败');
      }

      // 调用后端登录接口
      const res = await authApi.wechatLogin(loginRes.code);

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
      if (app && app.globalData) {
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

  // 手机号登录按钮点击
  onPhoneLogin() {
    if (!this.checkAgreement()) return;

    // 暂不支持手机号登录，提示用户
    showToast('手机号登录功能即将上线', 'none');

    // 如需实现手机号登录，可以使用以下代码：
    // wx.navigateTo({
    //   url: '/pages/login/phone',
    // });
  },

  // 获取用户信息（保留兼容旧版本）
  onGetUserInfo(e: WechatMiniprogram.GetUserInfoSuccessCallbackResult) {
    if (e.detail.errMsg === 'getUserInfo:ok') {
      this.handleLogin(e.detail);
    } else {
      showToast('需要授权才能登录', 'error');
    }
  },

  // 处理登录（兼容旧版本）
  async handleLogin(userInfo: WechatMiniprogram.GetUserInfoSuccessCallbackResult) {
    if (!this.checkAgreement()) return;

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
      if (app && app.globalData) {
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
