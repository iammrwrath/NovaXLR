<template>
  <header class="titlebar" data-tauri-drag-region @dblclick="handleDoubleClick">
    <!-- Left: Brand, Version & Active Profile -->
    <div class="titlebar-left" data-tauri-drag-region>
      <div class="brand-logo" data-tauri-drag-region>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#brand-grad)" />
          <path d="M2 17L12 22L22 17" stroke="url(#brand-grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="url(#brand-grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <defs>
            <linearGradient id="brand-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#38bdf8"/>
              <stop offset="1" stop-color="#0284c7"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span class="brand-name" data-tauri-drag-region>NovaXLR</span>
      <button class="version-chip" @click="openUpdates" title="Check for updates">
        v{{ currentVersion }}
      </button>

      <div v-if="activeProfileName" class="active-profile-badge" data-tauri-drag-region title="Active Profile">
        <span class="active-dot"></span>
        <span class="profile-name">{{ activeProfileName }}</span>
      </div>
    </div>

    <!-- Center: Window Drag Zone -->
    <div class="titlebar-center" data-tauri-drag-region>
      <span class="drag-handle-hint" data-tauri-drag-region></span>
    </div>

    <!-- Right: Update Pill & Window Controls -->
    <div class="titlebar-right">
      <button v-if="store.appUpdate && store.appUpdate.available" class="update-alert-chip" @click="openUpdates">
        <font-awesome-icon icon="fa-solid fa-cloud-arrow-down" class="update-chip-icon" />
        <span>Update Available</span>
      </button>

      <!-- Desktop Window Controls (Visible in Tauri App) -->
      <div v-if="isTauriApp" class="window-controls">
        <button class="win-btn win-min" @click="minimizeWindow" title="Minimize">
          <svg width="11" height="11" viewBox="0 0 12 12">
            <rect fill="currentColor" width="10" height="1.5" x="1" y="5.5" rx="0.5"/>
          </svg>
        </button>
        <button class="win-btn win-max" @click="toggleMaximizeWindow" :title="isMaximized ? 'Restore' : 'Maximize'">
          <svg v-if="!isMaximized" width="11" height="11" viewBox="0 0 12 12">
            <rect fill="none" stroke="currentColor" stroke-width="1.2" width="9" height="9" x="1.5" y="1.5" rx="1"/>
          </svg>
          <svg v-else width="11" height="11" viewBox="0 0 12 12">
            <path fill="none" stroke="currentColor" stroke-width="1.1" d="M3.5 3.5V1.5h7v7H8.5m-5 2h-2v-7h7v2"/>
          </svg>
        </button>
        <button class="win-btn win-close" @click="closeWindow" title="Close">
          <svg width="11" height="11" viewBox="0 0 12 12">
            <path fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" d="M2 2l8 8M10 2L2 10"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
import { store } from "@/store";

export default {
  name: "TitleBar",

  data() {
    return {
      isMaximized: false,
      isTauriApp: false,
    };
  },

  computed: {
    store() {
      return store;
    },
    currentVersion() {
      return store.daemonVersion() || "1.2.6";
    },
    activeProfileName() {
      if (store.getActiveDevice() && store.getActiveDevice().profile) {
        return store.getActiveDevice().profile;
      }
      return "";
    }
  },

  methods: {
    checkTauriEnvironment() {
      this.isTauriApp = typeof window !== "undefined" && Boolean(window.__TAURI__);
      if (!this.isTauriApp && typeof window !== "undefined") {
        setTimeout(() => {
          this.isTauriApp = Boolean(window.__TAURI__);
        }, 100);
      }
    },

    openUpdates() {
      store.triggerAppUpdateModal();
    },

    handleDoubleClick() {
      if (this.isTauriApp) {
        this.toggleMaximizeWindow();
      }
    },

    async minimizeWindow() {
      if (!this.isTauriApp) return;
      try {
        if (window.__TAURI__.core && window.__TAURI__.core.invoke) {
          await window.__TAURI__.core.invoke("app_window_minimize");
        } else if (window.__TAURI__.event) {
          await window.__TAURI__.event.emit("MINIMIZE-UI");
        } else if (window.__TAURI__.window) {
          await window.__TAURI__.window.getCurrentWindow().minimize();
        }
      } catch (err) {
        console.warn("Minimize window error:", err);
      }
    },

    async toggleMaximizeWindow() {
      if (!this.isTauriApp) return;
      try {
        if (window.__TAURI__.core && window.__TAURI__.core.invoke) {
          await window.__TAURI__.core.invoke("app_window_maximize");
          this.isMaximized = await window.__TAURI__.core.invoke("app_window_is_maximized");
        } else if (window.__TAURI__.event) {
          await window.__TAURI__.event.emit("MAXIMIZE-UI");
          this.isMaximized = !this.isMaximized;
        } else if (window.__TAURI__.window) {
          const win = window.__TAURI__.window.getCurrentWindow();
          await win.toggleMaximize();
          this.isMaximized = await win.isMaximized();
        }
      } catch (err) {
        console.warn("Maximize window error:", err);
      }
    },

    async closeWindow() {
      if (!this.isTauriApp) return;
      try {
        if (window.__TAURI__.core && window.__TAURI__.core.invoke) {
          await window.__TAURI__.core.invoke("app_window_close");
        } else if (window.__TAURI__.event) {
          await window.__TAURI__.event.emit("CLOSE-UI");
        } else if (window.__TAURI__.window) {
          await window.__TAURI__.window.getCurrentWindow().hide();
        }
      } catch (err) {
        console.warn("Close window error:", err);
      }
    }
  },

  mounted() {
    this.checkTauriEnvironment();
  }
};
</script>

<style scoped>
.titlebar {
  height: 38px;
  width: 100%;
  background: linear-gradient(180deg, #131824 0%, #0c1017 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 0 14px;
  box-sizing: border-box;
  user-select: none;
  flex-shrink: 0;
  z-index: 9999;
}

.titlebar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  display: flex;
  align-items: center;
  filter: drop-shadow(0 0 8px rgba(14, 165, 233, 0.5));
}

.brand-name {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: #f8fafc;
}

.version-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  font-size: 10px;
  font-weight: 600;
  border-radius: 10px;
  padding: 2px 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.version-chip:hover {
  background: rgba(14, 165, 233, 0.15);
  border-color: rgba(14, 165, 233, 0.4);
  color: #38bdf8;
}

.active-profile-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 11px;
  color: #e2e8f0;
}

.active-dot {
  width: 6px;
  height: 6px;
  background-color: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
}

.profile-name {
  font-weight: 600;
  color: #34d399;
}

.titlebar-center {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-handle-hint {
  width: 40px;
  height: 3px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
}

.titlebar-right {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.update-alert-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(14, 165, 233, 0.18);
  border: 1px solid rgba(14, 165, 233, 0.45);
  color: #38bdf8;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
  cursor: pointer;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.5); }
  70% { box-shadow: 0 0 0 5px rgba(14, 165, 233, 0); }
  100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
}

.update-chip-icon {
  font-size: 12px;
}

.window-controls {
  display: flex;
  align-items: center;
  height: 100%;
}

.win-btn {
  width: 46px;
  height: 100%;
  background: transparent;
  border: none;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
  margin: 0;
}

.win-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

.win-btn.win-close:hover {
  background: #e11d48;
  color: #ffffff;
}

.win-btn.win-close:active {
  background: #be123c;
}
</style>
