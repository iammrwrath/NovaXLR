<template>
  <div class="profile-border">
    <div class="title">
      {{ $t('message.microphone.profiles.title') }}
    </div>
    <div style="height: 30px; text-align: right">
      <div style="height: 14px; display: inline-block; width: calc(100% - 75px);">
        <hr style="border: 0; height: 1px; background: rgba(255, 255, 255, 0.08);" />
      </div>
      <button :title="$t('message.profileManager.accessibilityImportOfficialProfiles')"
              class="openButton" style="margin-right: 4px;" @click="openImportConfirm">
        <font-awesome-icon icon="fa-solid fa-file-import" />
      </button>
      <button :aria-label="$t('message.profileManager.accessibilityOpenMicProfileDirectory')"
              :title="$t('message.profileManager.accessibilityOpenMicProfileDirectory')"
              class="openButton" @click="openProfiles">
        <font-awesome-icon icon="fa-solid fa-folder" />
      </button>
    </div>
    <div style="height: 220px; display: flex; flex-direction: column;">
      <ProfileManager ref="manager" :profile-list="getProfileList()" :active-profile="getActiveProfile()"
                      :menu-list="getMenuList()" @new-profile="newProfile" @load-profile="loadProfile"
                      @save-profile="saveProfile" @save-profile-as="saveProfileAs"
                      @menu-item-pressed="menuItemPressed" />
    </div>

    <AccessibleModal ref="deleteMicModal" id="delMicProfile">
      <template v-slot:title>{{ $t('message.profileManager.deleteTitle') }}</template>
      <template v-slot:default>{{ $t('message.profileManager.deleteQuestion', { profileName: selectedProfile }) }}</template>
      <template v-slot:footer>
        <ModalButton @click="$refs.deleteMicModal.closeModal(); deleteProfile(this.selectedProfile)">{{ $t('message.profileManager.deleteYes') }}</ModalButton>
        <ModalButton ref="focusDelDefault" @click="$refs.deleteMicModal.closeModal()">{{ $t('message.profileManager.deleteNo') }}</ModalButton>
      </template>
    </AccessibleModal>

    <AccessibleModal ref="noDelete" id="delMicProfile">
      <template v-slot:title>{{ $t('message.profileManager.deleteCurrentErrorTitle') }}</template>
      <template v-slot:default>{{ $t('message.profileManager.deleteCurrentErrorMessage') }}</template>
    </AccessibleModal>

    <AccessibleModal ref="importConfirm" id="confirm_import_mic_profiles">
      <template v-slot:title>{{ $t('message.system.settings.officialMigration.confirmTitle') }}</template>
      <template v-slot:default>
        <p style="margin: 0; line-height: 1.6;">{{ $t('message.system.settings.officialMigration.confirmMessage') }}</p>
      </template>
      <template v-slot:footer>
        <ModalButton ref="focusImportConfirm" @click="runOfficialImport()">{{ $t('message.system.settings.officialMigration.confirmButton') }}</ModalButton>
        <ModalButton @click="$refs.importConfirm.closeModal()">{{ $t('message.modalButtons.cancel') }}</ModalButton>
      </template>
    </AccessibleModal>

    <AccessibleModal ref="importResultModal" id="import_mic_profiles_result">
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
  </div>
</template>

<script>
import {store} from "@/store";
import {sendHttpCommand, websocket} from "@/util/sockets";
import ProfileManager from "@/components/profiles/ProfileManager.vue";
import AccessibleModal from "@/components/design/modal/AccessibleModal.vue";
import ModalButton from "@/components/design/modal/ModalButton.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

export default {
  name: "MicProfileHandler",
  components: {FontAwesomeIcon, ModalButton, AccessibleModal, ProfileManager},

  data() {
    return {
      selectedProfile: '',
      isImporting: false,
      importResultTitle: '',
      importResultMessage: '',
      importIsSuccess: true,
    }
  },

  methods: {
    getMenuList() {
      return [
        {name: this.$t('message.profileManager.menuLoadProfile'), slug: 'load'},
        {name: this.$t('message.profileManager.menuDeleteProfile'), slug: 'delete'}
      ];
    },

    getProfileList() {
      return store.getMicProfileFiles().sort(Intl.Collator().compare);
    },

    getActiveProfile() {
      return store.getActiveDevice().mic_profile_name;
    },

    menuItemPressed(event) {
      if (event.option.slug === "load") {
        this.loadProfile(event.item);
      }

      if (event.option.slug === "delete") {
        if (event.item === this.getActiveProfile()) {
          this.$refs.noDelete.openModal(this.$refs.focusDelDefault, this.$refs.manager.$refs[this.$refs.manager.getButtonId(event.item)][0]);
        } else {
          this.selectedProfile = event.item;
          this.$refs.deleteMicModal.openModal(this.$refs.focusDelDefault, this.$refs.manager.$refs[this.$refs.manager.getButtonId(event.item)][0]);
        }
      }
    },

    loadProfile(label) {
      let command = {
        "LoadMicProfile": [label, true]
      };

      sendHttpCommand(store.getActiveSerial(), command)
          .catch((error) => {
            console.log(error);
          });
    },

    newProfile(name) {
      sendHttpCommand(store.getActiveSerial(), {"NewMicProfile": name})
    },

    saveProfile() {
      sendHttpCommand(store.getActiveSerial(), {"SaveMicProfile": []});
    },

    saveProfileAs(name) {
      let command = {
        "SaveMicProfileAs": name
      }
      sendHttpCommand(store.getActiveSerial(), command);
    },

    deleteProfile(name) {
      sendHttpCommand(store.getActiveSerial(), { "DeleteMicProfile": name });
    },

    openProfiles() {
      websocket.open_path("MicProfiles");
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
    }
  }
}
</script>

<style scoped>
.profile-border {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  background-color: #111520;
  width: 240px;
}

.title {
  background-color: #171d2c;
  color: #f1f5f9;
  padding: 16px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.openButton {
  display: inline-block;
  color: #94a3b8;
  padding: 8px;
  font-size: 14px;
  border: 0;
  margin: 0;
  background-color: transparent;
  cursor: pointer;
  transition: color 0.15s ease;
}

.openButton:hover {
  color: #38bdf8;
}
</style>
