import { checkinApi } from '../../services/checkin';
import { likeApi } from '../../services/like';
import { userStorage } from '../../utils/storage';
import { showToast, showModal } from '../../utils/index';
import { ICheckin, IUser } from '../../types/index';

Page({
  data: {
    checkinId: '',
    checkin: {} as ICheckin,
    likeUsers: [] as IUser[],
    comments: [] as any[],
    isOwner: false,
    loading: false,
  },

  onLoad(options) {
    const checkinId = options.id || '';
    this.setData({ checkinId });
    this.loadCheckinDetail();
  },

  async loadCheckinDetail() {
    const { checkinId } = this.data;
    if (!checkinId) return;

    this.setData({ loading: true });
    try {
      const res = await checkinApi.getCheckinById(checkinId);
      if (res.success && res.data) {
        const userInfo = userStorage.get();
        this.setData({
          checkin: res.data,
          isOwner: res.data.userId === (userInfo && userInfo.id ? userInfo.id : ''),
        });
        this.loadLikeUsers();
      }
    } catch (err) {
      showToast('加载失败', 'error');
    } finally {
      this.setData({ loading: false });
    }
  },

  async loadLikeUsers() {
    const { checkinId } = this.data;
    try {
      const res = await likeApi.getLikeUsers(checkinId);
      if (res.success && res.data) {
        this.setData({ likeUsers: res.data.slice(0, 10) });
      }
    } catch (err) {
      console.error('加载点赞用户失败:', err);
    }
  },

  async onLike() {
    const { checkin } = this.data;
    try {
      if (checkin.hasLiked) {
        await likeApi.removeLike(checkin.id);
        showToast('取消点赞');
      } else {
        await likeApi.createLike(checkin.id);
        showToast('点赞成功', 'success');
      }
      this.loadCheckinDetail();
    } catch (err) {
      showToast('操作失败', 'error');
    }
  },

  async onDelete() {
    const confirmed = await showModal('确认删除', '删除后无法恢复，是否继续？');
    if (!confirmed) return;

    try {
      await checkinApi.deleteCheckin(this.data.checkinId);
      showToast('删除成功');
      setTimeout(() => {
        wx.navigateBack();
      }, 500);
    } catch (err) {
      showToast('删除失败', 'error');
    }
  },
});
