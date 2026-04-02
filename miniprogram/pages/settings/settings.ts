import { showToast, showModal } from '../../utils/index';

Page({
  data: {
    cacheSize: '0KB',
  },

  onLoad() {
    this.getCacheSize();
  },

  getCacheSize() {
    try {
      const info = wx.getStorageInfoSync();
      const size = info.currentSize;
      if (size < 1024) {
        this.setData({ cacheSize: `${size}KB` });
      } else {
        this.setData({ cacheSize: `${(size / 1024).toFixed(2)}MB` });
      }
    } catch (err) {
      console.error('获取缓存大小失败:', err);
    }
  },

  async clearCache() {
    const confirmed = await showModal('清除缓存', '确定要清除所有缓存数据吗？');
    if (!confirmed) return;

    try {
      wx.clearStorageSync();
      showToast('清除成功', 'success');
      this.setData({ cacheSize: '0KB' });
    } catch (err) {
      showToast('清除失败', 'error');
    }
  },

  showAbout() {
    wx.showModal({
      title: '关于每日打卡',
      content: '每日打卡是一款帮助您养成好习惯的小程序\n\n让我们一起坚持，成为更好的自己！',
      showCancel: false,
    });
  },

  showPrivacy() {
    wx.navigateTo({
      url: '/pages/privacy/privacy',
    });
  },

  showTerms() {
    wx.navigateTo({
      url: '/pages/terms/terms',
    });
  },
});
