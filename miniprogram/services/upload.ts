import { request } from './request';
import { IApiResponse } from '../types/index';

/**
 * 上传相关 API
 */
export const uploadApi = {
  /**
   * 上传单个文件
   */
  uploadSingle(filePath: string): Promise<IApiResponse<{ url: string }>> {
    if (!filePath) {
      return Promise.reject(new Error('文件路径不能为空'));
    }
    return request.upload('/uploads/single', filePath, 'file');
  },

  /**
   * 上传多个文件
   */
  async uploadMultiple(filePaths: string[]): Promise<IApiResponse<{ urls: string[] }>> {
    if (!filePaths || filePaths.length === 0) {
      return { success: true, data: { urls: [] } };
    }

    const urls: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < filePaths.length; i++) {
      try {
        const res = await this.uploadSingle(filePaths[i]);
        if (res.success && res.data && res.data.url) {
          urls.push(res.data.url);
        } else {
          errors.push(`第 ${i + 1} 张: ${res.message || '上传失败'}`);
        }
      } catch (error: any) {
        errors.push(`第 ${i + 1} 张: ${error.message || '上传失败'}`);
      }
    }

    if (errors.length > 0 && urls.length === 0) {
      // 全部失败
      throw new Error(errors.join('; '));
    }

    return { success: true, data: { urls } };
  },

  /**
   * 上传富文本图片
   */
  uploadRichTextImage(filePath: string): Promise<IApiResponse<{ url: string }>> {
    if (!filePath) {
      return Promise.reject(new Error('文件路径不能为空'));
    }
    return request.upload('/uploads/image', filePath, 'image');
  },

  /**
   * 删除已上传的文件
   */
  deleteFile(url: string): Promise<IApiResponse<void>> {
    return request.post('/uploads/delete', { url });
  },
};
