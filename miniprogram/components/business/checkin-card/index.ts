import { ICheckin } from '../../../types/index';
import { MOOD_OPTIONS } from '../../../constants/index';
import { relativeTime } from '../../../utils/date';

Component({
  options: {
    addGlobalClass: true,
    styleIsolation: 'shared',
  },

  properties: {
    checkin: {
      type: Object,
      value: {} as ICheckin,
    },
    isOwner: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    formatTime: '',
    moodEmoji: '',
    userAvatar: '/assets/default-avatar.png',
    userNickname: '匿名用户',
  },

  lifetimes: {
    attached() {
      this.updateFormatTime();
      this.updateMoodEmoji();
      this.updateUserInfo();
    },
  },

  methods: {
    updateFormatTime() {
      const time = this.data.checkin.createdAt;
      this.setData({
        formatTime: relativeTime(time),
      });
    },

    updateMoodEmoji() {
      const mood = this.data.checkin.mood;
      if (mood) {
        const moodOption = MOOD_OPTIONS.find((m) => m.value === mood);
        this.setData({
          moodEmoji: moodOption ? moodOption.emoji : '😊',
        });
      }
    },

    updateUserInfo() {
      const { checkin } = this.data;
      const user = checkin.user;
      this.setData({
        userAvatar: user && user.avatarUrl ? user.avatarUrl : '/assets/default-avatar.png',
        userNickname: user && user.nickname ? user.nickname : '匿名用户',
      });
    },

    onUserTap() {
      this.triggerEvent('userTap', { user: this.data.checkin.user });
    },

    onContentTap() {
      this.triggerEvent('tap', { checkin: this.data.checkin });
    },

    onImageTap(e: WechatMiniprogram.TouchEvent) {
      const { url } = e.currentTarget.dataset;
      this.triggerEvent('imageTap', {
        url,
        images: this.data.checkin.images,
      });
    },

    onLikeTap() {
      this.triggerEvent('like', { checkin: this.data.checkin });
    },

    onShareTap() {
      this.triggerEvent('share', { checkin: this.data.checkin });
    },

    onEditTap() {
      this.triggerEvent('edit', { checkin: this.data.checkin });
    },

    onDeleteTap() {
      this.triggerEvent('delete', { checkin: this.data.checkin });
    },
  },
});
