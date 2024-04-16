<template>
  <input v-model="model" v-bind="$attrs" type="text" v-on="$listeners" @input="handleInput" @blur="handleBlur" />
</template>

<script>
export default {
  name: 'InputNumber',

  model: {
    prop: 'modelValue',
    event: 'changeVal',
  },

  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    int: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    model: {
      get() {
        return this.modelValue;
      },
      set(newVal) {
        this.$emit('changeVal', newVal);
      },
    },
  },

  methods: {
    handleInput(e) {
      const input = e.target;
      const { value } = input;
      const index = input.selectionStart - 1;
      const keyIn = value[index];

      let isDelete;

      switch (keyIn) {
        case '-':
          isDelete = index !== 0 || value.match(/-/g).length > 1;
          break;
        case '.':
          isDelete = this.int || value.match(/\./g).length > 1;
          break;
        default:
          isDelete = /\D/.test(keyIn);
      }

      if (isDelete) {
        const before = value.substring(0, index);
        const after = value.substring(index + 1);
        this.model = `${before}${after}`;
        input.value = this.model;

        // 恢复光标位置
        this.$nextTick(() => {
          input.setSelectionRange(index, index);
        });
      }

      this.$emit('input', this.model);
    },

    handleBlur() {
      this.model = `${+this.model}`;

      this.$emit('blur', this.model);
    },
  },
};
</script>
