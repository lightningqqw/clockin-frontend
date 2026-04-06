import { userApi } from '../../services/auth';
import { userStorage } from '../../utils/storage';
import { ROUTES } from '../../constants/index';
import { showToast } from '../../utils/index';
import { IUserProfile } from '../../types/index';

Page({
  data: {
    form: {
      nickname: '',
      bio: '',
      avatarUrl: '',
    } as IUserProfile,
    originalForm: {} as IUserProfile,
    submitting: false,
    statusBarHeight: 44,
    navBarHeight: 76,
  },

  onLoad() {
    // 获取系统信息，计算状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight || 44;
    const navBarHeight = statusBarHeight + 32;
    this.setData({
      statusBarHeight,
      navBarHeight,
    });

    this.loadUserInfo();
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = userStorage.get();
    if (userInfo) {
      const form = {
        nickname: userInfo.nickname || '',
        bio: userInfo.bio || '',
        avatarUrl: userInfo.avatarUrl || '',
      };
      this.setData({
        form,
        originalForm: { ...form },
      });
    }
  },

  // 昵称输入
  onNicknameInput(e: any) {
    this.setData({
      'form.nickname': e.detail.value,
    });
  },

  // 简介输入
  onBioInput(e: any) {
    this.setData({
      'form.bio': e.detail.value,
    });
  },

  // 选择头像
  async chooseAvatar() {
    try {
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        sizeType: ['compressed'],
      });

      if (res.tempFiles && res.tempFiles.length > 0) {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        // TODO: 上传头像到服务器
        // const uploadRes = await uploadApi.uploadSingle(tempFilePath);
        // if (uploadRes.success && uploadRes.data) {
        //   this.setData({ 'form.avatarUrl': uploadRes.data.url });
        // }

        // 临时使用本地路径
        this.setData({ 'form.avatarUrl': tempFilePath });
        showToast('头像已选择，保存后生效', 'success');
      }
    } catch (err: any) {
      if (err.errMsg && err.errMsg.includes('cancel')) {
        return;
      }
      showToast('选择头像失败', 'error');
    }
  },

  // 保存资料
  async saveProfile() {
    const { form, submitting } = this.data;

    if (submitting) {
      return;
    }

    // 验证
    if (!form.nickname.trim()) {
      showToast('请输入昵称', 'error');
      return;
    }

    if (form.nickname.length > 20) {
      showToast('昵称不能超过20个字符', 'error');
      return;
    }

    if (form.bio && form.bio.length > 100) {
      showToast('简介不能超过100个字符', 'error');
      return;
    }

    this.setData({ submitting: true });

    try {
      const res = await userApi.updateProfile({
        nickname: form.nickname.trim(),
        bio: form.bio.trim(),
        avatarUrl: form.avatarUrl,
      });

      if (res.success && res.data) {
        // 更新本地存储
        const userInfo = userStorage.get();
        if (userInfo) {
          userStorage.set({
            ...userInfo,
            nickname: form.nickname.trim(),
            bio: form.bio.trim(),
            avatarUrl: form.avatarUrl,
          });
        }

        showToast('保存成功', 'success');
        setTimeout(() => {
          wx.navigateBack();
        }, 500);
      } else {
        throw new Error(res.message || '保存失败');
      }
    } catch (err: any) {
      showToast(err.message || '保存失败', 'error');
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 快捷设置简介
  setBio(e: WechatMiniprogram.TouchEvent) {
    const { bio } = e.currentTarget.dataset;
    this.setData({
      'form.bio': bio,
    });
  },

  // 重置表单
  resetForm() {
    const { originalForm } = this.data;
    this.setData({
      form: { ...originalForm },
    });
    showToast('已重置', 'none');
  },
});
