/**
 * 通用工具函数
 */

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(null, args);
    }, delay);
  };
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  return function (...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(null, args);
    }
  };
}

/**
 * 显示 Toast
 */
export function showToast(title: string, icon: 'success' | 'error' | 'loading' | 'none' = 'none'): Promise<void> {
  return new Promise((resolve) => {
    wx.showToast({
      title,
      icon,
      mask: icon === 'loading',
      complete: () => resolve(),
    });
  });
}

/**
 * 显示 Modal
 */
export function showModal(title: string, content: string): Promise<boolean> {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => resolve(res.confirm),
    });
  });
}

/**
 * 显示 Loading
 */
export function showLoading(title = '加载中...'): void {
  wx.showLoading({ title, mask: true });
}

/**
 * 隐藏 Loading
 */
export function hideLoading(): void {
  wx.hideLoading();
}

/**
 * 导航到页面
 */
export function navigateTo(url: string): void {
  wx.navigateTo({ url });
}

/**
 * 重定向到页面
 */
export function redirectTo(url: string): void {
  wx.redirectTo({ url });
}

/**
 * 切换到 Tab 页面
 */
export function switchTab(url: string): void {
  wx.switchTab({ url });
}

/**
 * 返回上一页
 */
export function navigateBack(delta = 1): void {
  wx.navigateBack({ delta });
}

/**
 * 预览图片
 */
export function previewImage(urls: string[], current = 0): void {
  wx.previewImage({ urls, current: urls[current] });
}

/**
 * 选择图片
 */
export function chooseImage(count = 1, sourceType: ('album' | 'camera')[] = ['album', 'camera']): Promise<string[]> {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      sourceType,
      success: (res) => {
        resolve(res.tempFiles.map((f) => f.tempFilePath));
      },
      fail: reject,
    });
  });
}

/**
 * 复制到剪贴板
 */
export function setClipboard(data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data,
      success: () => resolve(),
      fail: reject,
    });
  });
}

/**
 * 获取系统信息
 */
export function getSystemInfo(): WechatMiniprogram.SystemInfo {
  return wx.getSystemInfoSync();
}

/**
 * 安全区域高度
 */
export function getSafeArea(): { top: number; bottom: number; height: number } {
  const info = getSystemInfo();
  const { safeArea, screenHeight } = info;
  return {
    top: safeArea?.top || 0,
    bottom: screenHeight - (safeArea?.bottom || screenHeight),
    height: safeArea?.height || screenHeight,
  };
}

/**
 * 深拷贝
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 生成 UUID
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 数组分块
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
