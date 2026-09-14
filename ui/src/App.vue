<template>
  <div id="app-viewport">
    <TitleBar />
    <main id="app-content-wrapper">
      <GoXLR/>
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
  min-height: 0;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 8px 16px 12px 16px;
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
