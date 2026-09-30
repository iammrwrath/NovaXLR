<template>
  <div class="update-button-wrapper">
    <div v-if="store.appUpdate.available" class="button-badge-indicator" title="Update Available!"></div>
    <BigButton id="app_update_button" ref="button" :title="$t('message.system.updateButton')"
               @button-clicked="openModal">
      <font-awesome-icon icon="fa-solid fa-arrows-rotate" :class="{ 'fa-spin': store.appUpdate.checking }"/>
    </BigButton>
  </div>
</template>

<script>
import BigButton from "@/components/buttons/BigButton.vue";
import {store} from "@/store";

export default {
  name: "AppUpdateButton",
  components: {BigButton},

  computed: {
    store() {
      return store;
    }
  },

  methods: {
    openModal() {
      store.triggerAppUpdateModal();
    }
  }
}
</script>

<style scoped>
.update-button-wrapper {
  position: relative;
  display: inline-block;
}

.button-badge-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  background-color: #0ea5e9;
  border: 2px solid #090b10;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.8);
  animation: pulse 2s infinite;
  z-index: 2;
  pointer-events: none;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 8px rgba(14, 165, 233, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(14, 165, 233, 0);
  }
}
</style>
