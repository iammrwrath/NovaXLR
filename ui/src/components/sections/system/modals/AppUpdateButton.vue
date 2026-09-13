<template>
  <div class="update-button-wrapper">
    <div v-if="store.appUpdate.available" class="button-badge-indicator" title="Update Available!"></div>
    <BigButton id="app_update_button" ref="button" :title="$t('message.system.updateButton')"
               @button-clicked="openModal">
      <font-awesome-icon icon="fa-solid fa-arrows-rotate" :class="{ 'fa-spin': store.appUpdate.checking }"/>
    </BigButton>

    <AccessibleModal ref="updateModal" id="app_update_modal" :show_footer="false" width="620px">
      <template v-slot:title>
        <div class="modal-title-bar">
          <font-awesome-icon icon="fa-solid fa-cloud-arrow-down" class="modal-title-icon" />
          <span>{{ $t('message.system.appUpdate.title') }}</span>
        </div>
      </template>

      <div class="update-modal-body">
        <!-- Top Info Header -->
        <div class="update-header-card">
          <div class="app-identity">
            <div class="app-title">NovaXLR</div>
            <div class="app-tagline">Open-Source Audio Mixer Utility</div>
          </div>
          <div class="version-badges">
            <div class="v-badge installed">
              <span class="v-label">{{ $t('message.system.appUpdate.installedVersion') }}</span>
              <span class="v-val">v{{ getInstalledVersion() }}</span>
            </div>
            <div class="v-badge latest" :class="{ 'outdated': store.appUpdate.available }">
              <span class="v-label">{{ $t('message.system.appUpdate.latestVersion') }}</span>
              <span class="v-val">{{ store.appUpdate.latestVersion ? 'v' + store.appUpdate.latestVersion : '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Checking State -->
        <div v-if="store.appUpdate.checking" class="status-card checking">
          <font-awesome-icon icon="fa-solid fa-arrows-rotate" class="fa-spin status-icon checking-spin"/>
          <div class="status-content">
            <div class="status-title">{{ $t('message.system.appUpdate.checking') }}</div>
            <div class="status-desc">Connecting to GitHub repository releases...</div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="store.appUpdate.error" class="status-card error">
          <font-awesome-icon icon="fa-solid fa-circle-question" class="status-icon error-icon"/>
          <div class="status-content">
            <div class="status-title">{{ $t('message.system.appUpdate.errorTitle') }}</div>
            <div class="status-desc">{{ store.appUpdate.error }}</div>
          </div>
          <button class="action-btn secondary" @click="checkForUpdates">
            <font-awesome-icon icon="fa-solid fa-arrows-rotate" />
            {{ $t('message.system.appUpdate.retry') }}
          </button>
        </div>

        <!-- Update Available State -->
        <div v-else-if="store.appUpdate.available" class="status-card update-available">
          <div class="update-banner">
            <div class="banner-badge">UPDATE READY</div>
            <div class="banner-title">{{ $t('message.system.appUpdate.updateAvailableTitle') }}</div>
            <div class="banner-desc">
              {{ $t('message.system.appUpdate.updateAvailableDesc', { version: store.appUpdate.latestVersion }) }}
              <span v-if="store.appUpdate.releaseDate" class="release-date"> ({{ store.appUpdate.releaseDate }})</span>
            </div>
          </div>

          <!-- Release Notes -->
          <div v-if="store.appUpdate.releaseNotes" class="release-notes-section">
            <div class="notes-header">
              <font-awesome-icon icon="fa-solid fa-book-open" />
              <span>{{ $t('message.system.appUpdate.releaseNotes') }}</span>
            </div>
            <div class="notes-body">
              <pre>{{ store.appUpdate.releaseNotes }}</pre>
            </div>
          </div>

          <div class="action-buttons-row">
            <button class="action-btn primary download-btn" @click="downloadUpdate">
              <font-awesome-icon icon="fa-solid fa-download" />
              <span>{{ $t('message.system.appUpdate.downloadNow') }}</span>
            </button>
            <button class="action-btn secondary" @click="openGithub">
              <span>{{ $t('message.system.appUpdate.viewOnGithub') }}</span>
            </button>
            <button class="action-btn tertiary" @click="checkForUpdates">
              <font-awesome-icon icon="fa-solid fa-arrows-rotate" />
            </button>
          </div>
        </div>

        <!-- Up to Date State -->
        <div v-else class="status-card up-to-date">
          <div class="success-icon-wrap">
            <font-awesome-icon icon="fa-solid fa-check-circle" class="status-icon success-icon"/>
          </div>
          <div class="status-content">
            <div class="status-title">{{ $t('message.system.appUpdate.upToDateTitle') }}</div>
            <div class="status-desc">{{ $t('message.system.appUpdate.upToDateDesc') }}</div>
          </div>
          <div class="action-buttons-row centered">
            <button class="action-btn secondary" @click="checkForUpdates">
              <font-awesome-icon icon="fa-solid fa-arrows-rotate" />
              <span>{{ $t('message.system.appUpdate.checkNow') }}</span>
            </button>
            <button class="action-btn tertiary" @click="openGithub">
              <span>{{ $t('message.system.appUpdate.viewOnGithub') }}</span>
            </button>
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

export default {
  name: "AppUpdateButton",
  components: {AccessibleModal, BigButton},

  computed: {
    store() {
      return store;
    }
  },

  watch: {
    'store.appUpdate.modalOpenTrigger'() {
      this.openModal();
    }
  },

  methods: {
    openModal() {
      if (this.$refs.updateModal) {
        this.$refs.updateModal.openModal(undefined, this.$refs.button);
      }
      if (!store.appUpdate.checkedOnce) {
        store.checkAppUpdate();
      }
    },

    checkForUpdates() {
      store.checkAppUpdate();
    },

    getInstalledVersion() {
      return store.daemonVersion() || "1.2.5";
    },

    downloadUpdate() {
      const url = store.appUpdate.downloadUrl || store.appUpdate.releaseUrl || "https://github.com/iammrwrath/NovaXLR/releases";
      if (window.__TAURI__ && window.__TAURI__.opener) {
        window.__TAURI__.opener.openUrl(url);
      } else {
        window.open(url, "_blank");
      }
    },

    openGithub() {
      const url = store.appUpdate.releaseUrl || "https://github.com/iammrwrath/NovaXLR/releases";
      if (window.__TAURI__ && window.__TAURI__.opener) {
        window.__TAURI__.opener.openUrl(url);
      } else {
        window.open(url, "_blank");
      }
    }
  },

  mounted() {
    // Proactively check for updates in the background on startup if not yet checked
    if (!store.appUpdate.checkedOnce) {
      store.checkAppUpdate();
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
  z-index: 10;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(14, 165, 233, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
}

.modal-title-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-title-icon {
  color: #0ea5e9;
  font-size: 16px;
}

.update-modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.update-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  padding: 14px 18px;
}

.app-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #f8fafc;
}

.app-tagline {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

.version-badges {
  display: flex;
  gap: 10px;
}

.v-badge {
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 6px 12px;
  min-width: 90px;
  text-align: center;
}

.v-badge .v-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
}

.v-badge .v-val {
  font-size: 14px;
  font-weight: 700;
  color: #f8fafc;
  margin-top: 2px;
}

.v-badge.latest.outdated {
  border-color: rgba(14, 165, 233, 0.5);
  background: rgba(14, 165, 233, 0.1);
}

.v-badge.latest.outdated .v-val {
  color: #38bdf8;
}

.status-card {
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
}

.status-card.checking {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.checking-spin {
  font-size: 28px;
  color: #0ea5e9;
}

.status-card.error {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.error-icon {
  font-size: 28px;
  color: #ef4444;
}

.status-card.up-to-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  background: rgba(16, 185, 129, 0.06);
  border: 1px solid rgba(16, 185, 129, 0.2);
  padding: 28px 20px;
}

.success-icon {
  font-size: 44px;
  color: #10b981;
}

.status-title {
  font-size: 16px;
  font-weight: 600;
  color: #f8fafc;
}

.status-desc {
  font-size: 13px;
  color: #94a3b8;
  margin-top: 4px;
  line-height: 1.4;
}

.status-card.update-available {
  background: rgba(14, 165, 233, 0.05);
  border: 1px solid rgba(14, 165, 233, 0.25);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.update-banner {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.banner-badge {
  display: inline-block;
  align-self: flex-start;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  padding: 3px 8px;
  background: rgba(14, 165, 233, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.4);
  border-radius: 4px;
}

.banner-title {
  font-size: 18px;
  font-weight: 700;
  color: #f8fafc;
  margin-top: 4px;
}

.banner-desc {
  font-size: 13px;
  color: #cbd5e1;
}

.release-date {
  color: #64748b;
}

.release-notes-section {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  overflow: hidden;
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.notes-body {
  max-height: 160px;
  overflow-y: auto;
  padding: 12px;
}

.notes-body pre {
  margin: 0;
  font-family: inherit;
  font-size: 12px;
  color: #e2e8f0;
  white-space: pre-wrap;
  line-height: 1.5;
}

.action-buttons-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-buttons-row.centered {
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn.primary {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
  color: #ffffff;
  border: 1px solid rgba(56, 189, 248, 0.4);
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%);
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.06);
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.action-btn.tertiary {
  background: transparent;
  color: #94a3b8;
  border: 1px solid transparent;
}

.action-btn.tertiary:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.05);
}
</style>
