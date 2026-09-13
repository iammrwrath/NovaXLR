import { reactive } from "vue";
import { applyOperation } from "fast-json-patch";


export const store = reactive({
    is_connected: false,
    has_connected: false,
    have_device: false,
    active: true,
    activeSerial: "",

    pausedPaths: [],

    on_connected: [],
    on_disconnected: [],

    // Set a 'base' status struct..
    status: {
        "mixers": {},
        "files": {}
    },
    a11y: {
        notifications: {
            enabled: true,
            assertive: "",
            polite: ""
        }
    },

    appUpdate: {
        checking: false,
        checkedOnce: false,
        available: false,
        currentVersion: "",
        latestVersion: "",
        releaseName: "",
        releaseDate: "",
        releaseNotes: "",
        releaseUrl: "https://github.com/iammrwrath/NovaXLR/releases",
        downloadUrl: "",
        error: null,
        modalOpenTrigger: 0,
    },

    onConnected(func) {
        this.on_connected.push(func);
    },

    onDisconnected(func) {
        this.on_disconnected.push(func);
    },

    socketDisconnected() {
        this.activeSerial = "";
        this.status = {
            "mixers": {},
            "files": {}
        };

        this.is_connected = false;
        for (let func of this.on_disconnected) {
            func();
        }
    },


    socketConnected(status) {
        this.has_connected = true;
        this.replaceData(status);
        this.is_connected = true;

        for (let func of this.on_connected) {
            func();
        }
    },

    daemonVersion() {
        if (this.status !== undefined) {
            if (this.status.config !== undefined) {
                return this.status.config.daemon_version;
            }
            return undefined;
        } else {
            return undefined;
        }
    },

    isConnected() {
        return this.is_connected;
    },

    // These methods determine whether at any point in the past we've connected..
    hasConnected() {
        return this.has_connected;
    },

    getConfig() {
        return this.status.config;
    },

    getVersion() {
        return this.status.config.daemon_version;
    },

    getDeviceCount() {
        return Object.keys(this.status.mixers).length;
    },

    setActiveSerial(serial) {
        this.activeSerial = serial;
    },

    getActiveDevice() {
        if (this.activeSerial === "") {
            return undefined;
        }
        return this.status.mixers[this.activeSerial];
    },

    hasActiveDevice() {
        return this.activeSerial !== "";
    },

    getActiveSerial() {
        return this.activeSerial;
    },

    getProfileFiles() {
        return this.status.files.profiles;
    },

    getMicProfileFiles() {
        return this.status.files.mic_profiles;
    },

    getPresetFiles() {
        return this.status.files.presets;
    },

    getSampleFiles() {
        return this.status.files.samples;
    },

    getIconFiles() {
        return this.status.files.icons;
    },

    replaceData(json) {
        if (this.active) {
            Object.assign(this.status, json.Status);
            this.have_device = true;
            this.validateActive();
        }
    },

    pausePatchPath(path) {
        if (path === undefined) {
            console.error("Attempted to Stop Patches for Undefined!");
            return;
        }
        let paths = path.split(";");
        for (path of paths) {
            this.pausedPaths.push(path);
        }
    },

    resumePatchPath(path) {
        let paths = path.split(";");
        for (let p of paths) {
            let index = this.pausedPaths.indexOf(p);
            if (index !== -1) {
                this.pausedPaths.splice(index, 1);
            }
        }
    },

    // eslint-disable-next-line no-unused-vars
    patchData(json) {
        if (this.have_device && json && json.Patch) {
            for (let patch of json.Patch) {
                if (this.pausedPaths.includes(patch.path)) {
                    continue;
                }

                try {
                    applyOperation(this.status, patch, true, true, false);
                } catch (e) {
                    console.warn("Error applying json patch:", e, patch);
                }
            }
            this.validateActive();
        }
    },

    validateActive() {
        if (this.status.mixers[this.activeSerial] === undefined) {
            // We've lost our device, stop being active.
            this.activeSerial = "";
        }
    },

    pause() {
        this.active = false;
    },

    resume() {
        this.active = true;
    },

    isPaused() {
        return !this.active;
    },
    getAccessibilityNotification(type) {
        if (this.a11y.notifications.enabled) {
            return this.a11y.notifications[type];
        }
        return "";
    },
    setAccessibilityNotification(type, message) {
        this.a11y.notifications[type] = message;
    },

    triggerAppUpdateModal() {
        this.appUpdate.modalOpenTrigger++;
    },

    async checkAppUpdate() {
        if (this.appUpdate.checking) return;
        this.appUpdate.checking = true;
        this.appUpdate.error = null;
        try {
            const current = this.daemonVersion() || "1.2.5";
            this.appUpdate.currentVersion = current;
            const res = await fetch("https://api.github.com/repos/iammrwrath/NovaXLR/releases");
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const releases = await res.json();
            if (Array.isArray(releases) && releases.length > 0) {
                const validReleases = releases.filter(r => !r.draft && !r.prerelease);
                const latest = validReleases.length > 0 ? validReleases[0] : releases[0];
                if (latest && latest.tag_name) {
                    const latestVer = latest.tag_name.replace(/^v/, '');
                    this.appUpdate.latestVersion = latestVer;
                    this.appUpdate.releaseName = latest.name || `NovaXLR v${latestVer}`;
                    this.appUpdate.releaseDate = latest.published_at ? new Date(latest.published_at).toLocaleDateString() : "";
                    this.appUpdate.releaseNotes = latest.body || "";
                    this.appUpdate.releaseUrl = latest.html_url || "https://github.com/iammrwrath/NovaXLR/releases";

                    // Find Windows installer asset (.exe)
                    let downloadUrl = "";
                    if (Array.isArray(latest.assets)) {
                        const exeAsset = latest.assets.find(a => a.name && a.name.endsWith('.exe'));
                        if (exeAsset && exeAsset.browser_download_url) {
                            downloadUrl = exeAsset.browser_download_url;
                        }
                    }
                    if (!downloadUrl) {
                        downloadUrl = `https://github.com/iammrwrath/NovaXLR/releases/download/v${latestVer}/NovaXLR-${latestVer}.exe`;
                    }
                    this.appUpdate.downloadUrl = downloadUrl;

                    // Compare versions
                    this.appUpdate.available = this.isVersionOutdated(current, latestVer);
                }
            }
            this.appUpdate.checkedOnce = true;
        } catch (err) {
            console.warn("Failed checking for NovaXLR updates:", err);
            this.appUpdate.error = err.message || "Failed to check for updates";
        } finally {
            this.appUpdate.checking = false;
        }
    },

    isVersionOutdated(current, latest) {
        if (!current || !latest) return false;
        const cParts = String(current).split('.').map(n => parseInt(n, 10) || 0);
        const lParts = String(latest).split('.').map(n => parseInt(n, 10) || 0);
        for (let i = 0; i < Math.max(cParts.length, lParts.length); i++) {
            const c = cParts[i] || 0;
            const l = lParts[i] || 0;
            if (l > c) return true;
            if (l < c) return false;
        }
        return false;
    }
});
