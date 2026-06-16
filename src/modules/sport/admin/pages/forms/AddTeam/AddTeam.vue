<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Form from '@/components/forms/Form.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import { useLanguage } from '@/composables/useLanguage'
import AddAdminProfileImageField from '@/modules/super-admin/components/admin-management/AddAdminProfileImageField.vue'
import {
  createSportTeam,
  fetchSportTeam,
  fetchSportTeams,
  updateSportTeam,
} from '@/modules/sport/services/sportApi'
import AddTeamIntro from '@/modules/sport/admin/components/add-team/AddTeamIntro.vue'
import AddTeamFormFields from '@/modules/sport/admin/components/add-team/AddTeamFormFields.vue'
import AddTeamFormActions from '@/modules/sport/admin/components/add-team/AddTeamFormActions.vue'
import AdminSummaryCards from '@/modules/super-admin/components/admin-management/AdminSummaryCards.vue'
import AdminChecklistPanel from '@/modules/super-admin/components/admin-management/AdminChecklistPanel.vue'
import { useTeamLogo } from './composables/useTeamLogo'
import {
  teamStatusLabel,
  validateForm,
  getFormPayload,
  initializeFormFromTeam,
  getLogoPreview,
} from './utils/addTeamHelpers'
import {
  TEAMS_DIRECTORY_PATH,
  STATUS_OPTIONS,
} from './constants/addTeamConstants'

defineOptions({
  name: 'SportAdminAddTeamPage',
})

const router = useRouter()
const route = useRoute()
const { t, language } = useLanguage()

const {
  logoPreview,
  handleLogoChange: handleLogoChangeComposable,
  removeLogo: removeLogoComposable,
  setLogoPreview,
} = useTeamLogo(t)

const teamRows = ref([])
const divisions = ref([])
const coaches = ref([])

const divisionOptions = computed(() => {
  if (!Array.isArray(divisions.value)) return []
  return divisions.value
    .filter((div) => div?.status === 'active' && div?.name)
    .map((div) => div.name)
    .filter(Boolean)
    .sort()
})

const coachOptions = computed(() => {
  if (!Array.isArray(coaches.value)) return []
  return coaches.value
    .filter((coach) => coach?.status === 'active' && coach?.user)
    .map((coach) => coach.user)
    .filter(Boolean)
    .sort()
})

