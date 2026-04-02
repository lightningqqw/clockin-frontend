import { themeApi } from '../../services/theme';
import { ROUTES } from '../../constants/index';
import { showToast } from '../../utils/index';

Page({
  data: {
    inviteCode: '',
    loading: false,
  },

  onInputChange(e: WechatMiniprogram.Input) {
    this.setData({
      inviteCode: e.detail.value.trim().toUpperCase(),
    });
  },

  async submit() {
    const { inviteCode } = this.data;

    if (!inviteCode) {
      showToast('请输入邀请码', 'error');
      return;
    }

    if (inviteCode.length < 4) {
      showToast('邀请码格式不正确', 'error');
      return;
    }

    this.setData({ loading: true });

    try {
      const res = await themeApi.joinTheme(inviteCode);
      if (res.success && res.data) {
        showToast('加入成功', 'success');
        // 跳转到主题详情页
        setTimeout(() => {
          wx.redirectTo({
            url: `${ROUTES.THEME_DETAIL}?id=${res.data.themeId}`,
          });
        }, 500);
      } else {
        throw new Error(res.message || '加入失败');
      }
    } catch (err: any) {
      showToast(err.message || '邀请码无效或已过期', 'error');
    } finally {
      this.setData({ loading: false });
    }
  },
});
