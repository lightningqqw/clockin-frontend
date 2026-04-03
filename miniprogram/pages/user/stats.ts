import { userApi } from '../../services/auth';
import { themeApi } from '../../services/theme';
import { checkinApi } from '../../services/checkin';
import { showToast } from '../../utils/index';
import { formatDate, getToday } from '../../utils/date';

interface WeeklyStat {
  day: string;
  label: string;
  count: number;
  percentage: number;
}

Page({
  data: {
    stats: {
      totalCheckins: 0,
      totalThemes: 0,
      streakDays: 0,
      totalLikes: 0,
    },
    weeklyStats: [] as WeeklyStat[],
    recentCheckins: [] as any[],
    loading: false,
  },

  async onLoad() {
    this.loadStats();
  },

  async onShow() {
    // 每次显示页面时刷新数据
    this.loadStats();
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
      // 获取本周每天的打卡数
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const today = new Date();
      const weeklyStats: WeeklyStat[] = [];

      // 获取最近7天的打卡数据
      const themesRes = await themeApi.getMyThemes(1, 50);
      if (!themesRes.success || !themesRes.data?.list) {
        this.setData({ weeklyStats: [] });
        return;
      }

      const dailyCounts: Record<string, number> = {};

      // 获取所有主题的打卡记录
      for (const theme of themesRes.data.list) {
        const checkinsRes = await checkinApi.getMyCheckins(theme.id);
        if (checkinsRes.success && checkinsRes.data) {
          for (const checkin of checkinsRes.data) {
            // 确保日期格式统一为 YYYY-MM-DD
            let date = '';
            if (checkin.checkinDate) {
              date = checkin.checkinDate.split('T')[0]; // 处理 ISO 格式日期
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

      console.log('[Stats] Daily counts:', dailyCounts);

      // 构建本周数据
      const counts = Object.values(dailyCounts);
      const maxCount = counts.length > 0 ? Math.max(...counts) : 1;

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date, 'YYYY-MM-DD');
        const dayIndex = date.getDay();
        const count = dailyCounts[dateStr] || 0;

        weeklyStats.push({
          day: dateStr,
          label: i === 0 ? '今天' : weekDays[dayIndex],
          count: Number(count),
          percentage: maxCount > 0 ? Math.round((count / maxCount) * 100) : 0,
        });
      }

      console.log('[Stats] Weekly stats:', weeklyStats);
      this.setData({ weeklyStats });
    } catch (err) {
      console.error('加载周统计失败:', err);
      this.setData({ weeklyStats: [] });
    }
  },

  async loadRecentCheckins() {
    try {
      // 获取最近的主题列表
      const themesRes = await themeApi.getMyThemes(1, 10);
      if (themesRes.success && themesRes.data?.list) {
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
