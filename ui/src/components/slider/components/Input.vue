<template>
  <div class="sliderInput">
    <input
      ref="input"
      type="text"
      inputmode="decimal"
      :value="focused ? localTextValue : getFormattedDisplayValue()"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown.enter="$event.target.blur()"
      :aria-label="title"
      :aria-description="title"
      :aria-valuetext="getFormattedDisplayValue()"
      :disabled="disabled"
    />
  </div>
</template>

<script>
export default {
  name: "TextInput",
  emits: ["value-updated", "blur"],

  data() {
    return {
      localTextValue: 0,
      lastTextValue: 0,
      focused: false,
    }
  },

  props: {
    id: {type: String, required: false, default: ""},
    editable: Boolean,
    currentTextValue: [Number, String],
    allowFloat: {type: Boolean, default: false},

    // Handlers for ValueMap..
    currentFieldValue: Number,
    valueMap: Array,

    // Handlers for Non ValueMaps..
    minValue: {type: Number, default: 0},
    maxValue: {type: Number, default: 100},

    // Display Related Settings
    textSuffix: {type: String, default: ""},
    colour: {type: String, required: false, default: '#59b1b6'},
    backgroundColour: {type: String, required: false, default: '#3b413f'},
    title: {type: String, required: false, default: ''},

    disabled: {type: Boolean, required: false, default: false},
  },

  mounted() {
    if (this.valueMap !== undefined) {
      this.localTextValue = this.displayValue();
    } else if (this.currentTextValue !== undefined) {
      this.localTextValue = this.currentTextValue;
      this.lastTextValue = this.currentTextValue;
    }
  },

  methods: {
    getFormattedDisplayValue() {
      let val = this.displayValue();
      if (val === undefined || val === null || val === "") {
        return "";
      }
      if (!this.textSuffix) {
        return String(val);
      }
      let suffix = this.textSuffix.trim();
      if (suffix.startsWith(":") || suffix.startsWith("%")) {
        return `${val}${suffix}`;
      }
      return `${val} ${suffix}`;
    },

    getDisplayValue() {
      return this.localTextValue + this.textSuffix;
    },

    handleFocus(e) {
      this.focused = true;
      this.$nextTick(() => {
        if (e && e.target && typeof e.target.select === 'function') {
          e.target.select();
        }
      });
    },

    handleInput(e) {
      this.localTextValue = e.target.value;
      this.update(e);
    },

    handleBlur(e) {
      this.reset(e);
    },

    update(e) {
      let newValue = e.target.value;

      if (newValue === "-" || newValue === "") {
        return;
      }

      if (this.valueMap !== undefined) {
        let base = undefined;
        for (let i = 0; i < this.valueMap.length; i++) {
          if (this.valueMap[i] >= newValue) {
            base = i;
            break;
          }
        }

        let result = 0;
        if (base === undefined) {
          result = this.valueMap.length - 1;
        } else if (base === 0) {
          result = 0;
        } else if (this.valueMap[base] === newValue) {
          result = base;
        } else {
          let lower = this.valueMap[base - 1];
          let upper = this.valueMap[base];
          let middle = (upper - lower) / 2;
          let ours = newValue - lower;
          result = (ours < middle) ? base - 1 : base;
        }
        this.$emit("value-updated", result, this.id);
        return;
      }

      let parsed = (this.allowFloat) ? parseFloat(newValue) : parseInt(newValue);
      if (isNaN(parsed)) {
        return;
      }

      if (parsed > this.maxValue || parsed < this.minValue) {
        return;
      }

      this.$emit("value-updated", parsed, this.id);
    },

    reset(e) {
      this.focused = false;

      let newValue = e.target.value;
      if (!this.isNumber(newValue)) {
        this.localTextValue = this.lastTextValue;
        this.$emit("blur");
        return;
      }

      let parsed = (this.allowFloat) ? parseFloat(newValue) : parseInt(newValue);
      if (parsed < this.minValue) {
        this.localTextValue = this.minValue;
        this.$emit("value-updated", this.minValue, this.id);
      } else if (parsed > this.maxValue) {
        this.localTextValue = this.maxValue;
        this.$emit("value-updated", this.maxValue, this.id);
      } else {
        this.localTextValue = parsed;
        this.$emit("value-updated", parsed, this.id);
      }

      this.$emit("blur");
    },

    isNumber(str) {
      if (typeof str != "string") {
        return false;
      }
      return !isNaN(str) && !isNaN(parseFloat(str));
    },

    displayValue() {
      if (this.valueMap !== undefined) {
        return this.valueMap[this.currentFieldValue];
      }
      return this.localTextValue;
    },
  },

  watch: {
    currentFieldValue: function () {
      if (this.focused) {
        return;
      }

      if (this.valueMap !== undefined) {
        this.localTextValue = this.displayValue();
      }
    },

    currentTextValue: function (newValue) {
      if (this.focused) {
        return;
      }

      if (this.valueMap === undefined) {
        this.localTextValue = newValue;
        this.lastTextValue = newValue;
      } else {
        this.localTextValue = this.displayValue();
      }
    }
  },
}
</script>

<style scoped>
.sliderInput {
  position: relative;
  width: 100%;
}

.sliderInput input[type=text] {
  font-family: ui-monospace, "SF Mono", "Cascadia Code", "Segoe UI Mono", monospace;
  font-weight: 600;
  font-size: 0.88rem;
  letter-spacing: 0.02em;

  background-color: v-bind(backgroundColour);
  color: v-bind(colour);
  padding: 6px 4px;
  box-sizing: border-box;

  text-align: center;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);

  width: 100%;

  background-image: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
  outline: none;
  transition: all 0.2s ease;
}

.sliderInput input[type=text]:focus {
  border-color: rgba(14, 165, 233, 0.6);
  box-shadow: 0 0 8px rgba(14, 165, 233, 0.3);
  background-color: rgba(26, 32, 48, 0.9);
}
</style>
