import { getMonthDays, getToday, isFuture } from '../../../utils/date';

interface ICalendarDay {
  date: string;
  day: number;
  weekDay: number;
  isCurrentMonth: boolean;
  isToday?: boolean;
  hasCheckin?: boolean;
  isFuture?: boolean;
  isSelected?: boolean;
}

Component({
  options: {
    addGlobalClass: true,
    styleIsolation: 'shared',
  },

  properties: {
    year: {
      type: Number,
      value: new Date().getFullYear(),
    },
    month: {
      type: Number,
      value: new Date().getMonth() + 1,
    },
    checkinDates: {
      type: Array,
      value: [] as string[],
    },
    showStats: {
      type: Boolean,
      value: true,
    },
    streakDays: {
      type: Number,
      value: 0,
    },
    selectedDate: {
      type: String,
      value: '',
    },
  },

  data: {
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    days: [] as ICalendarDay[],
    currentYear: 0,
    currentMonth: 0,
    checkinCount: 0,
    completionRate: 0,
  },

  lifetimes: {
    attached() {
      this.setData({
        currentYear: this.data.year,
        currentMonth: this.data.month,
      });
      this.generateDays();
    },
  },

  observers: {
    'year,month,checkinDates,selectedDate': function() {
      this.generateDays();
    },
  },

  methods: {
    generateDays() {
      const today = getToday();
      const { currentYear, currentMonth, selectedDate } = this.data;
      const baseDays = getMonthDays(currentYear, currentMonth);
      const checkinSet = new Set(this.data.checkinDates);

      const days: ICalendarDay[] = baseDays.map((day) => ({
        ...day,
        isToday: day.date === today,
        hasCheckin: checkinSet.has(day.date),
        isFuture: isFuture(day.date),
        isSelected: day.date === selectedDate,
      }));

      // 计算统计
      const currentMonthDays = days.filter((d) => d.isCurrentMonth);
      const checkinCount = currentMonthDays.filter((d) => d.hasCheckin).length;
      const pastDays = currentMonthDays.filter((d) => !d.isFuture).length;
      const completionRate = pastDays > 0 ? Math.round((checkinCount / pastDays) * 100) : 0;

      this.setData({
        days,
        checkinCount,
        completionRate,
      });
    },

    prevMonth() {
      const { currentYear, currentMonth } = this.data;
      let year = currentYear;
      let month = currentMonth - 1;
      if (month < 1) {
        month = 12;
        year--;
      }
      this.setData({ currentYear: year, currentMonth: month });
      this.generateDays();
      this.triggerEvent('monthChange', { year, month });
    },

    nextMonth() {
      const { currentYear, currentMonth } = this.data;
      let year = currentYear;
      let month = currentMonth + 1;
      if (month > 12) {
        month = 1;
        year++;
      }
      this.setData({ currentYear: year, currentMonth: month });
      this.generateDays();
      this.triggerEvent('monthChange', { year, month });
    },

    onDayTap(e: WechatMiniprogram.TouchEvent) {
      const { day } = e.currentTarget.dataset;
      this.triggerEvent('dayTap', { day });
    },
  },
});
