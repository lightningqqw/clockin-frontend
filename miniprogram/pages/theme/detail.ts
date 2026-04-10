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
    selectedDate: '',
    selectedCheckins: [] as ICheckin[],
    showDateDetail: false,
  },

  onLoad(options) {
    const userInfo = userStorage.get();
    this.setData({
      themeId: options.id || '',
      userId: userInfo && userInfo.id ? userInfo.id : '',
    });
    this.loadThemeDetail();
  },

  onShow() {
    if (this.data.themeId) {
      // 重置打卡状态，避免显示旧主题的状态
      this.setData({ canCheckin: true });
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
        const userInfo = userStorage.get();
        this.setData({
          theme: res.data,
          isCreator: res.data.creatorId === (userInfo && userInfo.id ? userInfo.id : ''),
        });
        await this.loadCheckins();
        await this.loadCalendar();
        await this.checkCanCheckin();
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
      console.log('[Debug] Checking can checkin for theme:', this.data.themeId);
      const res = await checkinApi.canCheckinToday(this.data.themeId);
      console.log('[Debug] Can checkin response:', res);
      if (res.success) {
        console.log('[Debug] Setting canCheckin to:', res.data && res.data.canCheckin !== undefined ? res.data.canCheckin : true);
        this.setData({ canCheckin: res.data && res.data.canCheckin !== undefined ? res.data.canCheckin : true });
      }
    } catch (err) {
      console.error('检查打卡状态失败:', err);
      // 出错时默认允许打卡
      this.setData({ canCheckin: true });
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
  async onDayTap(e: WechatMiniprogram.TouchEvent) {
    const { day } = e.detail;
    const selectedDate = day.date;

    this.setData({
      selectedDate,
      showDateDetail: true,
    });

    // 加载当天的打卡记录
    try {
      const res = await checkinApi.getThemeCheckins(this.data.themeId, 1, 100);
      if (res.success && res.data) {
        const selectedCheckins = res.data.list.filter((c) => {
          // 优先使用 checkinDate 字段，否则使用 createdAt 的日期部分
          if (c.checkinDate) {
            return c.checkinDate === selectedDate;
          }
          if (c.createdAt) {
            const createdDate = typeof c.createdAt === 'string'
              ? c.createdAt.split('T')[0]
              : new Date(c.createdAt).toISOString().split('T')[0];
            return createdDate === selectedDate;
          }
          return false;
        });
        this.setData({ selectedCheckins });
      }
    } catch (err) {
      console.error('加载打卡记录失败:', err);
      showToast('加载失败', 'error');
    }
  },

  // 关闭日期详情
  closeDateDetail() {
    this.setData({
      showDateDetail: false,
      selectedDate: '',
      selectedCheckins: [],
    });
  },

  // 去打卡详情（从日期详情中）
  goToSelectedCheckinDetail(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    if (!id) return;
    wx.navigateTo({
      url: `${ROUTES.CHECKIN_DETAIL}?id=${id}`,
    });
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

  // 复制邀请码（点击邀请码区域）
  async copyInviteCode() {
    const { theme } = this.data;
    if (!theme.inviteCode) return;
    await setClipboard(theme.inviteCode);
    showToast('邀请码已复制', 'success');
  },

  // 加入主题
  async joinTheme() {
    wx.navigateTo({ url: ROUTES.THEME_JOIN });
  },

  // 删除主题
  async deleteTheme() {
    const { theme } = this.data;
    const confirmed = await showModal('确认删除', '删除后主题及所有打卡记录将无法恢复，是否继续？');
    if (!confirmed) return;

    try {
      const res = await themeApi.deleteTheme(theme.id);
      if (res.success) {
        showToast('删除成功', 'success');
        setTimeout(() => {
          wx.navigateBack();
        }, 500);
      } else {
        throw new Error(res.message);
      }
    } catch (err: any) {
      showToast(err.message || '删除失败', 'error');
    }
  },

  // 去打卡详情
  goToCheckinDetail(e: WechatMiniprogram.TouchEvent) {
    const checkin = e.detail && e.detail.checkin ? e.detail.checkin : null;
    if (!checkin || !checkin.id) {
      showToast('数据加载中，请稍后重试', 'error');
      return;
    }
    wx.navigateTo({
      url: `${ROUTES.CHECKIN_DETAIL}?id=${checkin.id}`,
    });
  },

  // 点赞
  async onLike(e: WechatMiniprogram.TouchEvent) {
    const checkin = e.detail && e.detail.checkin ? e.detail.checkin : null;
    if (!checkin || !checkin.id) {
      showToast('数据加载中，请稍后重试', 'error');
      return;
    }
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
    const checkin = e.detail && e.detail.checkin ? e.detail.checkin : null;
    if (!checkin || !checkin.id) {
      showToast('数据加载中，请稍后重试', 'error');
      return;
    }
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
