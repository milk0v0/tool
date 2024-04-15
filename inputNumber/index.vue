<template>
  <input v-model="value" type="text" @input="handleInput" @blur="handleBlur" />
</template>

<script>
export default {
  name: 'InputNumber',

  data() {
    return {
      value: 0,
    };
  },

  methods: {
    handleInput(e) {
      const input = e.target;
      const { value } = input;
      const index = input.selectionStart - 1;
      const keyIn = value[index];

      if (
        // 小数点，但不是只有一个
        (keyIn === '.' && value.match(/\./g).length > 1) ||
        // 非数字小数点
        /[^\d.]/.test(keyIn)
      ) {
        const before = value.substring(0, index);
        const after = value.substring(index + 1);
        this.value = `${before}${after}`;

        // 恢复光标位置
        this.$nextTick(() => {
          input.setSelectionRange(index, index);
        });
      }
    },

    handleBlur() {
      this.value = `${+this.value}`;
    },
  },
};
</script>
