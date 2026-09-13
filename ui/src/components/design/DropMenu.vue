<template>
  <Teleport to="body">
    <ul @keyup.stop.prevent="debugEvent" v-show="is_active" :aria-expanded="is_active" ref="menuList" role="menu"
        :id="menu_id" class="context-menu" v-click-outside="onClickOutside">
      <li role="presentation" v-for="(option, index) in options" :key="index" @click.stop="optionClicked(option)"
          class="item">
        <a role="menuitem">{{ option.name }}</a>
      </li>
    </ul>
  </Teleport>
</template>

<script>
export default {
  name: "DropMenu",
  emits: ['menu-closed', 'option-clicked'],

  props: {
    options: {
      type: Array,
      required: true,
    },
    menu_id: {type: String, required: false},
  },

  data() {
    return {
      return_id: null,
      identifier: null,
      is_active: false,
      focus_id: 0,
    };
  },

  methods: {
    showMenu(event, identifier, return_id) {
      let positionElement = event.currentTarget || event.target;

      // Locate the containing button or clickable div
      while (positionElement && positionElement.tagName !== "BUTTON" && positionElement.parentElement) {
        positionElement = positionElement.parentElement;
      }
      if (!positionElement) {
        positionElement = event.target;
      }

      const rect = positionElement.getBoundingClientRect();

      this.identifier = identifier;
      this.return_id = return_id;
      this.is_active = true;

      this.$nextTick(() => {
        const menu = this.$refs.menuList;
        if (!menu) return;

        const menuWidth = menu.offsetWidth || 160;
        const menuHeight = menu.offsetHeight || 110;

        // Position to the right or below the clicked element
        let left = rect.right + 4;
        let top = rect.top;

        // Check if the Menu will break the right window boundary, flip to left if so
        if (left + menuWidth > window.innerWidth - 8) {
          left = Math.max(8, rect.left - menuWidth - 4);
        }

        // Check if the Menu will break the bottom window boundary, shift up if so
        if (top + menuHeight > window.innerHeight - 8) {
          top = Math.max(8, window.innerHeight - menuHeight - 8);
        }

        menu.style.left = left + "px";
        menu.style.top = top + "px";

        this.setFocus(0);
      });
    },

    hideContextMenu() {
      if (this.is_active) {
        if (this.$refs.menuList && this.$refs.menuList.children[this.focus_id] && this.$refs.menuList.children[this.focus_id].firstElementChild) {
          this.$refs.menuList.children[this.focus_id].firstElementChild.tabIndex = -1;
        }
        this.is_active = false;

        if (this.return_id) {
          const returnElem = document.getElementById(this.return_id);
          if (returnElem && returnElem.focus) {
            returnElem.focus();
          }
        }
        this.$emit('menu-closed');
      }
    },

    onClickOutside() {
      this.hideContextMenu();
    },

    optionClicked(option) {
      this.hideContextMenu();
      this.$emit('option-clicked', {
        item: this.identifier,
        option: option,
        return_id: this.return_id
      });
    },

    setFocus(id) {
      // Remove the TabIndex from the Old item..
      this.$refs.menuList.children[this.focus_id].firstElementChild.tabIndex = -1;

      // Set the focus on the new item and select..
      this.$refs.menuList.children[id].firstElementChild.tabIndex = 0;
      this.$refs.menuList.children[id].firstElementChild.focus();
      this.focus_id = id;
    },

    debugEvent(e) {
      let children = this.$refs.menuList.childElementCount;

      // Ok, keydown, handle the key..
      switch (e.key) {
        case 'Esc':
        case 'Escape':
          this.hideContextMenu();
          break;

        case 'Up':
        case 'ArrowUp': {
          if (this.focus_id === 0 && children > 1) {
            this.setFocus(children - 1);
          } else if (children > 1) {
            this.setFocus(this.focus_id - 1);
          }
          break;
        }

        case 'Down':
        case 'ArrowDown': {
          if ((this.focus_id === children - 1) && children > 1) {
            this.setFocus(0);
          } else if (children > 1) {
            this.setFocus(this.focus_id + 1);
          }
          break;
        }

        case ' ':
        case 'Enter': {
          this.optionClicked(this.options[this.focus_id]);
          break;
        }
      }
    }
  },

  beforeUnmount() {
    this.is_active = false;
  }
}
</script>

<style scoped>
.context-menu {
  background-color: #171d2c;
  color: #f8fafc;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);
  list-style: none;
  position: fixed;
  left: 0;
  margin: 0;
  padding: 4px 0;
  top: 0;
  z-index: 9999999;
  overflow: hidden;
}

.context-menu .item {
  align-items: center;
  color: #f8fafc;
  cursor: pointer;
  display: flex;
  padding: 8px 16px;
  font-size: 12px;
  transition: background-color 0.15s, color 0.15s;
}

.context-menu .item:hover {
  background-color: #0ea5e9 !important;
  color: #ffffff;
}

.context-menu .item:focus-within {
  background-color: #1e2638;
  color: #38bdf8;
}

.context-menu .item a:focus {
  outline: none;
}

ul:first-child {
  margin-top: 4px;
}

ul:last-child {
  margin-bottom: 4px;
}
</style>
