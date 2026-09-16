<template>
  <div class="wrapper">
  <div class="buttonList">
    <div>
      <div class="label">{{ $t('message.deviceSelector.title') }}</div>

      <!-- If we've never connected before, and we're not connected now.. -->
      <div v-if="!hasConnected() && !isConnected()">
        <div class="no-device">{{ $t('message.deviceSelector.connecting') }}</div>
      </div>

      <!-- We *HAVE* connected before, but we're not connected now.. -->
      <div v-else-if="hasConnected() && !isConnected()">
        <div class="no-device disconnected">{{ $t('message.deviceSelector.disconnected') }}</div>
      </div>

      <!-- We should be connected here! -->
      <div v-else>
        <div class="buttonHolder" v-if="deviceCount > 0">
          <Button v-for="(device, key) in getMixers()" :key=key :button-id=key :is-active=false
                  :label="getLabel2(key, device)" @button-pressed="setDevice(key)"/>
        </div>
        <div v-else class="no-device-box">
          <div class="no-device">{{ $t('message.deviceSelector.noDevices') }}</div>
          <div class="coexistence-hint">
            Tip: If the official GoXLR app is running, please exit it from the Windows system tray (bottom-right taskbar) so NovaXLR can access your mixer.
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="isConnected() && hasConfig()" class="buttonList" style="width: 170px">
    <div class="buttonHolder" style="width: 170px; padding-top: 25px; overflow-y: initial">
      <SettingsButton />
    </div>
  </div>
  </div>
</template>

<script>

import Button from "@/components/buttons/Button.vue";
import {store} from "@/store";
import SettingsButton from "@/components/sections/system/modals/SettingsButton.vue";

export default {
  name: "DeviceSelector",
  components: {SettingsButton, Button},
  data() {
    return {
      devices: [],
    }
  },

  computed: {
    deviceCount() {
      return store.getDeviceCount();
    }
  },

  watch: {
    // This code probably isn't needed, but is for when a GoXLR suddenly appears in the data.
    deviceCount(newCount, oldCount) {
      if (newCount === 1 && oldCount === 0) {
        store.setActiveSerial(Object.keys(this.getMixers())[0]);
      }
    }
  },

  methods: {
    hasConnected() {
      return store.hasConnected();
    },

    isConnected() {
      return store.isConnected();
    },

    hasConfig() {
      return store.getConfig() !== undefined;
    },

    getMixers() {
      return store.status.mixers;
    },

    setDevice(serial) {
      store.setActiveSerial(serial);
    },

    getLabel2(serial, device) {
      return "[" + serial + "] GoXLR " + device.hardware.device_type + " connected to USB bus " + device.hardware.usb_device.bus_number + " address " + device.hardware.usb_device.address;
    },
  },

  created() {
    if (this.deviceCount === 1) {
      store.setActiveSerial(Object.keys(this.getMixers())[0]);
    }
  }
}
</script>

<style scoped>
.wrapper {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
}

.buttonList {
  min-height: 220px;
  width: 700px;
  margin: 3px;
  background-color: #111520;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.buttonList:not(:last-child) {
  margin-right: 20px;
}

.buttonHolder {
  height: 170px;
  width: 700px;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 10px;
}

.buttonHolder::-webkit-scrollbar {
  width: 4px;
}

.buttonHolder::-webkit-scrollbar-track {
  background-color: transparent;
}

.buttonHolder::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

.label {
  padding: 12px 18px;
  color: #f8fafc;
  background-color: #171d2c;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.no-device-box {
  padding: 20px 10px;
}

.no-device {
  color: #94a3b8;
  font-size: 14px;
}

.coexistence-hint {
  margin-top: 14px;
  font-size: 12px;
  line-height: 1.5;
  color: #38bdf8;
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 8px;
  padding: 10px 16px;
  max-width: 550px;
  margin-left: auto;
  margin-right: auto;
}

.no-device.disconnected {
  white-space: pre-line;
}

</style>
