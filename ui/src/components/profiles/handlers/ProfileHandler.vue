<template>
  <div style="height: 30px; text-align: right">
    <div style="height: 14px; display: inline-block; width: calc(100% - 75px)">
      <hr style="border: 0; height: 1px; background: rgba(255, 255, 255, 0.08);" />
    </div>
    <button
      :title="$t('message.profileManager.accessibilityImportOfficialProfiles')"
      class="openButton"
      style="margin-right: 4px;"
      @click="openImportConfirm"
    >
      <font-awesome-icon icon="fa-solid fa-file-import" />
    </button>
    <button
      :aria-label="$t('message.profileManager.accessibilityOpenProfileDirectory')"
      :title="$t('message.profileManager.accessibilityOpenProfileDirectory')"
      class="openButton"
      @click="openProfiles"
    >
      <font-awesome-icon icon="fa-solid fa-folder" />
    </button>
  </div>
  <div style="height: 340px">
    <ProfileManager
      ref="manager"
      :profile-list="getProfileList()"
      :active-profile="getActiveProfile()"
      :menu-list="getMenuList()"
      @new-profile="newProfile"
      @load-profile="loadProfile"
      @save-profile="saveProfile"
      @save-profile-as="saveProfileAs"
      @menu-item-pressed="menuItemPressed"
    />
  </div>

  <AccessibleModal ref="deleteModal" id="delProfile">
    <template v-slot:title>{{$t('message.profileManager.deleteTitle')}}</template>
    <template v-slot:default>{{$t('message.profileManager.deleteQuestion', { profileName: selectedProfile })}}</template>
    <template v-slot:footer>
      <ModalButton @click="$refs.deleteModal.closeModal(); deleteProfile(this.selectedProfile);">{{$t('message.profileManager.deleteYes')}}</ModalButton>
      <ModalButton ref="focusDelDefault" @click="$refs.deleteModal.closeModal()">{{$t('message.profileManager.deleteNo')}}</ModalButton>
    </template>
  </AccessibleModal>

  <AccessibleModal ref="noDelete" id="delProfile">
    <template v-slot:title>{{$t('message.profileManager.deleteCurrentErrorTitle')}}</template>
    <template v-slot:default>{{$t('message.profileManager.deleteCurrentErrorMessage')}}</template>
  </AccessibleModal>

  <AccessibleModal ref="importConfirm" id="confirm_import_profiles">
    <template v-slot:title>{{ $t('message.system.settings.officialMigration.confirmTitle') }}</template>
    <template v-slot:default>
      <p style="margin: 0; line-height: 1.6;">{{ $t('message.system.settings.officialMigration.confirmMessage') }}</p>
    </template>
    <template v-slot:footer>
      <ModalButton ref="focusImportConfirm" @click="runOfficialImport()">{{ $t('message.system.settings.officialMigration.confirmButton') }}</ModalButton>
      <ModalButton @click="$refs.importConfirm.closeModal()">{{ $t('message.modalButtons.cancel') }}</ModalButton>
    </template>
  </AccessibleModal>

  <AccessibleModal ref="importResultModal" id="import_profiles_result">
    <template v-slot:title>{{ importResultTitle }}</template>
    <template v-slot:default>
      <div :style="{ color: importIsSuccess ? '#38bdf8' : '#f87171', fontSize: '14px', lineHeight: '1.6', display: 'flex', alignItems: 'center' }">
        <font-awesome-icon :icon="importIsSuccess ? 'fa-solid fa-circle-check' : 'fa-solid fa-xmark'" style="margin-right: 10px; font-size: 18px;" />
        <div>{{ importResultMessage }}</div>
      </div>
    </template>
    <template v-slot:footer>
      <ModalButton @click="$refs.importResultModal.closeModal()">{{ $t('message.modalButtons.ok') }}</ModalButton>
    </template>
  </AccessibleModal>
</template>

<script>
import { store } from "@/store";
import { sendHttpCommand, websocket } from "@/util/sockets";
import ProfileManager from "@/components/profiles/ProfileManager.vue";
import AccessibleModal from "@/components/design/modal/AccessibleModal.vue";
import ModalButton from "@/components/design/modal/ModalButton.vue";

