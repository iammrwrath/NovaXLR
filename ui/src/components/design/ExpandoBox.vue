<template>
  <button class="expander" @click="handleClick">
    <font-awesome-icon v-if=expanded :title="$t('message.common.collapseSection')" :icon="'fa-solid ' + expand_left" />
    <font-awesome-icon v-else :title="$t('message.common.expandSection')" :icon="'fa-solid ' + expand_right" />
  </button>
</template>

<script>
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
export default {
  name: "ExpandoBox",
  components: {FontAwesomeIcon},
  props: {
    expanded: {type: Boolean, default: false },
    expand_right: { type: String, required: false, default: 'fa-chevron-right'},
    expand_left: { type: String, required: false, default: 'fa-chevron-left'}
  },

  methods: {
    expandText() {
      if (this.expanded) {
        return "<"
      }
      return ">"
    },
    handleClick() {
      this.$emit("expando-clicked");
    }
  }
}
</script>

<style scoped>
.expander {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  background: rgba(22, 27, 39, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 12px 10px;
  margin: auto 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: center;
}

.expander:hover {
  color: #38bdf8;
  background: rgba(30, 36, 52, 0.95);
  border-color: rgba(14, 165, 233, 0.4);
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.2);
}
</style>
