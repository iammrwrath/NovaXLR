<template>
  <div class="content">
    <div class="contentTitle"><slot name="title">{{ title }}</slot></div>
    <div class="contentBody">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: "ContentBox",

  props: {
    title: String,
  }
}
</script>

<style scoped>

.content:not(:first-child) {
  /* Left / Right margins should be handled by the parent.. */
  margin-left: 15px;
}

.content {
  display: inline-flex;
  flex-direction: column;
  flex-wrap: nowrap;
  background: rgba(22, 27, 39, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  padding: 16px 20px;
}

.contentTitle {
  color: #e2e8f0;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.contentBody {
  display: inline-flex;
  flex-direction: row;
}
</style>