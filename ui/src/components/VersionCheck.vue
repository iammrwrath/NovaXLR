<template>
  <div v-if="hasVersion()" class="version-container">
    <button class="version-pill" @click="openAppUpdates" :title="$t('message.system.appUpdate.title')">
      <span class="app-name">NovaXLR</span>
      <span class="version-tag">v{{ getVersion() }}</span>
      <span v-if="outdated()" class="update-indicator available">
        <font-awesome-icon icon="fa-solid fa-cloud-arrow-down" class="update-icon" />
        <span class="update-text">{{ $t('message.versionCheck.updateAvailable') }}</span>
      </span>
      <span v-else class="update-indicator uptodate" :title="$t('message.versionCheck.upToDate')">
        <span class="uptodate-dot"></span>
      </span>
    </button>
    <span v-if="firmware_different()" class="firmware-tag">
      <span class="click" @click="$emit('firmware-click')">{{ $t('message.versionCheck.firmwareDirectionAvailable', { direction: getFirmwareDirectionLabel() }) }}</span>
    </span>
  </div>
  <div v-if="incompatibleDriver()" class="warning-wrap">
      <a class="warning" href="https://utility.frostycoolslug.com/update-site/drivers/TC-Helicon_GoXLR_Driver_5.68.zip" target="_blank">
        {{ $t('message.versionCheck.incompatibleDriver') }}
      </a>
  </div>
</template>

<script>
import {store} from "@/store";
import {driverPreVOD, firmwareSupportsMix2, hasDriverVersion, isDeviceMini, versionEqualTo, versionNewerOrEqualTo} from "@/util/util";
import AccessibleModal from "@/components/design/modal/AccessibleModal.vue";

export default {
  name: "VersionCheck",
  components: {AccessibleModal},

  data: function () {
    return {
      version: undefined,
      release_path: "#",
    }
  },

  methods: {
    getLatest() {
      fetch(this.getPath())
        .then(response => {
          if (!response.ok) {
            return undefined;
          }
          return response.json();
        })
        .then(data => {
          if (!Array.isArray(data) || data.length === 0) {
            return;
          }
          const validReleases = data.filter(r => !r.draft && !r.prerelease);
          const latestRelease = validReleases.length > 0 ? validReleases[0] : data[0];
          if (latestRelease && latestRelease.tag_name) {
            this.version = latestRelease.tag_name.replace(/^v/, '');
            this.release_path = latestRelease.html_url || "#";
          }
        })
        .catch(err => {
          console.debug("Unable to check for NovaXLR updates:", err);
        });
    },

    hasVersion() {
      return (store.daemonVersion() !== undefined);
    },

    getVersion() {
      return store.daemonVersion();
    },

    getFirmwareVersion() {
      if (store.getActiveDevice() === undefined) {
        return false;
      }

      if (store.getConfig() === undefined) {
        return false;
      }

      if (store.getConfig().latest_firmware !== undefined && store.getConfig().latest_firmware !== null) {
        let latest = isDeviceMini() ? store.getConfig().latest_firmware.Mini : store.getConfig().latest_firmware.Full;
        if (latest === undefined || latest === null) {
          return false;
        }

        return latest.version.join(".");
      }
      return true;
    },

    openAppUpdates() {
      store.triggerAppUpdateModal();
    },

    outdated() {
      if (store.appUpdate && store.appUpdate.available) {
        return true;
      }
      if (store.daemonVersion() === undefined) {
        return false;
      }
      return this.isOutdated(store.daemonVersion(), this.version);
    },

    firmware_different() {
      if (store.getActiveDevice() === undefined) {
        return false;
      }

      if (store.getConfig() === null || store.getConfig() === undefined) {
        return false;
      }

      if (store.getConfig().latest_firmware !== undefined && store.getConfig().latest_firmware !== null) {
        let latest = isDeviceMini() ? store.getConfig().latest_firmware.Mini : store.getConfig().latest_firmware.Full;
        if (latest === undefined || latest === null) {
          return false;
        }
        latest = latest.version;

        let current = store.getActiveDevice().hardware.versions.firmware;
        return !versionEqualTo(latest, current);
      }

      // Fail Safe if versions are missing..
      return false;
    },

    firmware_direction() {
      if (store.getActiveDevice() === undefined) {
        return false;
      }

      if (store.getConfig() === null || store.getConfig() === undefined) {
        return false;
      }

      if (store.getConfig().latest_firmware !== undefined && store.getConfig().latest_firmware !== null) {
        let latest = isDeviceMini() ? store.getConfig().latest_firmware.Mini : store.getConfig().latest_firmware.Full;
        if (latest === undefined || latest === null) {
          return false;
        }
        latest = latest.version;

        let current = store.getActiveDevice().hardware.versions.firmware;
        if (versionNewerOrEqualTo(latest, current)) {
          return "update"
        } else {
          return "downgrade"
        }
      }

      return "unknown";
    },

    getFirmwareDirectionLabel() {
      const direction = this.firmware_direction();
      if (!direction) {
        return "";
      }

      return this.$t(`message.versionCheck.firmwareDirections.${direction}`);
    },

    incompatibleDriver() {
      return driverPreVOD() && firmwareSupportsMix2() && hasDriverVersion();
    },

    getPath() {
      return "https://api.github.com/repos/iammrwrath/NovaXLR/releases";
    },

    openRelease() {
      if (this.release_path && this.release_path !== "#") {
        if (window.__TAURI__ && window.__TAURI__.opener) {
          window.__TAURI__.opener.openUrl(this.release_path);
        } else {
          window.open(this.release_path, "_blank");
        }
      }
    },

    isOutdated(base_version, match_version) {
      if (!match_version || !base_version) {
        return false;
      }

      const baseParts = String(base_version).split(".").map(n => parseInt(n, 10) || 0);
      const matchParts = String(match_version).split(".").map(n => parseInt(n, 10) || 0);

      for (let i = 0; i < Math.max(baseParts.length, matchParts.length); i++) {
        const b = baseParts[i] || 0;
        const m = matchParts[i] || 0;
        if (m > b) {
          return true;
        }
        if (m < b) {
          return false;
        }
      }
      return false;
    }
  },

  mounted() {
    this.getLatest();
  }
}
</script>

