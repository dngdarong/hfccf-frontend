<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Form from '@/components/forms/Form.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import { useLanguage } from '@/composables/useLanguage'
import {
  createSportPlayer,
  fetchSportDivisions,
  fetchSportPlayer,
  fetchSportTeams,
  updateSportPlayer,
} from '@/modules/sport/services/sportApi'
import AddPlayerFormFields from '@/modules/sport/admin/components/add-player/AddPlayerFormFields.vue'
import AddPlayerFormActions from '@/modules/sport/admin/components/add-player/AddPlayerFormActions.vue'
import PlayerChecklist from '@/modules/sport/admin/components/add-player/PlayerChecklist.vue'
import { useProfileImage } from './composables/useProfileImage'
import {
  playerStatusLabel,
  validate,
  getFormPayload,
  initializeFormFromPlayer,
  getProfileImagePreview,
} from './utils/addPlayerHelpers'
import {
  PLAYERS_DIRECTORY_PATH,
  STATUS_OPTIONS,
  REGISTRATION_STATUS_OPTIONS,
  POSITION_OPTIONS,
  PREFERRED_FOOT_OPTIONS,
  BLOOD_TYPE_OPTIONS,
} from './constants/addPlayerConstants'

defineOptions({
  name: 'SportAdminAddPlayerPage',
})

const router = useRouter()
const route = useRoute()
const { t, language, te } = useLanguage()

const {
  profileImagePreview,
  handleProfileImageChange: handleImageChange,
  removeProfileImage: removeImage,
  setImagePreview,
} = useProfileImage(t)

const teamRows = ref([])
const divisions = ref([])

