/**
 * 类型定义
 */

// 用户相关
export interface IUser {
  id: string;
  openId: string;
  unionId?: string;
  nickname: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUserProfile {
  id: string;
  nickname: string;
  avatarUrl: string;
  gender?: number;
  country?: string;
  province?: string;
  city?: string;
}

export interface IUserStats {
  totalCheckins: number;
  totalThemes: number;
  totalLikes: number;
  streakDays: number;
}

// 主题相关
export interface ITheme {
  id: string;
  title: string;
  description?: string;
  type: 'simple' | 'rich';
  coverImage?: string;
  startDate: string;
  endDate: string;
  reminderTime?: string;
  repeatDays: number[];
  allowSupplement: boolean;
  isPublic: boolean;
  inviteCode: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  isMember?: boolean;
  role?: 'creator' | 'member';
  memberCount?: number;
}

// 位置信息
export interface ILocationInfo {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

// 打卡记录相关
export interface ICheckin {
  id: string;
  themeId: string;
  userId: string;
  content: string;
  images?: string[];
  location?: ILocationInfo;
  mood?: string;
  checkinDate: string;
  createdAt: string;
  updatedAt: string;
  user?: IUser;
  likeCount?: number;
  hasLiked?: boolean;
}

export interface ICalendarDay {
  date: string;
  hasCheckin: boolean;
  checkinCount: number;
}

// 点赞相关
export interface ILike {
  id: string;
  recordId: string;
  userId: string;
  createdAt: string;
  user?: IUser;
}

// 通知相关
export interface INotification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'system';
  title: string;
  content: string;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

// 统计相关
export interface IThemeStatistics {
  themeId: string;
  totalCheckins: number;
  totalMembers: number;
  avgCheckinsPerDay: number;
  topContributors: Array<{
    userId: string;
    nickname: string;
    avatarUrl: string;
    count: number;
  }>;
}

export interface IPersonalStatistics {
  themeId: string;
  totalCheckins: number;
  streakDays: number;
  completionRate: number;
  ranking: number;
}

export interface IHeatmapData {
  date: string;
  count: number;
}

// 订阅相关
export interface ISubscription {
  id: string;
  userId: string;
  themeId: string;
  createdAt: string;
}

// 分页响应
export interface IPaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// API 响应
export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

// 登录响应
export interface ILoginResponse {
  token: string;
  refreshToken: string;
  user: IUser;
}
