import { STORAGE_KEYS } from '../constants/index';

/**
 * 本地存储工具类
 */
class Storage {
  /**
   * 设置缓存
   */
  set<T>(key: string, value: T): void {
    try {
      wx.setStorageSync(key, value);
    } catch (e) {
      console.error('Storage set error:', e);
    }
  }

  /**
   * 获取缓存
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const value = wx.getStorageSync(key);
      return value !== undefined ? value : defaultValue;
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  }

  /**
   * 移除缓存
   */
  remove(key: string): void {
    try {
      wx.removeStorageSync(key);
    } catch (e) {
      console.error('Storage remove error:', e);
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    try {
      wx.clearStorageSync();
    } catch (e) {
      console.error('Storage clear error:', e);
    }
  }

  /**
   * 获取缓存信息
   */
  info(): WechatMiniprogram.GetStorageInfoSyncOption {
    try {
      return wx.getStorageInfoSync();
    } catch (e) {
      console.error('Storage info error:', e);
      return { keys: [], currentSize: 0, limitSize: 0 };
    }
  }
}

export const storage = new Storage();

// Token 快捷操作
export const tokenStorage = {
  set: (token: string) => storage.set(STORAGE_KEYS.TOKEN, token),
  get: () => storage.get<string>(STORAGE_KEYS.TOKEN, ''),
  remove: () => storage.remove(STORAGE_KEYS.TOKEN),
};

// 用户信息快捷操作
export const userStorage = {
  set: (user: any) => storage.set(STORAGE_KEYS.USER_INFO, user),
  get: () => storage.get<any>(STORAGE_KEYS.USER_INFO),
  remove: () => storage.remove(STORAGE_KEYS.USER_INFO),
};
