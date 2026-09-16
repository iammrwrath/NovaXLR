<script>
export default {
  emits: ['check-change', 'select-change'],

  name: "PowerBooleanListSetting",
  props: {
    label: {type: String, required: true},
    description: {type: String, required: true},
    enabled: {type: Boolean, required: true},
    options: {type: Array, required: true},
    value: {required: true},
  },

  data() {
    return {
      checked: false,
      selected: undefined,
    }
  },

  methods: {
    selectedValue() {
      return this.$refs.selection.value;
    },

    onCheckChange() {
      this.checked = !this.checked;
      this.$emit('check-change', !this.enabled);
    },

    onSelectChange(e) {
      this.selected = e.target.value;
      this.$emit('select-change', e.target.value);
    },
  },

  mounted() {
    this.checked = this.enabled;
    this.selected = this.value;
  },

  watch: {
    enabled(newValue) {
      this.checked = newValue;
    },

    value(newValue) {
      if (newValue !== undefined) {
        this.selected = newValue;
      }
    }
  }
}
</script>

<template>
  <div class="setting">
    <div class="input" @click="onCheckChange" role="checkbox" :aria-valuenow="checked" :aria-label="label"
         :aria-description="description" :aria-checked="checked" @keydown.space="onCheckChange"
         tabindex="0">
      <font-awesome-icon v-if="checked" icon="fa-solid fa-square-check"/>
      <font-awesome-icon v-else icon="fa-solid fa-square"/>
    </div>
    <div class="label" @click="onCheckChange">{{ label }}</div>

    <div class="input">
      <select ref="selection" @change="onSelectChange">
        <option v-for="option of options" :key="option.key" :value="option.key" :selected="option.key === selected">
          {{ option.value }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.setting {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 8px 14px;
  color: #cbd5e1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background-color 0.15s ease;
}

.setting:last-child {
  border-bottom: none;
}

.setting:focus-within, .setting:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.02);
}

.label {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
}

.input {
  display: flex;
  align-items: center;
  color: #0ea5e9;
  font-size: 18px;
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