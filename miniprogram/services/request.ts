import { API_BASE_URL, ERROR_CODES } from '../constants/index';
import { tokenStorage } from '../utils/storage';
import { IApiResponse } from '../types/index';

/**
 * 请求拦截器类型
 */
type RequestInterceptor = (options: WechatMiniprogram.RequestOption) => WechatMiniprogram.RequestOption | Promise<WechatMiniprogram.RequestOption>;
type ResponseInterceptor = (response: any) => any;

/**
 * 请求管理类
 */
class Request {
  private baseURL: string;
  private requestInterceptor?: RequestInterceptor;
  private responseInterceptor?: ResponseInterceptor;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * 设置请求拦截器
   */
  setRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptor = interceptor;
  }

  /**
   * 设置响应拦截器
   */
  setResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptor = interceptor;
  }

  /**
   * 核心请求方法
   */
  private async request<T>(options: WechatMiniprogram.RequestOption): Promise<T> {
    let config = { ...options };

    // 应用请求拦截器
    if (this.requestInterceptor) {
      config = await this.requestInterceptor(config);
    }

    return new Promise((resolve, reject) => {
      wx.request({
        ...config,
        success: (res) => {
          let response = res;

          // 应用响应拦截器
          if (this.responseInterceptor) {
            response = this.responseInterceptor(res);
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response.data as T);
          } else if (res.statusCode === ERROR_CODES.UNAUTHORIZED) {
            // Token 过期，清除登录状态并跳转到登录页
            tokenStorage.remove();
            wx.redirectTo({ url: '/pages/login/login' });
            reject(new Error('登录已过期，请重新登录'));
          } else {
            const data = res.data as any;
            reject(new Error(data?.message || `请求失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || '网络请求失败'));
        },
      });
    });
  }

  /**
   * GET 请求
   */
  get<T>(url: string, params?: Record<string, any>, options?: Partial<WechatMiniprogram.RequestOption>): Promise<T> {
    const queryString = params
      ? '?' +
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join('&')
      : '';

    return this.request<T>({
      url: `${this.baseURL}${url}${queryString}`,
      method: 'GET',
      header: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
  }

  /**
   * POST 请求
   */
  post<T>(url: string, data?: any, options?: Partial<WechatMiniprogram.RequestOption>): Promise<T> {
    return this.request<T>({
      url: `${this.baseURL}${url}`,
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
  }

  /**
   * PUT 请求
   */
  put<T>(url: string, data?: any, options?: Partial<WechatMiniprogram.RequestOption>): Promise<T> {
    return this.request<T>({
      url: `${this.baseURL}${url}`,
      method: 'PUT',
      data,
      header: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
  }

  /**
   * DELETE 请求
   */
  delete<T>(url: string, options?: Partial<WechatMiniprogram.RequestOption>): Promise<T> {
    return this.request<T>({
      url: `${this.baseURL}${url}`,
      method: 'DELETE',
      header: {
        'Content-Type': 'application/json',
      },
      ...options,
    });
  }

  /**
   * 上传文件
   */
  upload<T>(url: string, filePath: string, name = 'file', formData?: Record<string, any>): Promise<T> {
    return new Promise((resolve, reject) => {
      const token = tokenStorage.get();
      wx.uploadFile({
        url: `${this.baseURL}${url}`,
        filePath,
        name,
        formData,
        header: {
          Authorization: token ? `Bearer ${token}` : '',
        },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(res.data) as T);
            } catch {
              resolve(res.data as T);
            }
          } else {
            reject(new Error(`上传失败: ${res.statusCode}`));
          }
        },
        fail: reject,
      });
    });
  }
}

// 创建请求实例
export const request = new Request(API_BASE_URL);

// 配置拦截器
request.setRequestInterceptor(async (config) => {
  const token = tokenStorage.get();
  if (token) {
    config.header = {
      ...config.header,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

request.setResponseInterceptor((response) => {
  return response;
});
