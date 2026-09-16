<template>
  <div ref="button" style="display: flex" class="button" v-bind:class="{ active: isActive, disabled: isDisabled }"
       @click="setActive">
    <div class="left_side">
      <slot name="left">{{ label }}</slot>
    </div>
    <div ref="right" class="right_side">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "PushButton",

  props: {
    buttonId: String,
    label: String,
    isActive: Boolean,
    isDisabled: Boolean,
    padding: {type: String, required: false, default: "8px"}
  },

  methods: {
    setActive() {
      // Don't emit for a disabled button.
      if (!this.isDisabled) {
        this.$emit('button-pressed', this.buttonId);
      }
    }
  },

  computed: {
    right_width() {
      return this.$refs.right.clientWidth + "px";
    }
  }

}
</script>

<style scoped>
.button {
  box-sizing: border-box;
  width: calc(100% - 16px);
  margin: 8px;
  background-color: #3b413f;
  padding: v-bind(padding);
  text-align: left;
  color: #fff;

  cursor: default;
}

.button:hover:not(.active) {
  background-color: #49514e;
}

.button:first-child {
  margin-top: 0;
}

.button:last-child {
  margin-bottom: 0;
}

.left_side {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(100% - v-bind(right_width));
}

.right_side {
}

.active {
  background: linear-gradient(135deg, #0284c7, #0ea5e9);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 0 12px rgba(14, 165, 233, 0.4);
}

.disabled {
  background-color: #151924;
  color: #475569;
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
