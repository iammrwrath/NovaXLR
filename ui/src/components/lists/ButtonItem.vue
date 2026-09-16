<template>
  <div>
    <button ref="button" :aria-label="(label === undefined) ? text : label" :class="{ centered: centered, disabled: disabled }" @click="clicked"><slot>{{ text }}</slot></button>
  </div>
</template>

<script>
export default {
  name: "ButtonItem",

  props: {
    text: {type: String, required: true },
    label: { type: String, required: false },
    id: {type: String, required: true},

    background: {type: String, required: false, default: "rgba(255, 255, 255, 0.05)" },
    disabled: {type: Boolean, required: false, default: false},
    padding: {type: String, required: false, default: "8px"},
    centered: { type: Boolean, required: false, default: false }
  },

  methods: {
    focus() {
      this.$refs.button.focus()
    },

    clicked() {
      this.$emit('on-click', this.id);
    }
  }
}
</script>

<style scoped>
button {
  font-family: inherit;

  display: block;
  box-sizing: border-box;

  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;

  width: calc(100% - 12px);
  margin: auto;
  background-color: v-bind(background);

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  padding: v-bind(padding);
  text-align: left;
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.15s ease;
}

button:focus {
  background-color: rgba(14, 165, 233, 0.2);
  border-color: #0ea5e9;
  color: #ffffff;
  outline: none;
}

button:not(.disabled):hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.2);
}

button.centered {
  text-align: center;
}

button.disabled {
  background-color: rgba(255, 255, 255, 0.02);
  color: #475569;
  border-color: transparent;
  cursor: not-allowed;
}
</style>