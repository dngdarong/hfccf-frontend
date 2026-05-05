<script setup>
import { computed, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useLanguage } from '@/composables/useLanguage'
import ProfileCard from '@/modules/settings/components/profile-settings/ProfileCard.vue'
import GeneralInformation from '@/modules/settings/components/profile-settings/GeneralInformation.vue'
import SecuritySettings from '@/modules/settings/components/profile-settings/SecuritySettings.vue'
import AboutWebsite from '@/modules/settings/components/profile-settings/AboutWebsite.vue'
import { useUserStore } from '@/store/userStore'

const { language, t } = useLanguage()
const isKh = computed(() => language.value === 'KH')
const userStore = useUserStore()
const currentUser = computed(() => userStore.currentUser)
const isSuccessAlertVisible = ref(false)
const activeAlertMode = ref('profile')

const title = computed(() => t('pages.profile.pageTitle'))
const subtitle = computed(() => t('pages.profile.pageSubtitle'))
const successAlertTitle = computed(() => t('pages.profile.alerts.profileUpdatedTitle'))
const successAlertMessage = computed(() => t('pages.profile.alerts.profileUpdatedMessage'))

function handleGeneralInformationSubmit(formData) {
  console.log('Profile settings submitted:', formData)
  activeAlertMode.value = 'profile'
  isSuccessAlertVisible.value = true
}

function handleSecuritySubmit(formData) {
  console.log('Security settings submitted:', formData)
  activeAlertMode.value = 'security'
  isSuccessAlertVisible.value = true
}

// Route-level success copy switches by section while reusing one alert component.
const resolvedSuccessAlertTitle = computed(() =>
  activeAlertMode.value === 'security'
    ? t('pages.profile.alerts.securityUpdatedTitle')
    : successAlertTitle.value,
)
const resolvedSuccessAlertMessage = computed(() =>
  activeAlertMode.value === 'security'
    ? t('pages.profile.alerts.securityApprovalPending')
    : successAlertMessage.value,
)

function handleSuccessAlertClose() {
  isSuccessAlertVisible.value = false
}
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'global-page global-page--kh' : 'global-page'">
      <HeaderSection :title="title" :subtitle="subtitle" />

      <div class="profile-settings-layout">
        <aside class="profile-settings-layout__sidebar">
          <ProfileCard v-if="currentUser" :user="currentUser" />
        </aside>

        <main class="profile-settings-layout__content">
          <!-- Let settings cards participate in a shared page grid instead of relying on implicit block flow. -->
          <div class="profile-settings-layout__content-grid">
            <div class="profile-settings-layout__content-item profile-settings-layout__content-item--wide">
              <GeneralInformation
                v-if="currentUser"
                :user="currentUser"
                @submit="handleGeneralInformationSubmit"
              />
            </div>
            <div class="profile-settings-layout__content-item">
              <SecuritySettings @submit="handleSecuritySubmit" />
            </div>
            <div class="profile-settings-layout__content-item">
              <AboutWebsite />
            </div>
          </div>
        </main>
      </div>
      <AlertSuccess
        :show="isSuccessAlertVisible"
        :title="resolvedSuccessAlertTitle"
        :message="resolvedSuccessAlertMessage"
        :button-text="t('common.continue')"
        :auto-close="2500"
        @close="handleSuccessAlertClose"
      />
    </section>
  </MainLayout>
</template>

<style scoped>
.global-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.profile-settings-layout {
  display: grid;
  grid-template-columns: 20rem 1fr;
  align-items: start;
  gap: 1.25rem;
}

.profile-settings-layout__content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 1.25rem;
}

.profile-settings-layout__content-item {
  min-width: 0;
}

.profile-settings-layout__content-item--wide {
  grid-column: span 2;
}

@media (max-width: 1200px) {
  .profile-settings-layout {
    grid-template-columns: 1fr;
  }

  .profile-settings-layout__sidebar {
    max-width: 100%;
  }

  .profile-settings-layout__content-grid {
    grid-template-columns: 1fr;
  }

  .profile-settings-layout__content-item--wide {
    grid-column: auto;
  }
}

.global-page--kh :deep(.profile-settings-card__title),
.global-page--kh :deep(.profile-settings-card__copy) {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}
</style>
