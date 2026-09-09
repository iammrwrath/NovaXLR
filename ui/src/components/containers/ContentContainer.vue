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

  padding: 20px 16px;
  justify-content: center;
  align-items: flex-start;

  overflow-x: auto;
  overflow-y: hidden;
}

.container::-webkit-scrollbar {
  height: 5px;
  width: 5px;
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
