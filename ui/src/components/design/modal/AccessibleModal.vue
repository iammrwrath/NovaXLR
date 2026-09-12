<template>
  <div v-show=is_visible class="modal-mask">
    <div class="modal-wrapper">
      <div ref="dialog" class="modal-container" role="dialog" aria-modal="true" :aria-labelledby="`${id}_label`"
           :aria-describedby="`${id}_body`" @keyup.esc.prevent="closeModalEsc">
        <div class="modal-header" tabindex="0">
          <div :id="`${id}_label`" role="heading" aria-level="2" >
            <slot name="title" ref="title"></slot>
          </div>
          <button v-show=show_close ref="close" @click="closeModal()">
            <font-awesome-icon :title="$t('message.common.close')" icon="fa-solid fa-xmark"/>
          </button>
        </div>
        <div class="modal-body" :id="`${id}_body`">
          <slot></slot>
        </div>
        <div v-if="show_footer" class="modal-footer">
          <slot name="footer">
            <button ref="ok" class="modal-default-button" @click="closeModal()">{{ $t('message.modalButtons.ok') }}</button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as focusTrap from "focus-trap";

export default {
  name: "AccessibleModal",
  emits: ["modal-close"],

  props: {
    id: {type: String, required: true},
    show_close: {type: Boolean, default: true},
    show_footer: {type: Boolean, default: true},
    prevent_esc: {type: Boolean, default: false},

    bodyPadding: {type: String, default: "20px"},
    width: {type: String, default: "500px"}
  },

  data() {
    return {
      is_visible: false,
      returnFocus: undefined,
      trap: undefined,
    }
  },

  methods: {
    openModal(focusRef, returnFocus) {
      this.returnFocus = returnFocus;
      this.is_visible = true;

      this.$nextTick(() => {
        if (focusRef === undefined) {
          if (this.$refs.ok !== undefined) {
            this.$refs.ok.focus();
          } else {
            this.$refs.close.focus();
          }
        } else {
          focusRef.focus();
        }

        // Create the focus trap, to prevent moving out..
        this.trap = focusTrap.createFocusTrap(this.$refs.dialog);
        this.trap.activate();
      })
    },

    closeModalEsc() {
      if (this.prevent_esc) {
        return;
      }
      this.closeModal()
    },

    closeModal() {
      // Deactivate the Trap (if active)..
      this.trap.deactivate();

      // Hide the UI..
      this.is_visible = false;

      // Return focus to the requested element.
      if (this.returnFocus !== undefined) {
        this.returnFocus.focus();
      }

      this.$emit('modal-close');
    },

    isOpen() {
      return this.is_visible;
    }
  }
}


</script>

<style scoped>
/* Turn the background of the screen grey */
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  display: table;
  transition: opacity 0.3s ease;
}

/* Positions the Modal in the Middle of the Screen */
.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

/* The Actual Border / Setup of the Modal */
.modal-container {
  border: 1px solid rgba(255, 255, 255, 0.12);

  min-width: v-bind(width);
  max-width: min-content;
  margin: 0 auto;
  background-color: #111520;
  border-radius: 14px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Header Styling.. */
.modal-header {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  background-color: #171d2c;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  color: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  outline: none;
}

.modal-header div {
  padding: 0;
  display: flex;
  align-items: center;
}

.modal-header button {
  padding: 6px 10px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #94a3b8;
  transition: all 0.2s;
}

.modal-header button:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.modal-body {
  background-color: #111520;
  color: #f8fafc;
  padding: v-bind(bodyPadding);
}

.modal-footer {
  background-color: #111520;
  text-align: right;
  padding: 12px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.modal-footer button {
  background-color: #1e2638;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  color: #f8fafc;
  padding: 8px 24px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.modal-footer button:hover {
  background-color: #2b364e;
  border-color: #0ea5e9;
  color: #38bdf8;
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.25);
}
</style>
