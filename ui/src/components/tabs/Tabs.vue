<template>
  <div style="margin-left: 8px; margin-right: 8px;">
    <div class="tab" role="TabList" :aria-label="tabListLabel">
      <button v-for="tab in tabs" :key="tab.name"
        :class="{ active: tab.isActive }" v-show="!tab.hidden" @click="selectTab(tab)" role="tab"
        :aria-selected="tab.isActive" :tabindex="tab.isActive ? 0 : -1" @keydown="onTabKeydown" :ref="tab.name">
        {{ tab.name }}
      </button>
    </div>
    <div class="tabs-details" role="tabpanel" :aria-label="getActiveTab().name">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  emits: ["on-change"],
  name: "TabList",

  data() {
    return { tabs: [] };
  },
  computed: {
    tabListLabel() {
      return this.label || this.$t('message.common.tabList');
    },
  },
  props: {
    label: {
      type: String,
      required: false,
      default: "Tab list",
    },
  },

  created() {
    window.addEventListener("keydown", this.onTabKeydownGlobal)
  },
  unmounted() {
    window.removeEventListener("keydown", this.onTabKeydownGlobal)
  },
  methods: {
    selectTab(selectedTab) {
      let activeTab = this.tabs.find((tab) => tab.isActive);
      this.tabs.forEach((tab) => {
        tab.isActive = tab.id === selectedTab.id;
      });
      let newActive = this.tabs.find((tab) => tab.isActive);

      if (activeTab !== newActive) {
        // Make sure we mount the tab before we call an update..
        this.$nextTick(() => this.$emit("on-change", selectedTab));
      }
    },

    // This function is generally for external calls, to set directly by id.
    selectTabById(id) {
      let tab = this.tabs.find((tab) => tab.id === id);
      this.selectTab(tab);
    },

    getActiveTab() {
      //return the active tab
      const activeTab = this.tabs.find((tab) => tab.isActive);
      if (activeTab) {
        return activeTab;
      } else {
        return "";
      }
    },
    //keyboard navigation
    onTabKeydown(event) {
      const tabs = this.tabs;
      const activeTab = this.getActiveTab();
      const activeTabIndex = tabs.indexOf(activeTab);
      let nextTab;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
          nextTab = tabs[(activeTabIndex + 1) % tabs.length];
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          nextTab = tabs[(activeTabIndex - 1 + tabs.length) % tabs.length];
          break;
        case "Home":
          nextTab = tabs[0];
          break;
        case "End":
          nextTab = tabs[tabs.length - 1];
          break;
        default:
          break;
      }


      if (nextTab) {
        this.selectTab(nextTab);
        //nextTab.$el is the button element
        //we need a ref on the button element to focus it
        this.$refs[nextTab.name][0].focus();
      }
    },
    onTabKeydownGlobal(event) {
      if (this.label !== "Device Settings") return;
      const tabs = this.tabs;
      // const activeTab = this.getActiveTab();
      // const activeTabIndex = tabs.indexOf(activeTab);
      let nextTab;
      if (event.shiftKey && event.ctrlKey) {
        // Shift(Number) have different symbol between US keyboard and Other language.
        switch (event.code) {
          case "Digit1":
          case "Digit2":
          case "Digit3":
          case "Digit4":
          case "Digit5":
          case "Digit6":
          case "Digit7":
          case "Digit8":
            nextTab = tabs[Number(event.code[5]) - 1];
            break;
          default:
            break;
        }
      }

      if (nextTab) {
        this.selectTab(nextTab);
        //nextTab.$el is the button element
        //we need a ref on the button element to focus it
        this.$refs[nextTab.name][0].focus();
      }
    },
  },
  mounted() {
    this.$emit("on-change", this.getActiveTab());
  }
};
</script>

<style>
.tab {
  display: flex;
  gap: 6px;
  padding: 6px 8px;
  background: rgba(18, 22, 32, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px 12px 0 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-align: left;
  overflow-x: auto;
}

.tab button {
  background-color: transparent;
  border: 1px solid transparent;
  outline: none;
  cursor: pointer;
  padding: 8px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  min-width: 110px;
  max-width: min-content;
  border-radius: 8px;
  color: #94a3b8;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}

.tab button:hover:not(.active) {
  background-color: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

.tab button.active {
  background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #06b6d4 100%);
  color: #ffffff;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 14px rgba(14, 165, 233, 0.35);
  text-shadow: none;
}

.tabs-details {
  background: rgba(18, 22, 32, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 0;
  border-radius: 0 0 14px 14px;
  padding: 12px;
  margin: 0;
  overflow: auto;
  vertical-align: middle;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
}
</style>
