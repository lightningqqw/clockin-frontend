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

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date, 'YYYY-MM-DD');
        const dayIndex = date.getDay();

        // 这里简化处理，实际应该根据后端数据计算
        weeklyStats.push({
          day: dateStr,
          label: i === 0 ? '今天' : weekDays[dayIndex],
          count: Math.floor(Math.random() * 5), // 示例数据
          percentage: Math.floor(Math.random() * 100),
        });
      }

      this.setData({ weeklyStats });
    } catch (err) {
      console.error('加载周统计失败:', err);
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
