import { userApi } from '../../services/auth';
import { themeApi } from '../../services/theme';
import { checkinApi } from '../../services/checkin';
import { showToast } from '../../utils/index';
import { formatDate, getToday } from '../../utils/date';

interface WeeklyStat {
  day: string;
  shortLabel: string;
  label: string;
  count: number;
  percentage: number;
  isToday: boolean;
}

Page({
  data: {
    stats: {
      totalCheckins: 0,
      totalThemes: 0,
      streakDays: 0,
      totalLikes: 0,
      level: 1,
      levelName: '新手',
      weeklyHours: 0,
      percentile: 0,
      rankText: '开始打卡',
      growthRate: 0,
      isPositive: true,
    },
    weeklyStats: [] as WeeklyStat[],
    weeklyCheckinCount: 0,
    recentCheckins: [] as any[],
    loading: false,
    statusBarHeight: 44,
    navBarHeight: 76,
  },

  async onLoad() {
    // 获取系统信息，计算状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 44;
    const navBarHeight = statusBarHeight + 32;
    this.setData({
      statusBarHeight,
      navBarHeight,
    });

    this.loadStats();
  },

  async onShow() {
    // 每次显示页面时刷新数据
    this.loadStats();
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 格式化点赞数
  formatLikes(likes: number): string {
    if (likes >= 1000) {
      return (likes / 1000).toFixed(1) + 'k';
    }
    return String(likes);
  },

  async loadStats() {
    this.setData({ loading: true });
    await Promise.all([
      this.loadUserStats(),
      this.loadWeeklyStats(),
      this.loadRecentCheckins(),
    ]);
    this.setData({ loading: false });
  },

  async loadUserStats() {
    try {
      const res = await userApi.getStats();
      if (res.success && res.data) {
        this.setData({ stats: res.data });
      }
    } catch (err) {
      console.error('加载统计失败:', err);
    }
  },

  async loadWeeklyStats() {
    try {
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const shortLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const today = new Date();
      const weeklyStats: WeeklyStat[] = [];

      // 获取最近7天的打卡数据
      const themesRes = await themeApi.getMyThemes(1, 50);
      if (!themesRes.success || !themesRes.data || !themesRes.data.list) {
        this.setData({ weeklyStats: [] });
        return;
      }

      const dailyCounts: Record<string, number> = {};

      // 获取所有主题的打卡记录
      for (const theme of themesRes.data.list) {
        const checkinsRes = await checkinApi.getMyCheckins(theme.id);
        if (checkinsRes.success && checkinsRes.data) {
          for (const checkin of checkinsRes.data) {
            let date = '';
            if (checkin.checkinDate) {
              date = checkin.checkinDate.split('T')[0];
            } else if (checkin.createdAt) {
              date = typeof checkin.createdAt === 'string'
                ? checkin.createdAt.split('T')[0]
                : new Date(checkin.createdAt).toISOString().split('T')[0];
            }
            if (date) {
              dailyCounts[date] = (dailyCounts[date] || 0) + 1;
            }
          }
        }
      }

      // 构建本周数据（从周日到周六）
      const todayIndex = today.getDay();
      const counts = Object.values(dailyCounts);
      const maxCount = counts.length > 0 ? Math.max(...counts) : 1;

      // 计算本周有打卡的天数
      let weeklyCheckinCount = 0;

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        // 计算到本周日的偏移
        const dayOffset = i - todayIndex;
        date.setDate(date.getDate() + dayOffset);
        const dateStr = formatDate(date, 'YYYY-MM-DD');
        const dayIndex = date.getDay();
        const count = dailyCounts[dateStr] || 0;

        if (count > 0) {
          weeklyCheckinCount++;
        }

        weeklyStats.push({
          day: dateStr,
          label: weekDays[dayIndex],
          shortLabel: shortLabels[dayIndex],
          count: Number(count),
          percentage: maxCount > 0 ? Math.round((count / maxCount) * 100) : 0,
          isToday: dayOffset === 0,
        });
      }

      this.setData({
        weeklyStats,
        weeklyCheckinCount,
      });
    } catch (err) {
      console.error('加载周统计失败:', err);
      this.setData({ weeklyStats: [] });
    }
  },

  async loadRecentCheckins() {
    try {
      // 获取最近的主题列表
      const themesRes = await themeApi.getMyThemes(1, 10);
      if (themesRes.success && themesRes.data && themesRes.data.list) {
        const recentCheckins = [];

        for (const theme of themesRes.data.list) {
          const checkinsRes = await checkinApi.getMyCheckins(theme.id);
          if (checkinsRes.success && checkinsRes.data) {
            for (const checkin of checkinsRes.data.slice(0, 3)) {
              recentCheckins.push({
                id: checkin.id,
                date: formatDate(checkin.createdAt, 'MM-DD'),
                themeTitle: theme.title,
                count: 1,
              });
            }
          }
        }

        // 按时间排序，取前10条
        recentCheckins.sort((a, b) => b.date.localeCompare(a.date));
        this.setData({ recentCheckins: recentCheckins.slice(0, 10) });
      }
    } catch (err) {
      console.error('加载最近打卡失败:', err);
    }
  },
});
