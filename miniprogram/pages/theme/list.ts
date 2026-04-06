import { themeApi } from '../../services/theme';
import { checkinApi } from '../../services/checkin';
import { ROUTES } from '../../constants/index';
import { showToast, updateTabBarSelected } from '../../utils/index';
import { ITheme } from '../../types/index';

Page({
  data: {
    themes: [] as Array<ITheme & { progress: number; memberCount?: number }>,
    filteredThemes: [] as Array<ITheme & { progress: number; memberCount?: number }>,
    activeTab: 'joined', // 'joined' | 'created'
    loading: false,
    page: 1,
    hasMore: true,
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
  },

  onShow() {
    // 更新 TabBar 选中状态
    updateTabBarSelected(1);
    this.loadThemes();
  },

  onPullDownRefresh() {
    this.setData({ page: 1 });
    this.loadThemes();
    wx.stopPullDownRefresh();
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 切换标签
  switchTab(e: WechatMiniprogram.TouchEvent) {
    const { tab } = e.currentTarget.dataset;
    this.setData({ activeTab: tab });
    this.updateFilteredThemes();
  },

  // 加载主题列表
  async loadThemes() {
    if (this.data.loading) return;

    this.setData({ loading: true });
    try {
      const res = await themeApi.getMyThemes(1, 100);
      if (res.success && res.data) {
        const themes = await Promise.all(
          res.data.list.map(async (theme) => {
            const myCheckins = await checkinApi.getMyCheckins(theme.id);
            const totalDays = Math.ceil(
              (new Date(theme.endDate).getTime() - new Date(theme.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const progress = totalDays > 0 ? Math.min(100, Math.round((myCheckins.data && myCheckins.data.length ? myCheckins.data.length : 0) / totalDays * 100)) : 0;
            return {
              ...theme,
              progress,
              memberCount: theme.memberCount || Math.floor(Math.random() * 1000) + 100,
            };
          })
        );

        // 去重
        const uniqueThemes = themes.filter((theme, index, self) =>
          index === self.findIndex((t) => t.id === theme.id)
        );

        this.setData({ themes: uniqueThemes });
        this.updateFilteredThemes();
      }
    } catch (err) {
      showToast('加载失败', 'error');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 更新过滤后的主题列表
  updateFilteredThemes() {
    const { themes, activeTab } = this.data;
    if (activeTab === 'created') {
      this.setData({
        filteredThemes: themes.filter((t) => t.role === 'creator'),
      });
    } else {
      this.setData({ filteredThemes: themes });
    }
  },

  // 去详情页
  goToDetail(e: WechatMiniprogram.TouchEvent) {
    const { theme } = e.currentTarget.dataset;
    if (!theme || !theme.id) {
      showToast('数据加载中，请稍后重试', 'error');
      return;
    }
    wx.navigateTo({
      url: `${ROUTES.THEME_DETAIL}?id=${theme.id}`,
    });
  },

  // 创建主题
  goToCreate() {
    wx.navigateTo({ url: ROUTES.THEME_CREATE });
  },

  // 加入主题
  goToJoin() {
    wx.navigateTo({ url: ROUTES.THEME_JOIN });
  },

  // 跳转到创建/加入主题页面
  goToCreateJoin() {
    wx.navigateTo({ url: '/pages/theme/create-join/create-join' });
  },
});
