import { userApi } from '../../services/auth';
import { showToast } from '../../utils/index';
import { INotification } from '../../types/index';
import { relativeTime } from '../../utils/date';

Page({
  data: {
    notifications: [] as INotification[],
    loading: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    limit: 20,
  },

  onLoad() {
    this.loadNotifications();
  },

  async loadNotifications() {
    this.setData({ loading: true });
    try {
      const res = await userApi.getNotifications(1, this.data.limit);
      if (res.success && res.data) {
        this.setData({
          notifications: res.data.list,
          hasMore: res.data.hasMore,
          page: 1,
        });
      }
    } catch (err) {
      showToast('加载失败', 'error');
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadMore() {
    if (this.data.loadingMore || !this.data.hasMore) return;

    this.setData({ loadingMore: true });
    const nextPage = this.data.page + 1;

    try {
      const res = await userApi.getNotifications(nextPage, this.data.limit);
      if (res.success && res.data) {
        this.setData({
          notifications: [...this.data.notifications, ...res.data.list],
          hasMore: res.data.hasMore,
          page: nextPage,
        });
      }
    } catch (err) {
      showToast('加载失败', 'error');
    } finally {
      this.setData({ loadingMore: false });
    }
  },

  async markAllRead() {
    try {
      await userApi.markAllNotificationsRead();
      showToast('已全部标记为已读', 'success');
      // 刷新列表
      const notifications = this.data.notifications.map((n) => ({ ...n, isRead: true }));
      this.setData({ notifications });
    } catch (err) {
      showToast('操作失败', 'error');
    }
  },

  async onNotificationTap(e: WechatMiniprogram.TouchEvent) {
    const { item } = e.currentTarget.dataset;

    // 标记为已读
    if (!item.isRead) {
      try {
        await userApi.markNotificationRead(item.id);
        // 更新本地状态
        const notifications = this.data.notifications.map((n) =>
          n.id === item.id ? { ...n, isRead: true } : n
        );
        this.setData({ notifications });
      } catch (err) {
        console.error('标记已读失败:', err);
      }
    }

    // 根据通知类型跳转
    const checkinId = item.data && item.data.checkinId ? item.data.checkinId : null;
    if (checkinId) {
      wx.navigateTo({
        url: `/pages/checkin/detail?id=${checkinId}`,
      });
    }
  },

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      like: '❤️',
      comment: '💬',
      system: '📢',
    };
    return icons[type] || '📬';
  },

  formatTime(time: string): string {
    return relativeTime(time);
  },
});
