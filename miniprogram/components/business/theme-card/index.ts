import { ITheme } from '../../../types/index';

Component({
  options: {
    addGlobalClass: true,
    styleIsolation: 'shared',
  },

  properties: {
    theme: {
      type: Object,
      value: {} as ITheme,
    },
    showProgress: {
      type: Boolean,
      value: false,
    },
    progress: {
      type: Number,
      value: 0,
    },
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { theme: this.data.theme });
    },
  },
});
