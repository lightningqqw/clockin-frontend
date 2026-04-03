import { themeApi } from '../../services/theme';
import { checkinApi } from '../../services/checkin';
import { ROUTES } from '../../constants/index';
import { showToast, showModal, updateTabBarSelected } from '../../utils/index';
import { ITheme } from '../../types/index';

Page({
  data: {
    themes: [] as Array<ITheme & { progress: number }>,
    filteredThemes: [] as Array<ITheme & { progress: number }>,
    activeTab: 'joined', // 'joined' | 'created'
    loading: false,
    page: 1,
    hasMore: true,
  },

  onLoad() {
    // onShow 会处理加载，避免重复调用
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

  // 切换标签
  switchTab(e: WechatMiniprogram.TouchEvent) {
    const { tab } = e.currentTarget.dataset;
    this.setData({ activeTab: tab });
    this.updateFilteredThemes();
  },

  // 加载主题列表
  async loadThemes() {
    if (this.data.loading) return; // 防止重复加载

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
            const progress = totalDays > 0 ? Math.min(100, Math.round((myCheckins.data?.length || 0) / totalDays * 100)) : 0;
            return { ...theme, progress };
          })
        );

        // 去重：确保不会有重复的主题
        const uniqueThemes = themes.filter((theme, index, self) =>
          index === self.findIndex((t) => t.id === theme.id)
        );

        if (uniqueThemes.length !== themes.length) {
          console.warn('[ThemeList] 发现重复主题，已去重');
        }

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
        filteredThemes: themes.filter((t: any) => t.role === 'creator'),
      });
    } else {
      this.setData({ filteredThemes: themes });
    }
  },

  // 去详情页
  goToDetail(e: WechatMiniprogram.TouchEvent) {
    const theme = e.detail?.theme;
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

  // 显示操作菜单
  showActionSheet() {
    wx.showActionSheet({
      itemList: ['创建主题', '加入主题'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.goToCreate();
        } else {
          this.goToJoin();
        }
      },
    });
  },
});
