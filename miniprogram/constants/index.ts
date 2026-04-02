/**
 * 全局常量配置
 */

// API 基础配置
export const API_BASE_URL = 'http://localhost:3000/api'; // 开发环境，生产环境需替换

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER_INFO: 'userInfo',
  THEME_LIST_CACHE: 'themeListCache',
  SETTINGS: 'settings',
};

// 页面路由
export const ROUTES = {
  HOME: '/pages/index/index',
  LOGIN: '/pages/login/login',
  THEME_LIST: '/pages/theme/list',
  THEME_DETAIL: '/pages/theme/detail',
  THEME_CREATE: '/pages/theme/create',
  THEME_JOIN: '/pages/theme/join',
  CHECKIN_CREATE: '/pages/checkin/create',
  CHECKIN_DETAIL: '/pages/checkin/detail',
  CHECKIN_CALENDAR: '/pages/checkin/calendar',
  USER_PROFILE: '/pages/user/profile',
  USER_STATS: '/pages/user/stats',
  USER_NOTIFICATIONS: '/pages/user/notifications',
  SETTINGS: '/pages/settings/settings',
};

// 主题类型
export const THEME_TYPES = {
  SIMPLE: 'simple',
  RICH: 'rich',
};

// 心情选项
export const MOOD_OPTIONS = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'excited', label: '兴奋', emoji: '🤩' },
  { value: 'calm', label: '平静', emoji: '😌' },
  { value: 'tired', label: '疲惫', emoji: '😴' },
  { value: 'sad', label: '难过', emoji: '😢' },
  { value: 'angry', label: '生气', emoji: '😠' },
];

// 重复日期选项
export const REPEAT_DAYS = [
  { value: 0, label: '周日' },
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
];

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// 错误码
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
};

// 默认主题颜色
export const THEME_COLORS = {
  PRIMARY: '#07c160',
  SECONDARY: '#576b95',
  WARNING: '#fa5151',
  BACKGROUND: '#f7f7f7',
  BORDER: '#e5e5e5',
  TEXT: '#333333',
  TEXT_SECONDARY: '#666666',
  TEXT_LIGHT: '#999999',
};
