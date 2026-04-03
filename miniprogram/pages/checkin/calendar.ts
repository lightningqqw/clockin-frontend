import { checkinApi } from '../../services/checkin';
import { ROUTES } from '../../constants/index';
import { showToast, isFuture } from '../../utils/index';
import { ICheckin } from '../../types/index';

Page({
  data: {
    themeId: '',
    calendar: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      dates: [] as string[],
    },
    streakDays: 0,
    selectedDate: '',
    selectedCheckins: [] as ICheckin[],
    isFuture: false,
  },

  onLoad(options) {
    const themeId = options.themeId || '';
    this.setData({ themeId });
    this.loadCalendarData();
  },

  async loadCalendarData() {
    const { themeId, calendar } = this.data;
    try {
      const res = await checkinApi.getCalendar(themeId, calendar.year, calendar.month);
      if (res.success && res.data) {
        const dates = res.data.filter((d) => d.hasCheckin).map((d) => d.date);

        // 计算连续打卡天数
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        for (let i = res.data.length - 1; i >= 0; i--) {
          if (res.data[i].hasCheckin) {
            streak++;
          } else if (res.data[i].date !== today) {
            break;
          }
        }

        this.setData({
          'calendar.dates': dates,
          streakDays: streak,
        });
      }
    } catch (err) {
      showToast('加载日历失败', 'error');
    }
  },

  onMonthChange(e: WechatMiniprogram.TouchEvent) {
    const { year, month } = e.detail;
    this.setData({
      'calendar.year': year,
      'calendar.month': month,
    });
    this.loadCalendarData();
  },

  async onDayTap(e: WechatMiniprogram.TouchEvent) {
    const { day } = e.detail;
    this.setData({
      selectedDate: day.date,
      isFuture: isFuture(day.date),
    });

    // 加载当天的打卡记录
    try {
      const res = await checkinApi.getMyCheckins(this.data.themeId);
      if (res.success && res.data) {
        const selectedCheckins = res.data.filter((c) => {
          // 优先使用 checkinDate 字段，否则使用 createdAt 的日期部分
          if (c.checkinDate) {
            return c.checkinDate === day.date;
          }
          if (c.createdAt) {
            const createdDate = typeof c.createdAt === 'string'
              ? c.createdAt.split('T')[0]
              : new Date(c.createdAt).toISOString().split('T')[0];
            return createdDate === day.date;
          }
          return false;
        });
        this.setData({ selectedCheckins });
      }
    } catch (err) {
      console.error('加载打卡记录失败:', err);
    }
  },

  goToCheckinDetail(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `${ROUTES.CHECKIN_DETAIL}?id=${id}`,
    });
  },
});
