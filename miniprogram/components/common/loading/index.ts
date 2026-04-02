Component({
  options: {
    addGlobalClass: true,
    styleIsolation: 'shared',
  },

  properties: {
    // 加载文本
    text: {
      type: String,
      value: '',
    },
    // 是否全屏
    fullScreen: {
      type: Boolean,
      value: false,
    },
    // 是否显示遮罩
    mask: {
      type: Boolean,
      value: false,
    },
  },
});
