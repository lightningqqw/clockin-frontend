import { request } from './request';
import {
  IApiResponse,
  IThemeStatistics,
  IPersonalStatistics,
  IHeatmapData,
} from '../types/index';

/**
 * 统计相关 API
 */
export const statisticsApi = {
  /**
   * 获取主题统计
   */
  getThemeStatistics(themeId: string): Promise<IApiResponse<IThemeStatistics>> {
    return request.get(`/statistics/theme/${themeId}`);
  },

  /**
   * 获取个人统计
   */
  getPersonalStatistics(themeId: string): Promise<IApiResponse<IPersonalStatistics>> {
    return request.get(`/statistics/theme/${themeId}/personal`);
  },

  /**
   * 获取热力图数据
   */
  getHeatmapData(themeId: string): Promise<IApiResponse<IHeatmapData[]>> {
    return request.get(`/statistics/theme/${themeId}/heatmap`);
  },
};
