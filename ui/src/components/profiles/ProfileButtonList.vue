<template>
  <div ref="selectorList" class="selectorList">
    <div class="buttonHolder">
      <slot/>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProfileButtonList"
}
</script>

<style scoped>
.selectorList {
  background: transparent;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
}

.buttonHolder {
  margin-top: 6px;
  box-sizing: border-box;
}

.selectorList::-webkit-scrollbar {
  width: 4px;
}

.selectorList::-webkit-scrollbar-track {
  background-color: transparent;
}

.selectorList::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
</style>