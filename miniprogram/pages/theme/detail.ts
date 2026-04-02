import { themeApi } from '../../services/theme';
import { checkinApi } from '../../services/checkin';
import { likeApi } from '../../services/like';
import { userStorage } from '../../utils/storage';
import { ROUTES } from '../../constants/index';
import { showToast, showModal, setClipboard, previewImage } from '../../utils/index';
import { ITheme, ICheckin } from '../../types/index';

Page({
  data: {
    themeId: '',
    theme: {} as ITheme,
    isCreator: false,
    userId: '',
    canCheckin: true,
    streakDays: 0,
    loading: false,
    activeTab: 'all', // 'all' | 'mine'
    checkins: [] as ICheckin[],
    calendar: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      dates: [] as string[],
    },
  },

  onLoad(options) {
    const userInfo = userStorage.get();
    this.setData({
      themeId: options.id || '',
      userId: userInfo?.id || '',
    });
    this.loadThemeDetail();
  },

  onShow() {
    if (this.data.themeId) {
      this.loadCheckins();
      this.checkCanCheckin();
    }
  },

  // 加载主题详情
  async loadThemeDetail() {
    const { themeId } = this.data;
    if (!themeId) return;

    this.setData({ loading: true });
    try {
      const res = await themeApi.getThemeById(themeId);
      if (res.success && res.data) {
        this.setData({
          theme: res.data,
          isCreator: res.data.role === 'creator',
        });
        this.loadCheckins();
        this.loadCalendar();
        this.checkCanCheckin();
      }
    } catch (err) {
      showToast('加载失败', 'error');
    } finally {
      this.setData({ loading: false });
    }
  },

  // 检查是否可以打卡
  async checkCanCheckin() {
    try {
      const res = await checkinApi.canCheckinToday(this.data.themeId);
      if (res.success) {
        this.setData({ canCheckin: res.data?.canCheckin ?? true });
      }
    } catch (err) {
      console.error('检查打卡状态失败:', err);
    }
  },

  // 加载打卡记录
  async loadCheckins() {
    const { themeId, activeTab } = this.data;
    try {
      if (activeTab === 'mine') {
        const res = await checkinApi.getMyCheckins(themeId);
        if (res.success) {
          this.setData({ checkins: res.data || [] });
        }
      } else {
        const res = await checkinApi.getThemeCheckins(themeId, 1, 50);
        if (res.success && res.data) {
          this.setData({ checkins: res.data.list });
        }
      }
    } catch (err) {
      console.error('加载打卡记录失败:', err);
    }
  },

  // 加载日历数据
  async loadCalendar() {
    const { themeId, calendar } = this.data;
    try {
      const res = await checkinApi.getCalendar(themeId, calendar.year, calendar.month);
      if (res.success && res.data) {
        const dates = res.data.filter((d) => d.hasCheckin).map((d) => d.date);
        this.setData({
          'calendar.dates': dates,
        });
      }
    } catch (err) {
      console.error('加载日历失败:', err);
    }
  },

  // 切换标签
  switchTab(e: WechatMiniprogram.TouchEvent) {
    const { tab } = e.currentTarget.dataset;
    this.setData({ activeTab: tab });
    this.loadCheckins();
  },

  // 月份变化
  onMonthChange(e: WechatMiniprogram.TouchEvent) {
    const { year, month } = e.detail;
    this.setData({
      'calendar.year': year,
      'calendar.month': month,
    });
    this.loadCalendar();
  },

  // 选择日期
  onDayTap(e: WechatMiniprogram.TouchEvent) {
    const { day } = e.detail;
    // 可以跳转到当天的打卡详情
    showToast(`选择了 ${day.date}`);
  },

  // 去打卡
  goToCheckin() {
    if (!this.data.canCheckin) {
      showToast('今日已打卡');
      return;
    }
    wx.navigateTo({
      url: `${ROUTES.CHECKIN_CREATE}?themeId=${this.data.themeId}`,
    });
  },

  // 去日历页
  goToCalendar() {
    wx.navigateTo({
      url: `${ROUTES.CHECKIN_CALENDAR}?themeId=${this.data.themeId}`,
    });
  },

  // 显示成员列表
  async showMembers() {
    try {
      const res = await themeApi.getThemeMembers(this.data.themeId);
      if (res.success && res.data) {
        const members = res.data.map((m) => `${m.nickname} (${m.role === 'creator' ? '创建者' : '成员'})`).join('\n');
        wx.showModal({
          title: '成员列表',
          content: members,
          showCancel: false,
        });
      }
    } catch (err) {
      showToast('加载成员失败', 'error');
    }
  },

  // 显示统计
  showStats() {
    wx.navigateTo({
      url: `${ROUTES.USER_STATS}?themeId=${this.data.themeId}`,
    });
  },

  // 显示邀请码
  async showInviteCode() {
    const { theme } = this.data;
    const content = `邀请码：${theme.inviteCode}\n复制后分享给朋友，让他们加入这个主题吧！`;

    wx.showModal({
      title: '邀请成员',
      content,
      confirmText: '复制',
      success: async (res) => {
        if (res.confirm) {
          await setClipboard(theme.inviteCode);
          showToast('已复制到剪贴板', 'success');
        }
      },
    });
  },

  // 加入主题
  async joinTheme() {
    wx.navigateTo({ url: ROUTES.THEME_JOIN });
  },

  // 去打卡详情
  goToCheckinDetail(e: WechatMiniprogram.TouchEvent) {
    const { checkin } = e.detail;
    wx.navigateTo({
      url: `${ROUTES.CHECKIN_DETAIL}?id=${checkin.id}`,
    });
  },

  // 点赞
  async onLike(e: WechatMiniprogram.TouchEvent) {
    const { checkin } = e.detail;
    try {
      if (checkin.hasLiked) {
        await likeApi.removeLike(checkin.id);
      } else {
        await likeApi.createLike(checkin.id);
      }
      this.loadCheckins();
    } catch (err) {
      showToast('操作失败', 'error');
    }
  },

  // 删除打卡
  async onDeleteCheckin(e: WechatMiniprogram.TouchEvent) {
    const { checkin } = e.detail;
    const confirmed = await showModal('确认删除', '删除后无法恢复，是否继续？');
    if (!confirmed) return;

    try {
      await checkinApi.deleteCheckin(checkin.id);
      showToast('删除成功');
      this.loadCheckins();
    } catch (err) {
      showToast('删除失败', 'error');
    }
  },
});
