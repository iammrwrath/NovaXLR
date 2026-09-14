<script>
export default {
  name: "ContentContainer",
  props: {
    noLeftPad: Boolean,
  }
}
</script>

<template>
  <div class="container" :class="{ contentPadNoLeft: noLeftPad }">
    <slot></slot>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
}

.container {
  display: flex;
  flex-direction: row;
  gap: 16px;

  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 10px 16px 16px;
  justify-content: flex-start;
  align-items: flex-start;

  overflow-x: auto;
  overflow-y: hidden;
}

.container::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.container::-webkit-scrollbar-track {
  background-color: transparent;
}

.container::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.contentPadNoLeft {
  padding-left: 0;
}
</style>
