import { userApi } from '../../services/auth';
import { showToast } from '../../utils/index';
import { INotification } from '../../types/index';
import { relativeTime } from '../../utils/date';

Page({
  data: {
    notifications: [] as INotification[],
    unreadNotifications: [] as INotification[],
    readNotifications: [] as INotification[],
    unreadCount: 0,
    loading: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    limit: 20,
    statusBarHeight: 44,
    navBarHeight: 76,
  },

  onLoad() {
    // 获取系统信息，计算状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 44;
    const navBarHeight = statusBarHeight + 32;
    this.setData({
      statusBarHeight,
      navBarHeight,
    });

    this.loadNotifications();
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 分组通知
  groupNotifications(notifications: INotification[]) {
    const unread = notifications.filter(n => !n.isRead);
    const read = notifications.filter(n => n.isRead);
    return {
      unreadNotifications: unread,
      readNotifications: read,
      unreadCount: unread.length,
    };
  },

  async loadNotifications() {
    this.setData({ loading: true });
    try {
      const res = await userApi.getNotifications(1, this.data.limit);
      if (res.success && res.data) {
        const grouped = this.groupNotifications(res.data.list);
        this.setData({
          notifications: res.data.list,
          ...grouped,
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
        const newNotifications = [...this.data.notifications, ...res.data.list];
        const grouped = this.groupNotifications(newNotifications);
        this.setData({
          notifications: newNotifications,
          ...grouped,
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
      const grouped = this.groupNotifications(notifications);
      this.setData({
        notifications,
        ...grouped,
      });
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
        const grouped = this.groupNotifications(notifications);
        this.setData({
          notifications,
          ...grouped,
        });
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
      achievement: '🏆',
    };
    return icons[type] || '📬';
  },

  formatTime(time: string): string {
    return relativeTime(time);
  },
});
