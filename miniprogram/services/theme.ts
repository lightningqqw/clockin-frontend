import { request } from './request';
import {
  IApiResponse,
  ITheme,
  IPaginatedResponse,
} from '../types/index';

/**
 * 主题相关 API
 */
export const themeApi = {
  /**
   * 创建主题
   */
  createTheme(data: {
    title: string;
    description?: string;
    type: 'simple' | 'rich';
    startDate: string;
    endDate: string;
    reminderTime?: string;
    repeatDays: number[];
    allowSupplement: boolean;
    isPublic: boolean;
    coverImage?: string;
  }): Promise<IApiResponse<ITheme>> {
    return request.post('/themes', data);
  },

  /**
   * 获取我的主题列表
   */
  getMyThemes(page = 1, limit = 20): Promise<IApiResponse<IPaginatedResponse<ITheme>>> {
    return request.get('/themes/my', { page, limit });
  },

  /**
   * 获取主题详情
   */
  getThemeById(id: string): Promise<IApiResponse<ITheme & { isMember: boolean }>> {
    return request.get(`/themes/${id}`);
  },

  /**
   * 更新主题
   */
  updateTheme(id: string, data: Partial<ITheme>): Promise<IApiResponse<ITheme>> {
    return request.put(`/themes/${id}`, data);
  },

  /**
   * 删除主题
   */
  deleteTheme(id: string): Promise<IApiResponse<void>> {
    return request.delete(`/themes/${id}`);
  },

  /**
   * 加入主题
   */
  joinTheme(inviteCode: string): Promise<IApiResponse<{ themeId: string }>> {
    return request.post('/themes/join', { inviteCode });
  },

  /**
   * 退出主题
   */
  leaveTheme(id: string): Promise<IApiResponse<void>> {
    return request.post(`/themes/${id}/leave`);
  },

  /**
   * 获取主题成员
   */
  getThemeMembers(id: string): Promise<IApiResponse<Array<{
    userId: string;
    nickname: string;
    avatarUrl: string;
    role: 'creator' | 'member';
    joinedAt: string;
  }>>> {
    return request.get(`/themes/${id}/members`);
  },

  /**
   * 刷新邀请码
   */
  refreshInviteCode(id: string): Promise<IApiResponse<{ inviteCode: string }>> {
    return request.post(`/themes/${id}/refresh-code`);
  },
};
