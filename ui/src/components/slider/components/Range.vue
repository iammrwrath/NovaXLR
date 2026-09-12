<template>
  <div :class="{ 'rotation-wrapper': needsRotation }">
    <div :class="{ 'rotation': needsRotation }">
      <input class="slider" ref="slider" type="range" v-bind:style="getCurrentStyle" v-bind:min="minValue"
             v-bind:max="maxValue" v-bind:value="localFieldValue" v-on:input="update"
             v-on:mousedown="mouseDown" v-on:mouseup="mouseUp" v-on:keydown="mouseDown" v-on:keyup="mouseUp"
             v-on:touchstart="mouseDown" v-on:touchend="mouseUp" v-on:touchcancel="mouseUp" v-on:touchmove="touchMove"
             :aria-label="title" :aria-description="title" :aria-valuetext="getReportedValue()" :step="step"
             :disabled="disabled"
      />
    </div>
  </div>
</template>

<script>
import {store} from "@/store";

export default {
  name: "RangeSelector",

  data() {
    return {
      localFieldValue: 0,
      announceValue: '',
    }
  },

  props: {
    height: {type: Number, required: false, default: 130},
    transform: {type: Number, required: false, default: -85},
    needsRotation: {type: Boolean, required: false, default: true},

    step: {type: Number, required: false, default: 1},

    minValue: {type: Number, default: 0},
    maxValue: {type: Number, default: 100},
    disabled: {type: Boolean, default: false},
    currentFieldValue: Number,

    storePath: {type: String, required: true},
    id: {type: String, required: false, default: ""},

    colour: {type: String, required: false, default: "#0ea5e9"},
    backgroundColour: {type: String, required: false, default: '#171d2c'},

    title: {type: String, required: false, default: ''},
    reportedValue: {type: String, required: false, default: ''}
  },

  methods: {
    getReportedValue() {
      if (this.announceValue === '') {
        return this.localFieldValue;
      }
      return this.announceValue;
    },

    mouseDown() {
      store.pausePatchPath(this.storePath);
      store.pause();
      this.$emit("mouse-down", this.id)
    },

    touchMove(e) {
      // Ok, so this is primarily here because Chrome doesn't seem to grab the 'handle' of the sliders correctly
      // when they're in a vertical mode (horizontal works fine). So we try to do the calculation ourselves, tracking
      // what the finger is doing and where it is whenever it moves, and apply the update logic directly.

      // This workaround is only needed for Chromium based browsers, when our sliders are vertical.
      if (!(window.chrome) || !this.needsRotation) {
        return;
      }

      // Get the 'Top' position, and height for the element being manipulated..
      let ele = this.$refs.slider.getBoundingClientRect();
      let y = ele.y;
      let height = ele.height;

      // Grab the current 'Y' position for the finger on the page..
      let touch = e.touches[0] || e.changedTouches[0];
      let yPosition = touch.clientY - y;

      // Grab the total number of steps in this element..
      let steps = Math.abs(this.maxValue - this.minValue);

      // Calculate where our finger position is on those steps
      let step = steps - ((yPosition / height) * steps);

      // Grab our current value by simply adding the steps to the minValue
      let currentValue = this.minValue + Math.round(step);

      // Make sure we're in-bounds..
      if (currentValue > this.maxValue) {
        currentValue = this.maxValue;
      }
      if (currentValue < this.minValue) {
        currentValue = this.minValue;
      }

      // Update the local value, and the slider value with the new data...
      this.localFieldValue = currentValue;

      // Trigger an update event on this change.
      this.update(e);
    },

    mouseUp() {
      this.$emit("mouse-up", this.id)
      store.resumePatchPath(this.storePath);
      store.resume();
    },

    update(e) {
      // Value has changed, emit something upwards..
      this.$emit("value-updated", e.target.value, this.id)
    }
  },

  watch: {
    currentFieldValue: function (newValue) {
      this.localFieldValue = newValue;
    },

    reportedValue: function (newValue) {
      if (this.announceValue !== newValue) {
        this.announceValue = newValue;
      }
    }
  },


  computed: {
    getCurrentStyle() {
      // This code essentially adjusts the background position to keep it below the 'thumb'..
      let distance = this.maxValue - this.minValue;
      let position = 0;
      for (let i = this.minValue; i <= this.maxValue; i += this.step, position += this.step) {
        if (i === parseFloat(this.localFieldValue)) {
          break;
        }
      }

      let width = (position / distance) * 100;

      return {
        background: 'linear-gradient(to right, ' + this.colour + '  0%, ' + this.colour + ' ' + width + '%, ' + this.backgroundColour + ' ' + width + '%, ' + this.backgroundColour + ' 100%)'
      }
    },
    heightString() {
      return this.height + "px";
    },
    transformString() {
      return this.transform + "px";
    }
  },
}
</script>

<style scoped>
.slider {
  background: linear-gradient(to right, v-bind(colour) 0%, v-bind(colour) 50%, v-bind(backgroundColour) 50%, v-bind(backgroundColour) 100%);

  position: relative;
  border-radius: 4px;
  height: 6px;
  width: v-bind(heightString);
  outline: none;
  transition: background 250ms ease;
  -webkit-appearance: none;

  display: block;
  touch-action: none;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.6);
}

input[type='range']::-webkit-slider-thumb {
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background: v-bind(colour);
  border: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6), 0 0 8px rgba(14, 165, 233, 0.5);
  -webkit-appearance: none;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

input[type='range']::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.8), 0 0 12px rgba(14, 165, 233, 0.8);
}

input[type='range']::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 9px;
  background: v-bind(colour);
  border: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.6), 0 0 8px rgba(14, 165, 233, 0.5);
  cursor: pointer;
}

.rotation {
  transform: rotate(-90deg) translate(v-bind(transformString));
  z-index: -1;
}

.rotation-wrapper {
  height: v-bind(heightString);
  width: 90px;
  margin: 0 auto;
}
</style>
