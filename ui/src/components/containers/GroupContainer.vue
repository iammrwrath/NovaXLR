<script>
export default {
  name: "GroupContainer",
  props: {
    label: String,
    title: String,
    level: {
      type: Number,
      default: 2
    },
    role: {
      type: String,
      default: "region"
    },

    sidePadding: {type: String, required: false, default: "24px"}
  },

  data() {
    return {
      observer: null,
      width: 0,
    }
  },

  mounted() {
    this.observer = new ResizeObserver(() => {
      if (this.$refs.right !== null) {
        this.width = this.$refs.right.clientWidth;
      }
    });
    this.observer.observe(this.$refs.right);
  },

  computed: {
    rightWidth() {
      if (this.width === 0) {
        return "0px";
      }
      return this.width + 2 + "px";
    }
  }
}
</script>

<template>
  <div class="container" :role="role" :aria-label="label || title || ''">
    <div style="width: 100%">
      <div v-if="title !== '' && title !== undefined" class="title" role="heading" :aria-level="level">
        {{ title }}
      </div>
      <div ref="right" class="right">
        <slot name="right"></slot>
      </div>
    </div>

    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;

  padding: 12px v-bind(sidePadding) v-bind(sidePadding);

  background: rgba(22, 27, 39, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
}

.title {
  display: inline-block;
  width: calc(100% - (v-bind(rightWidth) * 2));

  padding: 10px 0 12px;
  margin-left: v-bind(rightWidth);

  color: #e2e8f0;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: center;
  text-transform: uppercase;
}

.content {
  display: flex;
  flex-direction: row;
  gap: 6px;

  height: fit-content;
  width: fit-content;
}

.right {
  display: inline-block;
}
</style>
