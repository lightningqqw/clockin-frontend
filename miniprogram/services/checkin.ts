import { request } from './request';
import {
  IApiResponse,
  ICheckin,
  ICalendarDay,
  IPaginatedResponse,
} from '../types/index';

/**
 * 打卡相关 API
 */
export const checkinApi = {
  /**
   * 创建打卡记录
   */
  createCheckin(data: {
    themeId: string;
    content: string;
    images?: string[];
    location?: string;
    mood?: string;
    checkinDate?: string;
  }): Promise<IApiResponse<ICheckin>> {
    return request.post('/checkins', data);
  },

  /**
   * 获取主题打卡记录列表
   */
  getThemeCheckins(themeId: string, page = 1, limit = 20): Promise<IApiResponse<IPaginatedResponse<ICheckin>>> {
    return request.get(`/checkins/theme/${themeId}`, { page, limit });
  },

  /**
   * 获取我的打卡记录
   */
  getMyCheckins(themeId: string): Promise<IApiResponse<ICheckin[]>> {
    return request.get(`/checkins/theme/${themeId}/my`);
  },

  /**
   * 获取打卡详情
   */
  getCheckinById(id: string): Promise<IApiResponse<ICheckin>> {
    return request.get(`/checkins/${id}`);
  },

  /**
   * 更新打卡记录
   */
  updateCheckin(id: string, data: Partial<ICheckin>): Promise<IApiResponse<ICheckin>> {
    return request.put(`/checkins/${id}`, data);
  },

  /**
   * 删除打卡记录
   */
  deleteCheckin(id: string): Promise<IApiResponse<void>> {
    return request.delete(`/checkins/${id}`);
  },

  /**
   * 获取日历数据
   */
  getCalendar(themeId: string, year: number, month: number): Promise<IApiResponse<ICalendarDay[]>> {
    return request.get(`/checkins/theme/${themeId}/calendar`, { year, month });
  },

  /**
   * 检查今日是否可打卡
   */
  canCheckinToday(themeId: string): Promise<IApiResponse<{ canCheckin: boolean; hasCheckedToday: boolean }>> {
    return request.get(`/checkins/theme/${themeId}/can-checkin`);
  },
};
