<script>
export default {
  emits: ['change'],

  name: "NumberSetting",
  props: {
    label: {type: String, required: true},
    description: {type: String, required: true},
    value: {type: Number, required: true},

    suffix: {type: String, required: false, default: ""},

    min: {type: Number, required: true},
    max: {type: Number, required: true}
  },

  methods: {
    onChange(e) {
      let value = parseInt(e.target.value);
      if (isNaN(value)) {
        return;
      }
      if (value === this.value) {
        return;
      }

      if (value < this.min) {
        value = this.min;
      }
      if (value > this.max) {
        value = this.max;
      }

      this.$emit('change', value);
    },

    validate(e) {
      let allowedKeys = [
          "ArrowRight",
          "ArrowLeft",
          "Enter",
          "Backspace",
          "Delete",
          "Tab"
      ];

      // Check whether the Key is a Number..
      if ((isNaN(e.key) || e.key === null) && !allowedKeys.includes(e.key)) {
          e.preventDefault();
          return false;
      }

      return true;
    },

    getElementId() {
      return this.label.toLocaleLowerCase()
          .replaceAll(" ", "_")
          .replaceAll("(", "_")
          .replaceAll(")", "_");
    }
  }
}
</script>

<template>
  <div class="setting">
    <label :for="getElementId()" class="label">{{ label }}</label>
    <div class="input">
      <input :id="getElementId()" type="number" :value="value" :aria-label="label" :aria-description="description"
             @blur="onChange" @keydown="validate"/>
      <span>{{ suffix }}</span>
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
  display: flex;
  align-items: center;
  background-color: #171d2c;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  padding: 4px 8px;
  transition: all 0.15s ease;
  margin-left: auto;
}

.input:hover, .input:focus-within {
  border-color: #0ea5e9;
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.25);
  color: #ffffff;
}

.input input {
  background: transparent;
  border: 0;
  outline: none;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  text-align: right;
  width: 50px;
  -moz-appearance: textfield;
}

.input input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input span {
  color: #94a3b8;
  font-size: 12px;
  margin-left: 4px;
}
</style>