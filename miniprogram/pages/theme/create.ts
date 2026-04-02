import { themeApi } from '../../services/theme';
import { ROUTES } from '../../constants/index';
import { REPEAT_DAYS } from '../../constants/index';
import { showToast, getToday } from '../../utils/index';

Page({
  data: {
    form: {
      title: '',
      description: '',
      type: 'simple' as 'simple' | 'rich',
      startDate: getToday(),
      endDate: '',
      reminderTime: '',
      repeatDays: [0, 1, 2, 3, 4, 5, 6], // 默认每天
      allowSupplement: true,
      isPublic: false,
    },
    repeatDays: REPEAT_DAYS,
    submitting: false,
  },

  onLoad() {
    // 设置默认结束日期为30天后
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    this.setData({
      'form.endDate': endDate.toISOString().split('T')[0],
    });
  },

  // 输入框变化
  onInputChange(e: WechatMiniprogram.Input) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: e.detail.value,
    });
  },

  // 文本域变化
  onTextareaChange(e: WechatMiniprogram.Textarea) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: e.detail.value,
    });
  },

  // 选择类型
  selectType(e: WechatMiniprogram.TouchEvent) {
    const { type } = e.currentTarget.dataset;
    this.setData({ 'form.type': type });
  },

  // 日期变化
  onDateChange(e: WechatMiniprogram.Picker) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: e.detail.value,
    });
  },

  // 时间变化
  onTimeChange(e: WechatMiniprogram.Picker) {
    this.setData({
      'form.reminderTime': e.detail.value,
    });
  },

  // 切换重复日期
  toggleRepeatDay(e: WechatMiniprogram.TouchEvent) {
    const { day } = e.currentTarget.dataset;
    const repeatDays = [...this.data.form.repeatDays];
    const index = repeatDays.indexOf(day);
    if (index > -1) {
      repeatDays.splice(index, 1);
    } else {
      repeatDays.push(day);
    }
    repeatDays.sort();
    this.setData({ 'form.repeatDays': repeatDays });
  },

  // 开关变化
  onSwitchChange(e: WechatMiniprogram.Switch) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`form.${field}`]: e.detail.value,
    });
  },

  // 提交
  async submit() {
    const { form } = this.data;

    // 表单验证
    if (!form.title.trim()) {
      showToast('请输入主题名称', 'error');
      return;
    }
    if (!form.startDate) {
      showToast('请选择开始日期', 'error');
      return;
    }
    if (!form.endDate) {
      showToast('请选择结束日期', 'error');
      return;
    }
    if (form.repeatDays.length === 0) {
      showToast('请至少选择一天重复', 'error');
      return;
    }
    if (new Date(form.startDate) > new Date(form.endDate)) {
      showToast('开始日期不能晚于结束日期', 'error');
      return;
    }

    this.setData({ submitting: true });

    try {
      const res = await themeApi.createTheme(form);
      if (res.success && res.data) {
        showToast('创建成功', 'success');
        setTimeout(() => {
          wx.navigateBack();
        }, 500);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      showToast(err.message || '创建失败', 'error');
    } finally {
      this.setData({ submitting: false });
    }
  },
});
