<script>
export default {
  emits: ['check-change'],

  name: "PowerBooleanSetting",
  props: {
    label: {type: String, required: true},
    description: {type: String, required: true},
    enabled: {type: Boolean, required: true},
  },

  data() {
    return {
      checked: false,
    }
  },

  methods: {
    onCheckChange() {
      this.checked = !this.checked;
      this.$emit('check-change', !this.enabled);
    },
  },

  mounted() {
    this.checked = this.enabled;
  },

  watch: {
    enabled(newValue) {
      this.checked = newValue;
    }
  }
}
</script>

<template>
  <div class="setting" @click="onCheckChange">
    <div class="input" role="checkbox" :aria-valuenow="checked" :aria-label="label"
         :aria-description="description" :aria-checked="checked" @keydown.space="onCheckChange" @keydown.enter="onCheckChange"
         tabindex="0">
      <font-awesome-icon v-if="checked" icon="fa-solid fa-square-check"/>
      <font-awesome-icon v-else icon="fa-solid fa-square"/>
    </div>
    <div class="label">{{ label }}</div>
  </div>
</template>

<style scoped>
.setting {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
  padding: 8px 14px;
  color: #cbd5e1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background-color 0.15s ease, color 0.15s ease;
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
  font-size: 18px;
  color: #0ea5e9;
  outline: none;
}
</style>