import { checkinApi } from '../../services/checkin';
import { themeApi } from '../../services/theme';
import { uploadApi } from '../../services/upload';
import { MOOD_OPTIONS } from '../../constants/index';
import { ROUTES } from '../../constants/index';
import { showToast, previewImage } from '../../utils/index';
import { getToday } from '../../utils/date';

Page({
  data: {
    themeId: '',
    themeTitle: '',
    theme: {} as any,
    content: '',
    images: [] as string[],
    mood: '',
    location: '',
    checkinDate: getToday(),
    moodOptions: MOOD_OPTIONS,
    submitting: false,
    contentLength: 0,
    uploadProgress: 0,
    statusBarHeight: 44,
    navBarHeight: 76,
  },

  async onLoad(options) {
    const themeId = options.themeId || '';
    this.setData({ themeId });

    // 获取系统信息，计算状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 44;
    const navBarHeight = statusBarHeight + 32;
    this.setData({
      statusBarHeight,
      navBarHeight,
    });

    // 加载主题信息
    if (themeId) {
      try {
        const res = await themeApi.getThemeById(themeId);
        if (res.success && res.data) {
          this.setData({
            themeTitle: res.data.title,
            theme: res.data,
          });
        }
      } catch (err) {
        showToast('加载主题失败', 'error');
      }
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 生成AI灵感
  generateAI() {
    showToast('AI灵感生成中...', 'loading');
    // TODO: 接入AI灵感生成接口
    setTimeout(() => {
      showToast('AI灵感生成成功', 'success');
    }, 1500);
  },

  // 查看往日灵感
  viewHistory() {
    showToast('功能开发中', 'none');
    // TODO: 跳转到历史灵感页面
  },

  // 内容变化
  onContentChange(e: any) {
    const content = e.detail.value;
    this.setData({
      content,
      contentLength: content.length,
    });
  },

  // 选择图片
  async chooseImage() {
    const { images } = this.data;
    const count = 9 - images.length;

    try {
      // 使用 wx.chooseMedia 选择图片
      const res = await wx.chooseMedia({
        count,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        sizeType: ['compressed'], // 使用压缩图片，减小上传大小
      });

      if (!res.tempFiles || res.tempFiles.length === 0) {
        return;
      }

      const newImages = res.tempFiles.map((f) => f.tempFilePath);
      this.setData({
        images: [...images, ...newImages],
      });
    } catch (err: any) {
      // 用户取消或其他错误
      if (err.errMsg && err.errMsg.includes('cancel')) {
        // 用户取消，不处理
        return;
      }
      console.error('选择图片失败:', err);
      showToast('选择图片失败，请重试', 'error');
    }
  },

  // 预览图片
  previewImage(e: WechatMiniprogram.TouchEvent) {
    const { url } = e.currentTarget.dataset;
    previewImage(this.data.images, this.data.images.indexOf(url));
  },

  // 删除图片
  removeImage(e: WechatMiniprogram.TouchEvent) {
    const { index } = e.currentTarget.dataset;
    const { images } = this.data;
    images.splice(index, 1);
    this.setData({ images });
  },

  // 选择心情
  selectMood(e: WechatMiniprogram.TouchEvent) {
    const { mood } = e.currentTarget.dataset;
    this.setData({ mood });
  },

  // 获取位置
  async getLocation() {
    try {
      await wx.getLocation({
        type: 'wgs84',
      });
      // 这里可以调用逆地理编码获取地址名称
      this.setData({ location: '北京市朝阳区' }); // 示例
    } catch (err) {
      showToast('获取位置失败，请检查权限设置', 'error');
    }
  },

  // 日期变化
  onDateChange(e: any) {
    this.setData({ checkinDate: e.detail.value });
  },

  // 提交
  async submit() {
    const { themeId, content, images, mood, location, checkinDate, theme } = this.data;

    // 验证
    if (!content.trim() && images.length === 0) {
      showToast('请输入打卡内容或上传图片', 'error');
      return;
    }

    this.setData({ submitting: true, uploadProgress: 0 });

    try {
      // 上传图片
      let imageUrls: string[] = [];
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imagePath = images[i];
          try {
            const res = await uploadApi.uploadSingle(imagePath);
            if (res.success && res.data && res.data.url) {
              imageUrls.push(res.data.url);
              // 更新上传进度
              this.setData({ uploadProgress: Math.round(((i + 1) / images.length) * 100) });
            } else {
              throw new Error(res.message || '图片上传失败');
            }
          } catch (uploadErr: any) {
            console.error('图片上传失败:', uploadErr);
            throw new Error(`第 ${i + 1} 张图片上传失败: ${uploadErr.message || '请重试'}`);
          }
        }
      }

      // 创建打卡
      const res = await checkinApi.createCheckin({
        themeId,
        content: content.trim(),
        images: imageUrls,
        mood: mood || undefined,
        location: location ? { latitude: 39.9, longitude: 116.4, address: location } : undefined,
        checkinDate: theme.allowSupplement ? checkinDate : getToday(),
      });

      if (res.success) {
        showToast('打卡成功', 'success');
        setTimeout(() => {
          wx.navigateBack();
        }, 500);
      } else {
        throw new Error(res.message || '打卡失败');
      }
    } catch (err: any) {
      showToast(err.message || '打卡失败', 'error');
    } finally {
      this.setData({ submitting: false, uploadProgress: 0 });
    }
  },
});