const form = reactive({
  name: '',
  phone: '',
  gender: '',
  team: '',
  division: '',
  jerseyNumber: null,
  age: null,
  status: STATUS_OPTIONS[0],
  matchesPlayed: 0,
  goalsScored: 0,
  profileImage: null,
  heightCm: null,
  weightKg: null,
  preferredFoot: '',
  bloodType: '',
  village: '',
  commune: '',
  district: '',
  province: '',
  currentSchool: '',
  gradeYear: '',
  primaryPosition: '',
  registrationStatus: REGISTRATION_STATUS_OPTIONS[0],
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const isKh = computed(() => language.value === 'KH')

const mode = computed(() => {
  if (route.query.mode === 'view') return 'view'
  if (route.query.mode === 'edit' || Boolean(route.query.id)) return 'edit'
  return 'add'
})
const isViewMode = computed(() => mode.value === 'view')
const isEditMode = computed(() => mode.value === 'edit')
const isFormLocked = computed(() => isSubmitting.value || isViewMode.value)

const teamOptions = computed(() => {
  return [...new Set(teamRows.value.map((item) => String(item?.name || '').trim()).filter(Boolean))].sort()
})

const divisionOptions = computed(() => {
  return divisions.value
    .filter((div) => div.status === 'active')
    .map((div) => div.name)
    .sort()
})

const pageTitle = computed(() => {
  if (isViewMode.value) return t('sportAddPlayer.viewTitle')
  if (isEditMode.value) return t('sportAddPlayer.updateTitle')
  return t('sportAddPlayer.title')
})

const pageSubtitle = computed(() => {
  if (isViewMode.value) return t('sportAddPlayer.viewSubtitle')
  if (isEditMode.value) return t('sportAddPlayer.updateSubtitle')
  return t('sportAddPlayer.summary')
})

const selectedTeamLabel = computed(() => form.team || t('sportAddPlayer.teamPlaceholder'))
const selectedDivisionLabel = computed(() => form.division || t('sportAddPlayer.divisionPlaceholder'))
const selectedStatusLabel = computed(() => playerStatusLabel(form.status, t, te))
const selectedRegistrationStatusLabel = computed(() =>
  playerStatusLabel(form.registrationStatus, t, te),
)

const positionOptions = POSITION_OPTIONS
const preferredFootOptions = PREFERRED_FOOT_OPTIONS
const bloodTypeOptions = BLOOD_TYPE_OPTIONS
const statusOptions = STATUS_OPTIONS

const checklistItems = computed(() => [
  {
    title: t('sportAddPlayer.sidebarItems.identity'),
    text: `${selectedTeamLabel.value} / ${selectedDivisionLabel.value}`,
  },
  {
    title: t('sportAddPlayer.sidebarItems.personal'),
    text:
      form.currentSchool.trim() || form.gradeYear.trim()
        ? `${form.currentSchool || t('sportAddPlayer.sidebarItems.personalDetail')} / ${form.gradeYear || t('sportAddPlayer.sidebarItems.personalDetail')}`
        : t('sportAddPlayer.sidebarItems.personalDetail'),
  },
  {
    title: t('sportAddPlayer.sidebarItems.sports'),
    text:
      form.primaryPosition || form.registrationStatus
        ? `${form.primaryPosition || t('sportAddPlayer.sidebarItems.sportsDetail')} / ${selectedRegistrationStatusLabel.value}`
        : t('sportAddPlayer.sidebarItems.sportsDetail'),
  },
  {
    title: t('sportAddPlayer.sidebarItems.record'),
    text: selectedStatusLabel.value,
  },
])

const checklistHighlightLabel = computed(() => t('sportAddPlayer.sidebarHighlightLabel'))
const checklistHighlightValue = computed(() =>
  isEditMode.value ? t('sportAddPlayer.sidebarHighlightEdit') : t('sportAddPlayer.sidebarHighlightAdd'),
)

function getPlayerStatusLabel(status) {
  return playerStatusLabel(status, t, te)
}

function resetFeedback() {
  errorMessage.value = ''
  showError.value = false
}

async function onProfileImageChange(event) {
  const error = await handleImageChange(event, form, isFormLocked.value)
  if (error) {
    errorMessage.value = error
    showError.value = true
  }
}

function removeProfileImage() {
  removeImage(form, isFormLocked.value)
}

async function goBackToPlayers() {
  await router.push(PLAYERS_DIRECTORY_PATH)
}

function goToEditMode() {
  const id = String(route.query.id || '').trim()
  if (!id) return
  router.replace({ query: { ...route.query, mode: 'edit' } })
}

async function onSubmit() {
  resetFeedback()
  const message = validate(form, t)
  if (message) {
    errorMessage.value = message
    showError.value = true
    return
  }

  isSubmitting.value = true
  try {
    const payload = getFormPayload(form)

    if (isEditMode.value && route.query.id) {
      await updateSportPlayer(route.query.id, payload)
    } else {
      await createSportPlayer(payload)
    }
    showSuccess.value = true
  } catch {
    errorMessage.value = isEditMode.value
      ? t('sportAddPlayer.validation.updateFailed')
      : t('sportAddPlayer.validation.createFailed')
    showError.value = true
  } finally {
    isSubmitting.value = false
  }
}

function onSuccessClose() {
  showSuccess.value = false
  goBackToPlayers()
}

function onErrorClose() {
  showError.value = false
}

onMounted(async () => {
  try {
    const [teamsResponse, divisionsResponse] = await Promise.all([
      fetchSportTeams({ perPage: 100 }),
      fetchSportDivisions({ perPage: 100 }),
    ])
    teamRows.value = teamsResponse.items || []
    divisions.value = divisionsResponse.items || []
  } catch {
    teamRows.value = []
    divisions.value = []
  }

  const id = String(route.query.id || '').trim()
  if (!id) return

  try {
    const found = await fetchSportPlayer(id)
    if (!found?.id) return
    initializeFormFromPlayer(found, form)
    setImagePreview(getProfileImagePreview(found))
  } catch {
    // Handle error silently
  }
})
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'add-player-page add-player-page--kh' : 'add-player-page'">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <div class="add-player-page__layout">
        <Form
          class="add-player-page__form"
          :title="pageTitle"
          :description="t('sportAddPlayer.formDescription')"
          :cancel-text="t('common.cancel')"
          :loading="isSubmitting"
          :disabled="isViewMode"
          :show-cancel="true"
          @submit="onSubmit"
          @cancel="goBackToPlayers"
        >
          <AddPlayerFormFields
            :profile-image-preview="profileImagePreview"
            :name="form.name"
            :phone="form.phone"
            :gender="form.gender"
            :team="form.team"
            :division="form.division"
            :jersey-number="form.jerseyNumber"
            :age="form.age"
            :status="form.status"
            :matches-played="form.matchesPlayed"
            :goals-scored="form.goalsScored"
            :height-cm="form.heightCm"
            :weight-kg="form.weightKg"
            :preferred-foot="form.preferredFoot"
            :blood-type="form.bloodType"
            :village="form.village"
            :commune="form.commune"
            :district="form.district"
            :province="form.province"
            :current-school="form.currentSchool"
            :grade-year="form.gradeYear"
            :primary-position="form.primaryPosition"
            :registration-status="form.registrationStatus"
            :team-options="teamOptions"
            :division-options="divisionOptions"
            :position-options="positionOptions"
            :status-options="statusOptions"
            :preferred-foot-options="preferredFootOptions"
            :blood-type-options="bloodTypeOptions"
            :registration-status-options="registrationStatusOptions"
            :is-locked="isFormLocked"
            :status-label="getPlayerStatusLabel"
            @profile-image-change="onProfileImageChange"
            @profile-image-remove="removeProfileImage"
            @update:name="form.name = $event"
            @update:phone="form.phone = $event"
            @update:gender="form.gender = $event"
            @update:team="form.team = $event"
            @update:division="form.division = $event"
            @update:jerseyNumber="form.jerseyNumber = $event"
            @update:age="form.age = $event"
            @update:status="form.status = $event"
            @update:matchesPlayed="form.matchesPlayed = $event"
            @update:goalsScored="form.goalsScored = $event"
            @update:heightCm="form.heightCm = $event"
            @update:weightKg="form.weightKg = $event"
            @update:preferredFoot="form.preferredFoot = $event"
            @update:bloodType="form.bloodType = $event"
            @update:village="form.village = $event"
            @update:commune="form.commune = $event"
            @update:district="form.district = $event"
            @update:province="form.province = $event"
            @update:currentSchool="form.currentSchool = $event"
            @update:gradeYear="form.gradeYear = $event"
            @update:primaryPosition="form.primaryPosition = $event"
            @update:registrationStatus="form.registrationStatus = $event"
          />

          <template #actions>
            <AddPlayerFormActions
              :is-submitting="isSubmitting"
              :is-view-mode="isViewMode"
              :is-edit-mode="isEditMode"
              @edit="goToEditMode"
              @cancel="goBackToPlayers"
            />
          </template>
        </Form>

        <div class="add-player-page__rail">
          <PlayerChecklist
            :title="t('sportAddPlayer.sidebarTitle')"
            :description="t('sportAddPlayer.sidebarText')"
            :items="checklistItems"
            :highlight-label="checklistHighlightLabel"
            :highlight-value="checklistHighlightValue"
          />
        </div>
      </div>
    </section>

    <AlertError
      :show="showError"
      :title="t('sportAddPlayer.validationError')"
      :message="errorMessage"
      :button-text="t('common.close')"
      @close="onErrorClose"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="isEditMode ? t('sportAddPlayer.playerUpdated') : t('sportAddPlayer.playerCreated')"
      :message="isEditMode ? t('sportAddPlayer.updatedMessage') : t('sportAddPlayer.createdMessage')"
      :button-text="t('sportAddPlayer.backToPlayers')"
      @close="onSuccessClose"
    />

  </MainLayout>
</template>

<style scoped>
.add-player-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.add-player-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.95fr);
  gap: 1rem;
  align-items: start;
}

.add-player-page__rail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 1rem;
}

.add-player-page--kh :deep(form header h3),
.add-player-page--kh :deep(form header p),
.add-player-page--kh :deep(.p-dialog-content),
.add-player-page--kh :deep(.p-dialog-footer),
.add-player-page--kh :deep(label) {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.add-player-page--kh :deep(form header p),
.add-player-page--kh :deep(.p-dialog-content p) {
  line-height: 1.7;
}

@media (max-width: 1024px) {
  .add-player-page__layout {
    grid-template-columns: 1fr;
  }

  .add-player-page__rail {
    position: static;
  }
}
</style>
