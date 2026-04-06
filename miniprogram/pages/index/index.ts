import { userApi } from '../../services/auth';
import { themeApi } from '../../services/theme';
import { checkinApi } from '../../services/checkin';
import { userStorage } from '../../utils/storage';
import { ROUTES } from '../../constants/index';
import { updateTabBarSelected } from '../../utils/index';
import { ITheme } from '../../types/index';

Page({
  data: {
    userInfo: null as any,
    stats: {
      themeCount: 0,
      checkinCount: 0,
    },
    todayThemes: [] as Array<ITheme & { hasChecked: boolean; icon?: string; iconBgClass?: string }>,
    loading: false,
    checkedCount: 0,
    progressPercent: 0,
    completionRate: 0,
    statusBarHeight: 44, // 默认状态栏高度
    navBarHeight: 108, // 导航栏总高度（状态栏 + 内容区）
  },

  onLoad() {
    // 获取系统信息，计算状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 44;
    // 导航栏总高度 = 状态栏高度 + 内容区高度(64rpx≈32px)
    const navBarHeight = statusBarHeight + 32;
    this.setData({
      statusBarHeight,
      navBarHeight,
    });

    this.loadUserInfo();
    this.loadData();
  },

  onShow() {
    // 更新 TabBar 选中状态
    updateTabBarSelected(0);
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
        const todayThemes = [] as Array<ITheme & { hasChecked: boolean; icon?: string; iconBgClass?: string }>;

        // 默认图标映射
        const iconMap: { [key: string]: { icon: string; bgClass: string } } = {
          '跑': { icon: '🏃', bgClass: 'icon-run' },
          '步': { icon: '🏃', bgClass: 'icon-run' },
          '晨': { icon: '🏃', bgClass: 'icon-run' },
          '读': { icon: '📖', bgClass: 'icon-read' },
          '书': { icon: '📖', bgClass: 'icon-read' },
          '背': { icon: '🔤', bgClass: 'icon-study' },
          '词': { icon: '🔤', bgClass: 'icon-study' },
          '学': { icon: '🔤', bgClass: 'icon-study' },
        };

        for (const theme of themes) {
          const checkinRes = await checkinApi.canCheckinToday(theme.id);

          // 根据主题标题匹配图标
          let iconData = { icon: '📝', bgClass: 'icon-default' };
          for (const key in iconMap) {
            if (theme.title && theme.title.includes(key)) {
              iconData = iconMap[key];
              break;
            }
          }

          todayThemes.push({
            ...theme,
            hasChecked: checkinRes.data && checkinRes.data.hasCheckedToday ? true : false,
            icon: iconData.icon,
            iconBgClass: iconData.bgClass,
          });
        }

        const checkedCount = todayThemes.filter((t) => t.hasChecked).length;
        const totalCount = todayThemes.length;
        const progressPercent = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;
        const completionRate = Math.round(progressPercent);

        this.setData({
          todayThemes,
          checkedCount,
          progressPercent,
          completionRate,
        });
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

  // 刷新
  refresh() {
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

  // 创建主题
  goToCreateTheme() {
    wx.navigateTo({ url: ROUTES.THEME_CREATE });
  },

  // 加入主题
  goToJoinTheme() {
    wx.navigateTo({ url: ROUTES.THEME_JOIN });
  },

  // 跳转到创建/加入主题页面（通过FAB按钮）
  goToCreateJoin() {
    wx.navigateTo({ url: '/pages/theme/create-join/create-join' });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },
});
