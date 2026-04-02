/**
 * 日期工具函数
 */

/**
 * 格式化日期
 */
export function formatDate(date: Date | string | number, format = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  const second = d.getSeconds();

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return format
    .replace('YYYY', `${year}`)
    .replace('MM', pad(month))
    .replace('DD', pad(day))
    .replace('HH', pad(hour))
    .replace('mm', pad(minute))
    .replace('ss', pad(second));
}

/**
 * 获取今日日期字符串
 */
export function getToday(): string {
  return formatDate(new Date(), 'YYYY-MM-DD');
}

/**
 * 获取当前月份的第一天和最后一天
 */
export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return {
    start: formatDate(start, 'YYYY-MM-DD'),
    end: formatDate(end, 'YYYY-MM-DD'),
  };
}

/**
 * 获取指定月份的所有日期
 */
export function getMonthDays(year: number, month: number): Array<{
  date: string;
  day: number;
  weekDay: number;
  isCurrentMonth: boolean;
}> {
  const days: Array<{ date: string; day: number; weekDay: number; isCurrentMonth: boolean }> = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const prevMonthLastDay = new Date(year, month - 1, 0);

  // 上个月的日期（补全第一周）
  const firstWeekDay = firstDay.getDay();
  for (let i = firstWeekDay - 1; i >= 0; i--) {
    const d = new Date(prevMonthLastDay);
    d.setDate(prevMonthLastDay.getDate() - i);
    days.push({
      date: formatDate(d, 'YYYY-MM-DD'),
      day: d.getDate(),
      weekDay: d.getDay(),
      isCurrentMonth: false,
    });
  }

  // 当前月的日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month - 1, i);
    days.push({
      date: formatDate(d, 'YYYY-MM-DD'),
      day: i,
      weekDay: d.getDay(),
      isCurrentMonth: true,
    });
  }

  // 下个月的日期（补全最后一周）
  const remainingDays = 42 - days.length; // 6行 x 7列 = 42
  for (let i = 1; i <= remainingDays; i++) {
    const d = new Date(year, month, i);
    days.push({
      date: formatDate(d, 'YYYY-MM-DD'),
      day: i,
      weekDay: d.getDay(),
      isCurrentMonth: false,
    });
  }

  return days;
}

/**
 * 计算两个日期之间的天数差
 */
export function diffDays(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diff = Math.abs(d1.getTime() - d2.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * 判断是否为今天
 */
export function isToday(date: string): boolean {
  return date === getToday();
}

/**
 * 判断日期是否在未来
 */
export function isFuture(date: string): boolean {
  return new Date(date) > new Date();
}

/**
 * 相对时间描述
 */
export function relativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else if (days < 30) {
    return `${Math.floor(days / 7)}周前`;
  } else {
    return formatDate(target, 'YYYY-MM-DD');
  }
}