export default {
  name: "ProfileHandler",
  components: { ModalButton, AccessibleModal, ProfileManager },

  data() {
    return {
      selectedProfile: "",
      isImporting: false,
      importResultTitle: "",
      importResultMessage: "",
      importIsSuccess: true,
    };
  },

  methods: {
    getMenuList() {
      return [
        { name: this.$t('message.profileManager.menuLoadProfile'), slug: "load" },
        { name: this.$t('message.profileManager.menuLoadProfileColours'), slug: "colours" },
        { name: this.$t('message.profileManager.menuDeleteProfile'), slug: "delete" },
      ];
    },

    getProfileList() {
      return store.getProfileFiles().sort(Intl.Collator().compare);
    },

    getActiveProfile() {
      return store.getActiveDevice().profile_name;
    },

    menuItemPressed(event) {
      if (event.option.slug === "colours") {
        this.loadProfileColours(event.item);
      }

      if (event.option.slug === "load") {
        this.loadProfile(event.item);
      }

      if (event.option.slug === "delete") {
        if (event.item === this.getActiveProfile()) {
          this.$refs.noDelete.openModal(
            this.$refs.focusDelDefault,
            this.$refs.manager.$refs[
              this.$refs.manager.getButtonId(event.item)
            ][0]
          );
        } else {
          this.selectedProfile = event.item;
          this.$refs.deleteModal.openModal(
            this.$refs.focusDelDefault,
            this.$refs.manager.$refs[
              this.$refs.manager.getButtonId(event.item)
            ][0]
          );
        }
      }
    },

    loadProfile: function (label) {
      let command = {
        LoadProfile: [label, true],
      };

      sendHttpCommand(store.getActiveSerial(), command).catch((error) => {
        console.log(error);
      });
      store.setAccessibilityNotification(
          "polite",
          this.$t('message.profileManager.accessibilityLoadedProfile', { profileName: label })
      );
    },

    loadProfileColours: function (label) {
      sendHttpCommand(store.getActiveSerial(), {
        LoadProfileColours: label,
      });
      store.setAccessibilityNotification(
        "polite",
        this.$t('message.profileManager.accessibilityLoadedColours', { profileName: label })
      );
    },

    newProfile(name) {
      sendHttpCommand(store.getActiveSerial(), { NewProfile: name });
      store.setAccessibilityNotification(
          "polite",
          this.$t('message.profileManager.accessibilityCreatedProfile', { profileName: name })
      );
    },

    saveProfile() {
      sendHttpCommand(store.getActiveSerial(), { SaveProfile: [] });
      store.setAccessibilityNotification(
          "polite",
          this.$t('message.profileManager.accessibilitySavedProfile', { profileName: this.getActiveProfile() })
      );
    },

    saveProfileAs(name) {
      let command = {
        SaveProfileAs: name,
      };
      sendHttpCommand(store.getActiveSerial(), command);
      store.setAccessibilityNotification(
          "polite",
          this.$t('message.profileManager.accessibilitySavedProfileAs', { profileName: name })
      );
    },

    deleteProfile(name) {
      sendHttpCommand(store.getActiveSerial(), { DeleteProfile: name });
      store.setAccessibilityNotification(
          "polite",
          this.$t('message.profileManager.accessibilityProfileDeleted', { profileName: name }));
    },

    openProfiles() {
      websocket.open_path("Profiles");
    },

    openImportConfirm() {
      this.$refs.importConfirm.openModal(this.$refs.focusImportConfirm);
    },

    runOfficialImport() {
      this.$refs.importConfirm.closeModal();
      this.isImporting = true;
      websocket.send_daemon_command({"ImportOfficialGoXLR": null})
        .then(() => {
          this.isImporting = false;
          this.importIsSuccess = true;
          this.importResultTitle = this.$t('message.system.settings.officialMigration.successTitle');
          this.importResultMessage = this.$t('message.system.settings.officialMigration.successMessage');
          this.$nextTick(() => {
            this.$refs.importResultModal.openModal();
          });
        })
        .catch((err) => {
          this.isImporting = false;
          this.importIsSuccess = false;
          this.importResultTitle = this.$t('message.system.settings.officialMigration.errorTitle');
          this.importResultMessage = String(err);
          this.$nextTick(() => {
            this.$refs.importResultModal.openModal();
          });
        });
    },
  },
};
</script>

<style scoped>
.openButton {
  display: inline-block;
  color: #a5a7a6;
  padding: 10px;
  font-size: 14px;

  border: 0;
  margin: 0;
  background-color: transparent;
}

.openButton:hover {
  color: #fff;
}
</style>
