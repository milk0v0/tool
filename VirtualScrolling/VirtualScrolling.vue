<template>
  <div
    ref="wrapper"
    class="wrapper"
    :style="{ [`overflow-${mode === 'vertical' ? 'y' : 'x'}`]: 'auto' }"
    @scroll="handleScroll"
  >
    <div
      class="background"
      :style="{ [mode === 'vertical' ? 'height' : 'width']: totalLength + 'px' }"
    />
    <div
      :style="[{
          '-webkit-transform': `translate3d(${mode === 'vertical' ? 0 : transform}px, ${mode === 'vertical' ? transform : 0}px, 0)`,
          'transform': `translate3d(${mode === 'vertical' ? 0 : transform}px, ${mode === 'vertical' ? transform : 0}px, 0)`,
        }, mode === 'horizontal' && { 'white-space': 'nowrap' }]"
    >
      <div
        v-for="(item, index) in runList"
        :key="index"
        :style="mode === 'horizontal' && { display: 'inline-block' }"
      >
        <slot :data="item.data" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
    // 数据源
    dataSource: {
      type: Array,
      default: () => [],
    },
    // 模式 横|竖
    mode: {
      validator(val) {
        return ['vertical', 'horizontal'].includes(val);
      },
      default: 'vertical',
    },
    // 缓冲的屏幕数量
    cacheScreens: {
      type: Number,
      default: 1,
    },
    // 每条 宽度|高度
    getLength: {
      type: [Number, Function],
      default: 32,
    },
    /** 容器 宽|高 */
    wrapperLength: {
      type: Number,
    },
  },

  data() {
    return {
      ticking: false, // 节流使用
      dataList: [], // 全部数据 - 处理过的
      runList: [], // 运行时列表
      totalLength: 0, // 列表总 宽度|高度
      minLength: 0, // 最小 宽度|高度
      scrollScale: [], // 不执行滚动范围
      maxNum: 0, // 一屏的最大数量
      transform: 0,
    };
  },

  watch: {
    dataSource: {
      handler() {
        this.$nextTick(() => {
          this.init();
          this.getRunData(this.value, true);
        });
      },
      immediate: true,
    },

    value(newVal) {
      this.$refs.wrapper[this.mode === 'vertical' ? 'scrollTop' : 'scrollLeft'] = newVal;
      this.getRunData(newVal);
    },
  },

  methods: {
    init() {
      this.totalLength = 0;
      this.transform = 0;
      this.minLength = typeof this.getLength === 'number' ? this.getLength : this.getLength({ ...this.dataSource[0] });

      this.dataList = this.dataSource.map((data, index) => {
        const length = typeof this.getLength === 'number' ? this.getLength : this.getLength({ ...data });

        this.minLength < length && (this.minLength = length);

        const obj = {
          index,
          length,
          top: this.totalLength,
          data,
        };

        this.totalLength += length;

        return obj;
      });

      // 一屏的最大数量
      const containerLength =
        this.wrapperLength ||
        parseInt(getComputedStyle(this.$refs.wrapper)[this.mode === 'vertical' ? 'height' : 'width']);
      this.maxNum = Math.ceil(containerLength / this.minLength);
    },

    //二分法计算起始索引
    getStartIndex(scroll) {
      let start = 0;
      let end = this.dataList.length - 1;

      while (start < end) {
        const mid = Math.floor((start + end) / 2);
        const { top, length } = this.dataList[mid];
        if (scroll >= top && scroll < top + length) {
          start = mid;
          break;
        } else if (scroll >= top + length) {
          start = mid + 1;
        } else if (scroll < top) {
          end = mid - 1;
        }
      }

      return start;
    },

    getRunData(distance = 0, isInit) {
      //在哪个范围内不执行滚动
      if (!isInit && distance > this.scrollScale[0] && distance < this.scrollScale[1]) {
        return;
      }

      //起始索引
      let start_index = this.getStartIndex(distance);
      start_index = start_index < 0 ? 0 : start_index;

      //上屏索引
      let upper_start_index = start_index - this.maxNum * this.cacheScreens;
      upper_start_index = upper_start_index < 0 ? 0 : upper_start_index;

      // 调整offset
      this.transform = this.dataList[upper_start_index].top;

      //中间屏幕的元素
      const mid_list = this.dataList.slice(start_index, start_index + this.maxNum);

      // 上屏
      const upper_list = this.dataList.slice(upper_start_index, start_index);

      // 下屏元素
      let down_start_index = start_index + this.maxNum;

      down_start_index = down_start_index > this.dataList.length - 1 ? this.dataList.length : down_start_index;

      this.scrollScale = [
        this.dataList[Math.floor(upper_start_index + this.maxNum / 2)]?.top,
        this.dataList[Math.ceil(start_index + this.maxNum / 2)]?.top || this.dataList[this.dataList.length - 1].top,
      ];

      const down_list = this.dataList.slice(down_start_index, down_start_index + this.maxNum * this.cacheScreens);

      this.runList = [...upper_list, ...mid_list, ...down_list];
    },

    handleScroll(e) {
      // 节流操作
      if (this.ticking) {
        return;
      }
      this.ticking = true;
      requestAnimationFrame(() => {
        this.ticking = false;
      });

      this.$emit('input', this.mode === 'vertical' ? e.target.scrollTop : e.target.scrollLeft);

      this.getRunData(this.value);
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  -webkit-overflow-scrolling: touch;

  .background {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -1;
  }
}
</style>
