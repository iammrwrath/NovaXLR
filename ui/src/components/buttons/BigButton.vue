<template>
  <button ref="button" role="button" :aria-labelledby="`button_title_${id}`" class="content" @click="clicked">
    <div class="img-section">
      <slot/>
    </div>
    <div class="iconTitle"><span :id="`button_title_${id}`" class="filler">{{ title }}</span></div>
  </button>
</template>

<script>
export default {
  name: "BigButton",

  props: {
    id: { type: String, required: true },
    title: String,
  },

  methods: {
    clicked: function (eventData){
      this.$emit("button-clicked", eventData)
    },
    focus: function() {
      this.$refs.button.focus();
    }
  }
}
</script>

<style scoped>
button.content {
  width: 135px;
  min-width: 135px;
  max-width: 135px;
  height: 170px;
  background: #151a26;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin: 0;
  padding: 0;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button.content:hover {
  transform: translateY(-2px);
  border-color: rgba(14, 165, 233, 0.4);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 16px rgba(14, 165, 233, 0.2);
  cursor: pointer;
}

button .img-section {
  text-align: center;
  height: 130px;
  font-size: 72px;
  color: #64748b;

  display: flex;
  justify-content: center;
  align-items: center;
  transition: color 0.2s ease, background-color 0.2s ease;
}

button:hover .img-section {
  color: #38bdf8;
  background-color: rgba(14, 165, 233, 0.06);
}

button .iconTitle {
  height: 40px;
  line-height: 40px;
  background: #1c2232;
  color: #e2e8f0;
  font-family: inherit;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  text-align: center;
  white-space: nowrap;
  padding: 0px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  transition: background-color 0.2s ease;
}

button:hover .iconTitle {
  background-color: #232b3e;
  color: #ffffff;
}



</style>
