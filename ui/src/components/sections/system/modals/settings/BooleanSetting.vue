<script>
export default {
  emits: ['change'],

  name: "BooleanSetting",
  props: {
    label: {type: String, required: true},
    description: {type: String, required: true},
    enabled: {type: Boolean, required: true},
  },

  methods: {
    onChange() {
      this.$emit('change', !this.enabled);
    },
  }
}
</script>

<template>
  <div class="setting" @click="onChange">
    <div class="label">{{ label }}</div>
    <div class="input" @click="onChange" role="checkbox" :aria-valuenow="enabled" :aria-label="label"
         :aria-description="description" :aria-checked="enabled" @keydown.space="onChange" @keydown.enter="onChange"
         tabindex="0">
      <font-awesome-icon v-if="enabled" icon="fa-solid fa-square-check"/>
      <font-awesome-icon v-else icon="fa-solid fa-square"/>
    </div>
  </div>
</template>

<style scoped>
.setting {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
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