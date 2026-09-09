<template>
  <div>
    <BigButton id="about_button" ref="button" :title="$t('message.system.aboutButton')"
               @button-clicked="$refs.aboutModal.openModal(undefined, $refs.button)">
      <font-awesome-icon icon="fa-solid fa-circle-info"/>
    </BigButton>
    <AccessibleModal ref="aboutModal" id="about_modal" :show_footer=false>
      <template v-slot:title>{{ $t('message.system.aboutButton') }}</template>
      <div style="text-align: left">
        <div style="margin-bottom: 20px">
          <div style="font-size: 16px; font-weight: bold">{{ $t('message.system.about.serial') }}</div>
          <div>{{ getSerial() }}</div>
        </div>

        <div style="margin-bottom: 20px">
          <div style="font-size: 16px; font-weight: bold">{{ $t('message.system.about.utilityVersion') }}</div>
          <div>{{ getUtilityVersion() }}</div>
        </div>

        <div style="margin-bottom: 20px">
          <div style="font-size: 16px; font-weight: bold">{{ $t('message.system.about.driverVersion') }}</div>
          <div>{{ getDriverVersion() }}</div>
        </div>

        <div>
          <div style="font-size: 16px; font-weight: bold">{{ $t('message.system.about.hardwareVersion') }}</div>
          <div>
          <span
              style="display: inline-block; width: 80px; font-weight: bold">{{
              $t('message.system.about.firmware')
            }}: </span>
            <span>{{ getFirmwareVersion() }}</span>
          </div>
          <div>
          <span
              style="display: inline-block; width: 80px; font-weight: bold">{{ $t('message.system.about.dice') }}: </span>
            <span>{{ getDice() }}</span>
          </div>
          <div>
          <span
              style="display: inline-block; width: 80px; font-weight: bold">{{ $t('message.system.about.fpga') }}:</span>
            <span>{{ getFPGACount() }}</span>
          </div>
        </div>

        <div style="margin-top: 24px; padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
          <div style="font-size: 15px; font-weight: bold; color: #38bdf8; margin-bottom: 6px;">Framework & Acknowledgements</div>
          <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
            NovaXLR is a modernized, enhanced interface and Windows distribution built on top of the open-source GoXLR Utility framework created by <strong>Craig McLure (FrostyCoolSlug)</strong> and the <strong>GoXLR-on-Linux Community</strong>.
          </div>
          <div style="margin-top: 8px;">
            <a href="https://github.com/GoXLR-on-Linux/goxlr-utility" target="_blank" style="color: #0ea5e9; text-decoration: underline; font-size: 13px;">
              github.com/GoXLR-on-Linux/goxlr-utility
            </a>
          </div>
        </div>
      </div>
    </AccessibleModal>
  </div>
</template>

<script>
import BigButton from "@/components/buttons/BigButton.vue";
import AccessibleModal from "@/components/design/modal/AccessibleModal.vue";
import {store} from "@/store";
import { isWindowsDriver } from "@/util/util";

export default {
  name: "AboutButton",
  components: {AccessibleModal, BigButton},

  data() {
    return {
      showModal: false,
      aboutTitle: "About"
    }
  },

  methods: {
    getSerial() {
      return store.getActiveSerial();
    },

    getUtilityVersion() {
      return store.getVersion();
    },

    getDriverVersion() {
      let version = this.$t('message.common.unknown');
      if (store.getConfig() === undefined) {
        return version;
      }

      if (store.getConfig().driver_interface.version !== null) {
        version = this.buildVersionString(store.getConfig().driver_interface.version);
      }

      if (isWindowsDriver()) {
        return "TC-Helicon Driver (" + version + ")";
      }
      return "libUSB (" + version + ")";
    },

    getFirmwareVersion() {
      return this.buildVersionString(store.getActiveDevice().hardware.versions.firmware);
    },

    getDice() {
      return this.buildVersionString(store.getActiveDevice().hardware.versions.dice);
    },

    getFPGACount() {
      return store.getActiveDevice().hardware.versions.fpga_count;
    },

    buildVersionString(version) {
      let output = "";
      for (let i =0; i < version.length; i++) {
        if (version[i] == null) {
          return output;
        }
        if (output !== "") {
          output = output + "."
        }
        output = output + version[i];
      }
      return output;
    },
  }
}
</script>

<style scoped>

</style>
