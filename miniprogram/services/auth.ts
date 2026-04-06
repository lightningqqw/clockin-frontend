import { request } from './request';
import { IApiResponse, ILoginResponse, IUser, IUserProfile, IUserStats, INotification, IPaginatedResponse } from '../types/index';

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 微信登录
   */
  wechatLogin(code: string, userInfo?: WechatMiniprogram.UserInfo): Promise<IApiResponse<ILoginResponse>> {
    const data: { code: string; userInfo?: WechatMiniprogram.UserInfo } = { code };
    if (userInfo) {
      data.userInfo = userInfo;
    }
    return request.post('/auth/wechat-login', data);
  },

  /**
   * 刷新 Token
   */
  refreshToken(): Promise<IApiResponse<{ token: string }>> {
    return request.post('/auth/refresh-token');
  },
};

/**
 * 用户相关 API
 */
export const userApi = {
  /**
   * 获取个人资料
   */
  getProfile(): Promise<IApiResponse<IUser>> {
    return request.get('/users/profile');
  },

  /**
   * 更新个人资料
   */
  updateProfile(data: Partial<IUserProfile>): Promise<IApiResponse<IUser>> {
    return request.put('/users/profile', data);
  },

  /**
   * 获取用户统计
   */
  getStats(): Promise<IApiResponse<IUserStats>> {
    return request.get('/users/stats');
  },

  /**
   * 获取通知列表
   */
  getNotifications(page = 1, limit = 20): Promise<IApiResponse<IPaginatedResponse<INotification>>> {
    return request.get('/users/notifications', { page, limit });
  },

  /**
   * 标记通知为已读
   */
  markNotificationRead(id: string): Promise<IApiResponse<void>> {
    return request.put(`/users/notifications/${id}/read`);
  },

  /**
   * 标记所有通知为已读
   */
  markAllNotificationsRead(): Promise<IApiResponse<void>> {
    return request.put('/users/notifications/read-all');
  },

  /**
   * 获取未读通知数
   */
  getUnreadCount(): Promise<IApiResponse<{ count: number }>> {
    return request.get('/users/notifications/unread-count');
  },
};
