<script>
export default {
  emits: ['change'],

  name: "ListSetting",
  props: {
    label: {type: String, required: true},
    description: {type: String, required: true},
    options: {type: Array, required: true},
    value: {type: String, required: true},
  },

  methods: {
    onChange(e) {
      this.$emit('change', e.target.value);
    },
  }
}
</script>

<template>
  <div class="setting">
    <span class="label">{{ label }}</span>
    <div class="input">
      <select @change="onChange">
        <option v-for="option of options" :key="option.key" :value="option.key" :selected="option.key === value">
          {{ option.value }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 8px 14px;
  color: #cbd5e1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.setting:last-child {
  border-bottom: none;
}

.setting:focus-within {
  color: #ffffff;
}

.label {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
}

.input {
  max-width: fit-content;
  margin-left: auto;
}

.input select {
  text-align: left;
  background-color: #171d2c;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 6px 12px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  color: #f8fafc;
  cursor: pointer;
  outline: none;
  transition: all 0.15s ease;
}

.input select:hover, .input select:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.25);
  color: #ffffff;
}

.input select option {
  background-color: #111520;
  color: #f8fafc;
  padding: 6px;
}
</style>