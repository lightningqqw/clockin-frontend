Component({
  options: {
    addGlobalClass: true,
    styleIsolation: 'shared',
  },

  properties: {
    // 图片地址
    image: {
      type: String,
      value: '',
    },
    // 图标（emoji）
    icon: {
      type: String,
      value: '',
    },
    // 标题
    title: {
      type: String,
      value: '暂无数据',
    },
    // 描述
    description: {
      type: String,
      value: '',
    },
  },
});
