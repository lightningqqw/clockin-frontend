import { checkinApi } from '../../services/checkin';
import { themeApi } from '../../services/theme';
import { uploadApi } from '../../services/upload';
import { MOOD_OPTIONS } from '../../constants/index';
import { ROUTES } from '../../constants/index';
import { getToday, showToast, previewImage } from '../../utils/index';

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
  },

  async onLoad(options) {
    const themeId = options.themeId || '';
    this.setData({ themeId });

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

  // 内容变化
  onContentChange(e: WechatMiniprogram.Textarea) {
    this.setData({ content: e.detail.value });
  },

  // 选择图片
  async chooseImage() {
    const { images } = this.data;
    const count = 9 - images.length;

    try {
      const res = await wx.chooseMedia({
        count,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
      });

      const newImages = res.tempFiles.map((f) => f.tempFilePath);
      this.setData({
        images: [...images, ...newImages],
      });
    } catch (err) {
      // 用户取消
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
  onDateChange(e: WechatMiniprogram.Picker) {
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

    this.setData({ submitting: true });

    try {
      // 上传图片
      let imageUrls: string[] = [];
      if (images.length > 0) {
        for (const imagePath of images) {
          const res = await uploadApi.uploadSingle(imagePath);
          if (res.success && res.data) {
            imageUrls.push(res.data.url);
          }
        }
      }

      // 创建打卡
      const res = await checkinApi.createCheckin({
        themeId,
        content: content.trim(),
        images: imageUrls,
        mood,
        location,
        checkinDate: theme.allowSupplement ? checkinDate : getToday(),
      });

      if (res.success) {
        showToast('打卡成功', 'success');
        setTimeout(() => {
          wx.navigateBack();
        }, 500);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      showToast(err.message || '打卡失败', 'error');
    } finally {
      this.setData({ submitting: false });
    }
  },
});
