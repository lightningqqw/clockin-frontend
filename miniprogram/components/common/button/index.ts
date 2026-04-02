Component({
  options: {
    addGlobalClass: true,
    styleIsolation: 'shared',
  },

  properties: {
    // 按钮类型：primary | secondary | danger | default
    type: {
      type: String,
      value: 'primary',
    },
    // 按钮尺寸：large | medium | small | mini
    size: {
      type: String,
      value: 'medium',
    },
    // 是否镂空
    plain: {
      type: Boolean,
      value: false,
    },
    // 是否圆角
    round: {
      type: Boolean,
      value: false,
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false,
    },
    // 是否加载中
    loading: {
      type: Boolean,
      value: false,
    },
    // 自定义样式
    customStyle: {
      type: String,
      value: '',
    },
    // 开放能力
    openType: {
      type: String,
      value: '',
    },
  },

  data: {},

  methods: {
    onTap(e: WechatMiniprogram.TouchEvent) {
      if (this.data.disabled || this.data.loading) {
        return;
      }
      this.triggerEvent('tap', e.detail);
    },
  },
});
