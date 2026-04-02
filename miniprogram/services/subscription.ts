import { request } from './request';
import { IApiResponse, ISubscription } from '../types/index';

/**
 * 订阅相关 API
 */
export const subscriptionApi = {
  /**
   * 创建订阅
   */
  createSubscription(themeId: string, templateId: string): Promise<IApiResponse<ISubscription>> {
    return request.post('/subscriptions', { themeId, templateId });
  },

  /**
   * 获取我的订阅列表
   */
  getUserSubscriptions(): Promise<IApiResponse<ISubscription[]>> {
    return request.get('/subscriptions/my');
  },

  /**
   * 获取主题订阅用户列表
   */
  getThemeSubscribers(themeId: string): Promise<IApiResponse<ISubscription[]>> {
    return request.get(`/subscriptions/theme/${themeId}`);
  },

  /**
   * 取消订阅
   */
  cancelSubscription(id: string): Promise<IApiResponse<void>> {
    return request.delete(`/subscriptions/${id}`);
  },
};
