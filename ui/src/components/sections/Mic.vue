<template>
  <div class="mic-tab-container">
    <div class="mic-profiles-section">
      <MicProfileHandler />
    </div>
    <div class="mic-content-section">
      <ContentContainer :no-left-pad="true">
        <ContentBox>
          <MicSetupButton @mic-setup-open="mic_open" />
        </ContentBox>
        <Gate ref="gate" />
        <Equaliser/>
        <Compressor/>
        <MicExtra />
      </ContentContainer>
    </div>
  </div>
</template>

<script>
import Gate from "./mic/Gate.vue";
import Equaliser from "./mic/Equalizer.vue";
import Compressor from "./mic/Compressor.vue";
import MicExtra from "./mic/MicExtra.vue";
import MicProfileHandler from "@/components/profiles/handlers/MicProfileHandler.vue";
import MicSetupButton from "@/components/sections/system/modals/MicSetupButton.vue";
import ContentBox from "@/components/ContentBox.vue";
import ContentContainer from "@/components/containers/ContentContainer.vue";

export default {
  name: "MicSections",
  components: {
    ContentContainer,
    ContentBox, MicSetupButton, MicProfileHandler, MicExtra, Compressor, Equaliser, Gate},

  methods: {
    mic_open: function() {
      this.$refs.gate.force_stop_graph();
    }
  }
}
</script>

<style scoped>
.mic-tab-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  gap: 16px;
  align-items: flex-start;
  box-sizing: border-box;
}

.mic-profiles-section {
  flex: 0 0 240px;
  width: 240px;
  padding: 10px 0 10px 4px;
}

.mic-content-section {
  flex: 1;
  min-width: 0;
}
</style>
