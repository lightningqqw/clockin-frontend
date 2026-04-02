import { request } from './request';
import { IApiResponse, ILike, IUser } from '../types/index';

/**
 * 点赞相关 API
 */
export const likeApi = {
  /**
   * 点赞打卡记录
   */
  createLike(recordId: string): Promise<IApiResponse<ILike>> {
    return request.post('/likes', { recordId });
  },

  /**
   * 取消点赞
   */
  removeLike(recordId: string): Promise<IApiResponse<void>> {
    return request.delete(`/likes/${recordId}`);
  },

  /**
   * 获取点赞用户列表
   */
  getLikeUsers(recordId: string): Promise<IApiResponse<IUser[]>> {
    return request.get(`/likes/${recordId}/users`);
  },

  /**
   * 获取点赞数
   */
  getLikeCount(recordId: string): Promise<IApiResponse<{ count: number }>> {
    return request.get(`/likes/${recordId}/count`);
  },
};
