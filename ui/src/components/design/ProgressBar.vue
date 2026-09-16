<template>
  <div class="progress">
    <label for="progress-bar" v-if="status_message !== undefined && status_position === 'top'" :style="`text-align: ${status_align};`" class="status">
      {{ status_message }}
    </label>
    <div class="progress-bar-inner">
      <div v-if="show_percentage">{{ progress }}%</div>
      <progress id="progress-bar" max="100" :value="progress"></progress>
    </div>
    <label for="progress-bar" v-if="status_message !== undefined && status_position === 'bottom'" :style="`text-align: ${status_align};`" class="status">
      {{ status_message }}
    </label>
  </div>
</template>

<script>
export default {
  name: "ProgressBar",

  props: {
    progress: {type: Number, default: 0},
    show_percentage: {type: Boolean, default: true},
    status_message: {type: String, default: undefined},
    status_align: {type: String, default: "center"},
    status_position: {type: String, default: "top"},
  },
}
</script>

<style scoped>
.progress {
  margin: 23px 0;
}

.progress .progress-bar-inner {
  position: relative;
  margin: 4px 0;
}

.progress .progress-bar-inner progress[value] {
  background-color: #171d2c;
  color: #0ea5e9;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  height: 22px;
  width: 100%;
  margin: 0 0;

  /* Reset the default appearance */
  -webkit-appearance:none;
  -moz-appearance:none;
  appearance: none;

  text-align: center;
}
.progress .progress-bar-inner progress::-webkit-progress-bar {
  background-color: #171d2c;
  border-radius: 12px;
}
.progress .progress-bar-inner progress[value]::-webkit-progress-value {
  background: linear-gradient(90deg, #0284c7, #0ea5e9);
  border-radius: 12px;
}
.progress .progress-bar-inner progress[value]::-moz-progress-bar {
  background: linear-gradient(90deg, #0284c7, #0ea5e9);
  border-radius: 12px;
}

.progress .progress-bar-inner div {
  position: absolute;
  width: 100%;
  line-height: 22px;
  display: block;
  text-align: center;
  justify-content: center;
}

.progress .status {
  display: block;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  text-align: center;
  align-content: center;
}
</style>