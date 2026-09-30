<template>
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
          <button class="action-btn tertiary" @click="checkForUpdates" title="Re-check">
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
</template>

<script>
import AccessibleModal from "@/components/design/modal/AccessibleModal.vue";
import { store } from "@/store";

export default {
  name: "AppUpdateModal",
  components: { AccessibleModal },

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
        this.$refs.updateModal.openModal();
      }
      if (!store.appUpdate.checkedOnce) {
        store.checkAppUpdate();
      }
    },

    checkForUpdates() {
      store.checkAppUpdate();
    },

    getInstalledVersion() {
      return store.daemonVersion() || "1.2.8";
    },

    downloadUpdate() {
      const url = store.appUpdate.downloadUrl || store.appUpdate.releaseUrl || "https://github.com/iammrwrath/NovaXLR/releases";
      if (typeof window !== "undefined") {
        if (window.__TAURI__ && window.__TAURI__.opener) {
          window.__TAURI__.opener.openUrl(url);
        } else {
          window.open(url, "_blank");
        }
      }
    },

    openGithub() {
      const url = store.appUpdate.releaseUrl || "https://github.com/iammrwrath/NovaXLR/releases";
      if (typeof window !== "undefined") {
        if (window.__TAURI__ && window.__TAURI__.opener) {
          window.__TAURI__.opener.openUrl(url);
        } else {
          window.open(url, "_blank");
        }
      }
    }
  },

  mounted() {
    if (!store.appUpdate.checkedOnce) {
      store.checkAppUpdate();
    }
  }
};
</script>

<style scoped>
.modal-title-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 1.15rem;
  color: #f8fafc;
}

.modal-title-icon {
  color: #38bdf8;
  font-size: 1.2rem;
}

.update-modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;
}

.update-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px 20px;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.app-tagline {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 2px;
}

.version-badges {
  display: flex;
  gap: 10px;
}

.v-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  min-width: 80px;
}

.v-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  font-weight: 600;
}

.v-val {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e2e8f0;
  margin-top: 2px;
}

.v-badge.latest.outdated {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(14, 165, 233, 0.1);
}

.v-badge.latest.outdated .v-val {
  color: #38bdf8;
}

.status-card {
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.status-card.checking {
  flex-direction: row;
  align-items: center;
  gap: 16px;
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.status-icon.checking-spin {
  font-size: 1.75rem;
  color: #38bdf8;
}

.status-card.error {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}

.status-icon.error-icon {
  font-size: 1.75rem;
  color: #ef4444;
}

.status-card.up-to-date {
  background: rgba(16, 185, 129, 0.06);
  border: 1px solid rgba(16, 185, 129, 0.2);
  align-items: center;
  text-align: center;
  padding: 24px 20px;
}

.success-icon {
  font-size: 2.25rem;
  color: #10b981;
}

.status-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: #f8fafc;
}

.status-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 3px;
}

.status-card.update-available {
  background: rgba(14, 165, 233, 0.05);
  border: 1px solid rgba(14, 165, 233, 0.25);
}

.update-banner {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.banner-badge {
  display: inline-block;
  align-self: flex-start;
  padding: 2px 8px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #fff;
  border-radius: 4px;
}

.banner-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #f0f9ff;
}

.banner-desc {
  font-size: 0.85rem;
  color: #94a3b8;
}

.release-date {
  color: #64748b;
  font-size: 0.8rem;
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
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.75rem;
  font-weight: 600;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.notes-body {
  padding: 12px;
  max-height: 180px;
  overflow-y: auto;
}

.notes-body pre {
  margin: 0;
  font-family: inherit;
  font-size: 0.82rem;
  line-height: 1.45;
  color: #cbd5e1;
  white-space: pre-wrap;
  word-break: break-word;
}

.action-buttons-row {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.action-buttons-row.centered {
  justify-content: center;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(2, 132, 199, 0.35);
}

.action-btn.primary:hover {
  background: linear-gradient(135deg, #0369a1 0%, #075985 100%);
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.12);
}

.action-btn.tertiary {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 9px 12px;
}

.action-btn.tertiary:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.05);
}
</style>
