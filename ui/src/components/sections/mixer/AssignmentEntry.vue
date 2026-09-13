<template>
  <div class="assignment">
    <div style="flex-grow: 1">
      <div role="radio" class="button" @click="setMixMonitor" :class="{ highlight: isMixMonitored() }"
           :aria-label="`Monitor ${display}`" :aria-description="`Listen to ${display} in Headphones`"
           :aria-checked="isMixMonitored()">
        <div class="icon" :class="{ faded: !isMixMonitored() }">
          <font-awesome-icon icon="fa-solid fa-headphones"/>
        </div>
        <div class="text">{{ display }}</div>
      </div>
    </div>
    <div role="radiogroup">
      <div class="box">
        <div>
          <label :for="getRadioId('A')" class="label MixA"
                 :class="{ selected: isDeviceMix('A') }">{{ $t('message.mixer.channelA') }}</label>
          <input class="screenreader-only" type="radio" :id="getRadioId('A')" @change="setDeviceMix"
                 :checked="isDeviceMix('A')" :name="name" value="A" :aria-label="$t('message.mixer.channelA')"/>
        </div>
        <div>
          <label :for="getRadioId('B')" class="label MixB"
                 :class="{ selected: isDeviceMix('B') }">{{ $t('message.mixer.channelB') }}</label>
          <input class="screenreader-only" type="radio" :id="getRadioId('B')" @change="setDeviceMix"
                 :checked="isDeviceMix('B')" :name="name" value="B" :aria-label="$t('message.mixer.channelB')"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {store} from "@/store";
import {websocket} from "@/util/sockets";

export default {
  name: "AssignmentEntry",
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

    getRadioId(type) {
      return type + this.name;
    },

    setDeviceMix(e) {
      let command = {
        "SetSubMixOutputMix": [this.name, e.target.value]
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
.assignment {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.button {
  display: flex;
  flex-direction: row;
  align-items: center;
  text-align: left;
  padding: 6px 12px;

  min-width: 150px;
  height: 36px;

  box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  background-color: #171d2c;
  color: #e2e8f0;
  font-family: inherit;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.15s ease;
}

.button:hover {
  background-color: #21283c;
  border-color: rgba(255, 255, 255, 0.15);
}

.button.highlight {
  border: 1px solid #0ea5e9;
  background-color: rgba(14, 165, 233, 0.15);
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.2);
  color: #ffffff;
}

.button .icon {
  font-size: 18px;
  color: #0ea5e9;
  display: flex;
  align-items: center;
}

.button .icon.faded {
  color: #64748b;
}

.button .text {
  flex-grow: 1;
  padding-left: 10px;
  padding-right: 10px;
  width: 100%;
  margin: auto;
  text-align: center;
  font-weight: 500;
  box-sizing: border-box;
}

.box {
  display: flex;
  background-color: #111520;
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-direction: row;
  padding: 3px;
  border-radius: 8px;
  height: 36px;
  box-sizing: border-box;
  align-items: center;
}

.label {
  color: #94a3b8;
  padding: 4px 16px;
  display: flex;
  align-items: center;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  height: 28px;
  box-sizing: border-box;
}

.label:hover:not(.selected) {
  color: #f8fafc;
}

.selected {
  color: #ffffff;
  font-weight: 600;
}

.selected.MixA {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.35);
}

.selected.MixB {
  background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.35);
}
</style>