<template>
  <CenteredContainer>
    <GroupContainer :title="$t('message.system.title')">
      <div class="buttons">
        <MicSetupButton />
        <DeviceSettingsButton />
        <SettingsButton />
        <AppUpdateButton />
        <ShutdownButton />
        <AboutButton />
        <LicenseButton />
        <HelpButton />
        <FirmwareUpdateButton />
        <SwitchDeviceButton v-if="store.getDeviceCount() > 1" />
      </div>
    </GroupContainer>
  </CenteredContainer>
</template>

<script>
import MicSetupButton from "@/components/sections/system/modals/MicSetupButton.vue";
import CenteredContainer from "@/components/containers/CenteredContainer.vue";
import GroupContainer from "@/components/containers/GroupContainer.vue";
import LicenseButton from "@/components/sections/system/modals/LicenseButton.vue";
import AboutButton from "@/components/sections/system/modals/AboutButton.vue";
import SettingsButton from "@/components/sections/system/modals/SettingsButton.vue";
import HelpButton from "@/components/sections/system/HelpButton.vue";
import ShutdownButton from "@/components/sections/system/modals/PowerButton.vue";
import DeviceSettingsButton from "@/components/sections/system/modals/DeviceSettingsButton.vue";
import SwitchDeviceButton from "@/components/sections/system/modals/SwitchDeviceButton.vue";
import {store} from "@/store";
import FirmwareUpdateButton from "@/components/sections/system/modals/FirmwareUpdateButton.vue";
import AppUpdateButton from "@/components/sections/system/modals/AppUpdateButton.vue";

export default {
  name: "SystemComponent",
  computed: {
    store() {
      return store
    }
  },
  components: {
    AppUpdateButton,
    FirmwareUpdateButton,
    SwitchDeviceButton,
    DeviceSettingsButton,
    ShutdownButton,
    HelpButton,
    SettingsButton,
    AboutButton,
    LicenseButton,
    GroupContainer,
    CenteredContainer,
    MicSetupButton
  },
}
</script>

<style scoped>
.buttons {
  display: grid;
  grid-template-columns: repeat(4, 135px);
  justify-content: center;
  gap: 16px 20px;
  padding: 8px 4px;
}

@media (max-width: 700px) {
  .buttons {
    grid-template-columns: repeat(2, 135px);
  }
}
</style>