const form = reactive({
  name: '',
  division: '',
  coach: '',
  captain: '',
  players: 0,
  matches: 0,
  venue: '',
  status: STATUS_OPTIONS[0],
  wins: 0,
  draws: 0,
  losses: 0,
  logo: null,
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)

const mode = computed(() => {
  if (route.query.mode === 'view') return 'view'
  if (route.query.mode === 'edit' || Boolean(route.query.id)) return 'edit'
  return 'add'
})
const isViewMode = computed(() => mode.value === 'view')
const isEditMode = computed(() => mode.value === 'edit')
const isAddMode = computed(() => mode.value === 'add')
const isFormLocked = computed(() => isSubmitting.value || isViewMode.value)
const isKh = computed(() => language.value === 'KH')
const points = computed(() => Math.max(form.wins, 0) * 3 + Math.max(form.draws, 0))
const statusOptions = STATUS_OPTIONS

function getStatusLabel(status) {
  return teamStatusLabel(status, t)
}

function resetFeedback() {
  errorMessage.value = ''
  showError.value = false
}

const pageTitle = computed(() => {
  if (isViewMode.value) return t('sportAddTeam.viewTitle')
  if (isEditMode.value) return t('sportAddTeam.updateTitle')
  return t('sportAddTeam.title')
})

const pageSubtitle = computed(() => {
  if (isViewMode.value) return t('sportAddTeam.viewSubtitle')
  if (isEditMode.value) return t('sportAddTeam.updateSubtitle')
  return t('sportAddTeam.summary')
})

const selectedDivisionLabel = computed(() => form.division || t('sportAddTeam.noDivisionSelected'))

const formSummaryCards = computed(() => [
  {
    id: 'team-division',
    title: t('sportAddTeam.divisionOverview'),
    value: selectedDivisionLabel.value,
    label: t('sportAddTeam.teamTrack'),
    status: 'info',
    statusLabel: getStatusLabel('info'),
    surfaceClass: 'bg-cyan-50/80 border-cyan-200',
  },
  {
    id: 'team-roster',
    title: t('sportAddTeam.players'),
    value: form.players,
    label: form.players ? t('sportAddTeam.rosterReady') : t('sportAddTeam.rosterPending'),
    status: form.players ? 'success' : 'warning',
    statusLabel: getStatusLabel(form.players ? 'success' : 'warning'),
    surfaceClass: 'bg-lime-50/80 border-lime-200',
  },
  {
    id: 'team-record',
    title: t('sportAddTeam.pointsPreview'),
    value: points.value,
    label: `${form.wins}-${form.draws}-${form.losses}`,
    status: 'info',
    statusLabel: getStatusLabel('info'),
    surfaceClass: 'bg-amber-50/80 border-amber-200',
  },
  {
    id: 'team-status',
    title: t('sportAddTeam.status'),
    value: getStatusLabel(form.status),
    label: form.venue.trim() ? form.venue : t('sportAddTeam.venuePending'),
    status: form.status,
    statusLabel: getStatusLabel(form.status),
    surfaceClass: 'bg-rose-50/80 border-rose-200',
  },
])

const checklistItems = computed(() => [
  {
    title: t('sportAddTeam.sidebarItems.identity'),
    text: t('sportAddTeam.sidebarItems.identityDetail'),
  },
  {
    title: t('sportAddTeam.sidebarItems.staffing'),
    text: t('sportAddTeam.sidebarItems.staffingDetail'),
  },
  {
    title: t('sportAddTeam.sidebarItems.roster'),
    text: t('sportAddTeam.sidebarItems.rosterDetail'),
  },
  {
    title: t('sportAddTeam.sidebarItems.review'),
    text: t('sportAddTeam.sidebarItems.reviewDetail'),
  },
])

async function onLogoChange(event) {
  const error = await handleLogoChangeComposable(event, form, isFormLocked.value)
  if (error) {
    errorMessage.value = error
    showError.value = true
  }
}

function removeLogo() {
  removeLogoComposable(form, isFormLocked.value)
}

async function goBackToTeams() {
  await router.push(TEAMS_DIRECTORY_PATH)
}

async function goToEditMode() {
  const id = String(route.query.id || '').trim()
  if (!id) return
  await router.push({ path: '/module/sport-admin/teams/add', query: { mode: 'edit', id } })
}

async function onSubmit() {
  if (isViewMode.value) return

  resetFeedback()
  const validationError = validateForm(form, t)
  if (validationError) {
    errorMessage.value = validationError
    showError.value = true
    return
  }

  isSubmitting.value = true
  try {
    const payload = getFormPayload(form)

    if (isEditMode.value && route.query.id) {
      await updateSportTeam(route.query.id, payload)
    } else {
      await createSportTeam(payload)
    }
    showSuccess.value = true
  } catch {
    errorMessage.value = isEditMode.value
      ? t('sportAddTeam.validation.updateFailed')
      : t('sportAddTeam.validation.createFailed')
    showError.value = true
  } finally {
    isSubmitting.value = false
  }
}

function onErrorClose() {
  showError.value = false
}

async function onSuccessClose() {
  showSuccess.value = false
  await goBackToTeams()
}

onMounted(async () => {
  try {
    // TODO: API endpoints not yet implemented on backend
    // Temporarily using empty data for UI testing
    const teamsResponse = await fetchSportTeams({ perPage: 100 })
    teamRows.value = teamsResponse.items || []
    divisions.value = []
    coaches.value = []
  } catch {
    teamRows.value = []
    divisions.value = []
    coaches.value = []
  }

  if (isAddMode.value) return

  const id = String(route.query.id || '').trim()
  if (!id) return

  try {
    const found = await fetchSportTeam(id)
    if (!found?.id) return
    initializeFormFromTeam(found, form, statusOptions, divisionOptions.value)
    setLogoPreview(getLogoPreview(found))
  } catch {
    // Handle error silently
  }
})
</script>

<template>
  <MainLayout>
    <section :class="isKh ? 'add-team-page add-team-page--kh' : 'add-team-page'">
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

      <AdminSummaryCards :cards="formSummaryCards" />

      <div class="add-team-page__layout">
        <Form
          class="add-team-page__form"
          :title="pageTitle"
          :description="t('sportAddTeam.formDescription')"
          :cancel-text="t('common.cancel')"
          :loading="isSubmitting"
          :disabled="isViewMode"
          :show-cancel="true"
          @submit="onSubmit"
          @cancel="goBackToTeams"
        >
          <AddTeamIntro
            :division-label="selectedDivisionLabel"
            :status-label="getStatusLabel(form.status)"
          />

          <AddAdminProfileImageField
            :title="t('sportAddTeam.logo')"
            :preview="logoPreview"
            :remove-label="t('sportAddTeam.removeLogo')"
            :disabled="isFormLocked"
            @change="onLogoChange"
            @remove="removeLogo"
          />

          <AddTeamFormFields
            :name="form.name"
            :division="form.division"
            :coach="form.coach"
            :captain="form.captain"
            :players="form.players"
            :matches="form.matches"
            :venue="form.venue"
            :status="form.status"
            :wins="form.wins"
            :draws="form.draws"
            :losses="form.losses"
            :points="points"
            :division-options="divisionOptions"
            :coach-options="coachOptions"
            :status-options="statusOptions"
            :is-locked="isFormLocked"
            :status-label="getStatusLabel"
            @update:name="form.name = $event"
            @update:division="form.division = $event"
            @update:coach="form.coach = $event"
            @update:captain="form.captain = $event"
            @update:players="form.players = $event"
            @update:matches="form.matches = $event"
            @update:venue="form.venue = $event"
            @update:status="form.status = $event"
            @update:wins="form.wins = $event"
            @update:draws="form.draws = $event"
            @update:losses="form.losses = $event"
          />

          <template #actions>
            <AddTeamFormActions
              :is-submitting="isSubmitting"
              :is-view-mode="isViewMode"
              :is-edit-mode="isEditMode"
              @edit="goToEditMode"
              @cancel="goBackToTeams"
            />
          </template>
        </Form>

        <div class="add-team-page__rail">
          <AdminChecklistPanel
            :title="t('sportAddTeam.sidebarTitle')"
            :description="t('sportAddTeam.sidebarText')"
            :items="checklistItems"
            :highlight-label="t('sportAddTeam.pointsPreview')"
            :highlight-value="String(points)"
          />
        </div>
      </div>
    </section>

    <AlertError
      :show="showError"
      :title="t('sportAddTeam.validationError')"
      :message="errorMessage"
      :button-text="t('common.close')"
      @close="onErrorClose"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="isEditMode ? t('sportAddTeam.teamUpdated') : t('sportAddTeam.teamCreated')"
      :message="isEditMode ? t('sportAddTeam.updatedMessage') : t('sportAddTeam.createdMessage')"
      :button-text="t('sportAddTeam.backToTeams')"
      @close="onSuccessClose"
    />
  </MainLayout>
</template>

<style scoped>
.add-team-page {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.add-team-page__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.95fr);
  gap: 1rem;
  align-items: start;
}

.add-team-page__form {
  display: block;
}

.add-team-page__rail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 1rem;
}

.add-team-page--kh :deep(.admin-checklist-panel .p-card-title),
.add-team-page--kh :deep(.admin-checklist-panel .p-card-content),
.add-team-page--kh :deep(form header h3),
.add-team-page--kh :deep(form header p),
.add-team-page--kh :deep(.p-dialog-content),
.add-team-page--kh :deep(.p-dialog-footer) {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.add-team-page--kh :deep(form header p),
.add-team-page--kh :deep(.admin-checklist-panel .p-card-content p),
.add-team-page--kh :deep(.p-dialog-content p) {
  line-height: 1.7;
}

@media (max-width: 1120px) {
  .add-team-page__layout {
    grid-template-columns: 1fr;
  }

  .add-team-page__rail {
    position: static;
  }
}

</style>
