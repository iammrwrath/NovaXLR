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
    if (this.$refs.right) {
      this.observer = new ResizeObserver(() => {
        if (this.$refs.right !== null) {
          this.width = this.$refs.right.clientWidth;
        }
      });
      this.observer.observe(this.$refs.right);
    }
  },

  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },

  computed: {
    rightWidth() {
      if (this.width === 0) {
        return "0px";
      }
      return (this.width + 2) + "px";
    }
  }
}
</script>

<template>
  <div class="container" :role="role" :aria-label="label || title || ''">
    <div class="group-header" v-if="(title !== '' && title !== undefined) || $slots.right">
      <div class="header-spacer" :style="{ width: rightWidth }" />
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

  padding: 10px v-bind(sidePadding) 14px;

  background: rgba(22, 27, 39, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
}

.group-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
}

.header-spacer {
  flex-shrink: 0;
}

.title {
  flex: 1;
  color: #e2e8f0;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: center;
  text-transform: uppercase;
  padding: 4px 8px;
}

.content {
  display: flex;
  flex-direction: row;
  gap: 6px;

  height: fit-content;
  width: fit-content;
}

.right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
