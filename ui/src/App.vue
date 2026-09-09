<template>
  <div id="app-viewport">
    <div id="app-scaler" :style="scalerStyle">
      <GoXLR/>
    </div>
  </div>
</template>

<script>
import GoXLR from "@/components/GoXLR.vue";

export default {
  name: 'App',
  components: {
    GoXLR,
  },
  data() {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      baseWidth: 1300,
      baseHeight: 890,
      scale: 1,
    };
  },
  computed: {
    scalerStyle() {
      return {
        zoom: this.scale,
        width: `${this.baseWidth}px`,
        boxSizing: 'border-box',
        padding: '12px',
        margin: 'auto',
      };
    }
  },
  methods: {
    updateScale() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
      const scaleX = this.windowWidth / this.baseWidth;
      const scaleY = this.windowHeight / this.baseHeight;
      // Scale uniformly to fit window without clipping or distorting
      let s = Math.min(scaleX, scaleY);
      this.scale = Math.max(0.55, Math.min(3.0, s));
    }
  },
  mounted() {
    this.updateScale();
    window.addEventListener('resize', this.updateScale);
  },
  beforeUnmount() {
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
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at 50% 15%, #181e2b 0%, #080a0e 100%);
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
