Component({
  options: {
    addGlobalClass: true,
    styleIsolation: 'shared',
  },

  properties: {
    // 标题
    title: {
      type: String,
      value: '',
    },
    // 额外内容
    extra: {
      type: String,
      value: '',
    },
    // 底部内容
    footer: {
      type: String,
      value: '',
    },
    // 是否显示阴影
    shadow: {
      type: Boolean,
      value: true,
    },
    // 是否显示边框
    border: {
      type: Boolean,
      value: false,
    },
    // 是否可点击
    hover: {
      type: Boolean,
      value: false,
    },
    // 自定义样式
    customStyle: {
      type: String,
      value: '',
    },
  },

  methods: {
    onTap(e: WechatMiniprogram.TouchEvent) {
      this.triggerEvent('tap', e.detail);
    },
  },
});
