<template>
  <div>
    <a href="https://github.com/iammrwrath/NovaXLR/issues/new" target="_blank" @click.prevent="openHelp">
      <BigButton id="help" :title="$t('message.system.help')">
        <font-awesome-icon icon="fa-solid fa-circle-question"/>
      </BigButton>
    </a>
  </div>
</template>

<script>
import BigButton from "@/components/buttons/BigButton.vue";

export default {
  name: "HelpButton",
  components: {BigButton},
  methods: {
    openHelp() {
      const url = "https://github.com/iammrwrath/NovaXLR/issues/new";
      if (window.__TAURI__ && window.__TAURI__.opener) {
        window.__TAURI__.opener.openUrl(url);
      } else {
        window.open(url, "_blank");
      }
    }
  }
}
</script>

<style scoped>

</style>