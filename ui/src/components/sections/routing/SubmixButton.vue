<template>
  <th class="button" :class="{ highlight: isMixMonitored() }">
      <div role="button" class="icon" :class="{ faded: !isMixMonitored() }" @click="setMixMonitor">
        <font-awesome-icon icon="fa-solid fa-headphones"/>
      </div>
      <div class="text">{{ display }}</div>
      <div class="highlight" :class="[ isDeviceMix('A') ? 'mixA' : 'mixB' ]">{{ getOutputMix() }}</div>
  </th>
</template>

<script>
import {store} from "@/store";
import {websocket} from "@/util/sockets";

export default {
  name: "SubmixButton",

  props: {
    display: String,
    name: String,
  },

  methods: {
    isMixMonitored() {
      return store.getActiveDevice().levels.output_monitor === this.name;
    },

    setMixMonitor() {
      let command = {
        "SetMonitorMix": this.name
      };
      websocket.send_command(store.getActiveSerial(), command);
    },

    isDeviceMix(mix) {
      return this.getOutputMix(this.name) === mix;
    },
    getOutputMix() {
      return store.getActiveDevice().levels.submix.outputs[this.name];
    },
  }
}
</script>

<style scoped>
.button {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0;

  width: 180px;
  height: 32px;

  box-sizing: border-box;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #e2e8f0;
  font-family: inherit;
  font-weight: 500;
  font-size: 13px;
  transition: all 0.15s ease;
}

.button.highlight {
  border: 1px solid #0ea5e9;
  background-color: rgba(14, 165, 233, 0.12);
}

.button .icon {
  margin-left: 6px;
  padding: 2px 6px;
  font-size: 16px;
  cursor: pointer;
  color: #0ea5e9;
}

.button .icon.faded {
  color: #64748b;
}

.button .icon:hover {
  color: #38bdf8;
}

.button .text {
  flex: 1;
  text-align: center;
  box-sizing: border-box;
  padding: 4px;
}

.button .highlight {
  margin: 4px 6px 4px 4px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
}

.button .highlight.mixA {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
  box-shadow: 0 1px 6px rgba(14, 165, 233, 0.3);
}

.button .highlight.mixB {
  background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
  box-shadow: 0 1px 6px rgba(249, 115, 22, 0.3);
}
</style>