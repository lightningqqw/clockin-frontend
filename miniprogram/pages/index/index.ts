import { userApi } from '../../services/auth';
import { themeApi } from '../../services/theme';
import { checkinApi } from '../../services/checkin';
import { likeApi } from '../../services/like';
import { userStorage } from '../../utils/storage';
import { ROUTES } from '../../constants/index';
import { showToast } from '../../utils/index';
import { ITheme, ICheckin } from '../../types/index';

Page({
  data: {
    userInfo: null as any,
    stats: {
      themeCount: 0,
      checkinCount: 0,
    },
    todayThemes: [] as Array<ITheme & { hasChecked: boolean }>,
    checkins: [] as ICheckin[],
    loading: false,
    loadingMore: false,
    hasMore: true,
    page: 1,
    limit: 20,
    checkedCount: 0,
  },

  onLoad() {
    this.loadUserInfo();
    this.loadData();
  },

  onShow() {
    // 每次显示页面时刷新数据
    if (this.data.userInfo) {
      this.loadData();
    }
  },

  onPullDownRefresh() {
    this.refresh();
    wx.stopPullDownRefresh();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = userStorage.get();
    this.setData({ userInfo });
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true });
    await Promise.all([
      this.loadTodayThemes(),
      this.loadRecentCheckins(),
      this.loadUserStats(),
    ]);
    this.setData({ loading: false });
  },

  // 加载今日打卡主题
  async loadTodayThemes() {
    try {
      const res = await themeApi.getMyThemes(1, 50);
      if (res.success && res.data) {
        const themes = res.data.list;
        const todayThemes = [] as Array<ITheme & { hasChecked: boolean }>;

        for (const theme of themes) {
          const checkinRes = await checkinApi.canCheckinToday(theme.id);
          todayThemes.push({
            ...theme,
            hasChecked: checkinRes.data?.hasCheckedToday || false,
          });
        }

        const checkedCount = todayThemes.filter((t) => t.hasChecked).length;
        this.setData({ todayThemes, checkedCount });
      }
    } catch (err) {
      console.error('加载今日主题失败:', err);
    }
  },

  // 加载用户统计
  async loadUserStats() {
    try {
      const res = await userApi.getStats();
      if (res.success && res.data) {
        this.setData({
          stats: {
            themeCount: res.data.totalThemes,
            checkinCount: res.data.totalCheckins,
          },
        });
      }
    } catch (err) {
      console.error('加载用户统计失败:', err);
    }
  },

  // 加载最近动态
  async loadRecentCheckins() {
    try {
      const { limit } = this.data;
      const res = await themeApi.getMyThemes(1, 20);

      if (res.success && res.data?.list) {
        const themes = res.data.list;
        const checkins: ICheckin[] = [];

        for (const theme of themes) {
          const checkinRes = await checkinApi.getThemeCheckins(theme.id, 1, 5);
          if (checkinRes.success && checkinRes.data?.list) {
            checkins.push(...checkinRes.data.list);
          }
        }

        // 按时间排序
        checkins.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        this.setData({
          checkins: checkins.slice(0, limit),
          hasMore: checkins.length >= limit,
        });
      }
    } catch (err) {
      console.error('加载动态失败:', err);
    }
  },

  // 加载更多
  async loadMore() {
    if (this.data.loadingMore || !this.data.hasMore) return;

    this.setData({ loadingMore: true });
    // 这里可以实现分页加载逻辑
    this.setData({ loadingMore: false, hasMore: false });
  },

  // 刷新
  refresh() {
    this.setData({ page: 1 });
    this.loadData();
  },

  // 去打卡
  goToCheckin(e: WechatMiniprogram.TouchEvent) {
    const { theme } = e.currentTarget.dataset;
    if (theme.hasChecked) {
      wx.navigateTo({
        url: `${ROUTES.THEME_DETAIL}?id=${theme.id}`,
      });
    } else {
      wx.navigateTo({
        url: `${ROUTES.CHECKIN_CREATE}?themeId=${theme.id}`,
      });
    }
  },

  // 去打卡详情
  goToCheckinDetail(e: WechatMiniprogram.TouchEvent) {
    const { checkin } = e.detail;
    wx.navigateTo({
      url: `${ROUTES.CHECKIN_DETAIL}?id=${checkin.id}`,
    });
  },

  // 点赞
  async onLike(e: WechatMiniprogram.TouchEvent) {
    const { checkin } = e.detail;
    try {
      if (checkin.hasLiked) {
        await likeApi.removeLike(checkin.id);
        showToast('取消点赞');
      } else {
        await likeApi.createLike(checkin.id);
        showToast('点赞成功', 'success');
      }
      this.refresh();
    } catch (err) {
      showToast('操作失败', 'error');
    }
  },

  // 创建主题
  goToCreateTheme() {
    wx.navigateTo({ url: ROUTES.THEME_CREATE });
  },

  // 加入主题
  goToJoinTheme() {
    wx.navigateTo({ url: ROUTES.THEME_JOIN });
  },
});
