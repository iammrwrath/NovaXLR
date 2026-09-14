<template>
  <div id="app-viewport">
    <TitleBar />
    <main id="app-content-wrapper">
      <div id="app-scaler" :style="scalerStyle">
        <GoXLR/>
      </div>
    </main>
  </div>
</template>

<script>
import TitleBar from "@/components/header/TitleBar.vue";
import GoXLR from "@/components/GoXLR.vue";

export default {
  name: 'App',
  components: {
    TitleBar,
    GoXLR,
  },
  data() {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      baseWidth: 1180,
      baseHeight: 915,
      scale: 1,
      resizeRaf: null,
    };
  },
  computed: {
    scalerStyle() {
      return {
        zoom: this.scale,
        width: '100%',
        minHeight: '100%',
        boxSizing: 'border-box',
        padding: '8px 16px 16px 16px',
        display: 'flex',
        flexDirection: 'column',
      };
    }
  },
  methods: {
    updateScale() {
      if (this.resizeRaf) {
        cancelAnimationFrame(this.resizeRaf);
      }
      this.resizeRaf = requestAnimationFrame(() => {
        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        const titleBarHeight = 38;
        const availHeight = Math.max(300, this.windowHeight - titleBarHeight);
        const availWidth = Math.max(300, this.windowWidth);

        const scaleY = availHeight / this.baseHeight;
        const scaleX = availWidth / this.baseWidth;

        // Scale uniformly based on the dimension that constrains it
        let s = Math.min(scaleX, scaleY);
        this.scale = Math.max(0.55, Math.min(1.6, s));
        this.resizeRaf = null;
      });
    }
  },
  mounted() {
    this.updateScale();
    window.addEventListener('resize', this.updateScale);
  },
  beforeUnmount() {
    if (this.resizeRaf) {
      cancelAnimationFrame(this.resizeRaf);
    }
    window.removeEventListener('resize', this.updateScale);
  }
}
</script>

<style>
:root {
  --bg-app: #090b10;
  --bg-surface: #111520;
  --bg-card: #171d2c;
  --bg-card-hover: #21283c;
  --accent-blue: #0284c7;
  --accent-cyan: #0ea5e9;
  --accent-glow: rgba(14, 165, 233, 0.35);
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-card: rgba(255, 255, 255, 0.06);
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}

body {
  background-color: var(--bg-app);
  color: var(--text-main);
  padding: 0;
  margin: 0;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app-viewport {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 50% 12%, #181e2b 0%, #080a0e 100%);
}

#app-content-wrapper {
  flex: 1;
  width: 100%;
  height: calc(100vh - 38px);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

#app-scaler {
  flex: 1;
  width: 100%;
}

#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  user-select: none;
}

/* Modern smooth scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

button, input, select, textarea {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
</style>
