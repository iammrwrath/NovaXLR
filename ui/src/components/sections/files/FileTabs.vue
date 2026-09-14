<template>
    <Tabs class="file-tabs-component" :label="$t('message.navigation.accessibilityProfileSection')">
        <Tab id="profiles" :name="$t('message.navigation.profiles')" :selected="true">
            <ProfileHandler />
        </Tab>
        <Tab id="samples" v-if="!isDeviceMini()" :name="$t('message.navigation.samples')">
            <SampleHandler />
        </Tab>
        <Tab id="presets" v-if="!isDeviceMini()" :name="$t('message.navigation.presets')">
            <PresetHandler />
        </Tab>
    </Tabs>
</template>

<script>
import Tabs from "@/components/tabs/Tabs.vue";
import Tab from "@/components/tabs/Tab.vue";
import ProfileHandler from "@/components/profiles/handlers/ProfileHandler.vue";
import PresetHandler from "@/components/sections/files/PresetHandler.vue";
import SampleHandler from "@/components/sections/files/SampleHandler.vue";
import { isDeviceMini } from "@/util/util";

export default {
    name: "FileTabs",
    methods: {
        isDeviceMini,
    },
    components: { SampleHandler, PresetHandler, ProfileHandler, Tabs, Tab },
};
</script>

<style scoped>
.file-tabs-component {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