<style scoped>
  .version-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-top: 10px;
    margin-bottom: 4px;
  }

  .version-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 3px 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    color: #94a3b8;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 11px;
  }

  .version-pill:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(14, 165, 233, 0.4);
    color: #f8fafc;
    box-shadow: 0 0 12px rgba(14, 165, 233, 0.2);
    transform: translateY(-1px);
  }

  .version-pill .app-name {
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: 0.5px;
  }

  .version-pill .version-tag {
    color: #64748b;
    font-weight: 500;
  }

  .update-indicator.available {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(14, 165, 233, 0.2);
    border: 1px solid rgba(14, 165, 233, 0.4);
    color: #38bdf8;
    border-radius: 12px;
    padding: 1px 7px;
    font-weight: 600;
    font-size: 10px;
    letter-spacing: 0.3px;
    animation: pulse-glow 2s infinite;
  }

  @keyframes pulse-glow {
    0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.6); }
    70% { box-shadow: 0 0 0 6px rgba(14, 165, 233, 0); }
    100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
  }

  .update-indicator.uptodate .uptodate-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
    box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
  }

  .firmware-tag {
    font-size: 11px;
    color: #38bdf8;
  }

  .firmware-tag .click {
    cursor: pointer;
    text-decoration: underline;
  }

  .firmware-tag .click:hover {
    color: #0ea5e9;
  }

  .warning-wrap {
    text-align: center;
  }

  .warning {
    margin: auto;
    background-color: #370000;
    border: 1px solid #6e0000;
    color: #8e8e8e;
    font-weight: bold;
    padding: 6px;
    text-align: center;
  }

  .warning a {
    color: #717171;
    text-decoration: none;
  }
</style>
