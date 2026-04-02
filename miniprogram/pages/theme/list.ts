import { themeApi } from '../../services/theme';
import { checkinApi } from '../../services/checkin';
import { ROUTES } from '../../constants/index';
import { showToast, showModal } from '../../utils/index';
import { ITheme } from '../../types/index';

Page({
  data: {
    themes: [] as Array<ITheme & { progress: number }>,
    activeTab: 'joined', // 'joined' | 'created'
    loading: false,
    page: 1,
    hasMore: true,
  },

  onLoad() {
    this.loadThemes();
  },

  onShow() {
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
  },

  // 加载主题列表
  async loadThemes() {
    this.setData({ loading: true });
    try {
      const res = await themeApi.getMyThemes(1, 100);
      if (res.success && res.data) {
        const themes = await Promise.all(
          res.data.list.map(async (theme) => {
            // 获取进度数据
            const myCheckins = await checkinApi.getMyCheckins(theme.id);
            const totalDays = Math.ceil(
              (new Date(theme.endDate).getTime() - new Date(theme.startDate).getTime()) /
                (1000 * 60 * 60 * 24)
            );
            const progress = totalDays > 0 ? Math.min(100, Math.round((myCheckins.data?.length || 0) / totalDays * 100)) : 0;
            return { ...theme, progress };
          })
        );
        this.setData({ themes });
      }
    } catch (err) {
      showToast('加载失败', 'error');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 过滤后的主题
  get filteredThemes() {
    const { themes, activeTab } = this.data;
    if (activeTab === 'created') {
      return themes.filter((t) => t.role === 'creator');
    }
    return themes;
  },

  // 去详情页
  goToDetail(e: WechatMiniprogram.TouchEvent) {
    const { theme } = e.detail;
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
