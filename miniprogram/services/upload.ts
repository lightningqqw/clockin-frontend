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
    return request.upload('/upload/single', filePath, 'file');
  },

  /**
   * 上传多个文件
   */
  uploadMultiple(filePaths: string[]): Promise<IApiResponse<{ urls: string[] }>> {
    return new Promise(async (resolve, reject) => {
      try {
        const urls: string[] = [];
        for (const filePath of filePaths) {
          const res = await this.uploadSingle(filePath);
          if (res.success && res.data) {
            urls.push(res.data.url);
          }
        }
        resolve({ success: true, data: { urls } });
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * 上传富文本图片
   */
  uploadRichTextImage(filePath: string): Promise<IApiResponse<{ url: string }>> {
    return request.upload('/upload/image', filePath, 'image');
  },

  /**
   * 删除已上传的文件
   */
  deleteFile(url: string): Promise<IApiResponse<void>> {
    return request.delete('/upload/delete', { url } as any);
  },
};
