<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Form from '@/components/forms/Form.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import { useLanguage } from '@/composables/useLanguage'
import AddAdminProfileImageField from '@/modules/super-admin/components/admin-management/AddAdminProfileImageField.vue'
import teamsManagementData from '@/mocks/sport/teams-management-data.json'
import AddTeamIntro from '@/modules/sport/admin/components/add-team/AddTeamIntro.vue'
import AddTeamFormFields from '@/modules/sport/admin/components/add-team/AddTeamFormFields.vue'
import AddTeamFormActions from '@/modules/sport/admin/components/add-team/AddTeamFormActions.vue'
import AdminSummaryCards from '@/modules/super-admin/components/admin-management/AdminSummaryCards.vue'
import AdminChecklistPanel from '@/modules/super-admin/components/admin-management/AdminChecklistPanel.vue'

defineOptions({
  name: 'SportAdminAddTeamPage',
})

const router = useRouter()
const route = useRoute()
const { t, language } = useLanguage()

const teamDirectoryPath = '/module/sport-admin/teams'
const statusOptions = ['active', 'pending', 'inactive']
const allowedLogoImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const maxLogoImageSizeBytes = 2 * 1024 * 1024
const divisionOptions = Array.from(
  new Set(
    (Array.isArray(teamsManagementData) ? teamsManagementData : [])
      .map((item) => String(item?.division || '').trim())
      .filter(Boolean),
  ),
)

const form = reactive({
  name: '',
  division: divisionOptions[0] || '',
  coach: '',
  captain: '',
  players: 0,
  matches: 0,
  venue: '',
  status: statusOptions[0],
  wins: 0,
  draws: 0,
  losses: 0,
  logo: null,
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const logoPreview = ref('')
const logoObjectUrl = ref('')

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

function cleanupLogoObjectUrl() {
  if (!logoObjectUrl.value) return
  URL.revokeObjectURL(logoObjectUrl.value)
  logoObjectUrl.value = ''
}

function resetFeedback() {
  errorMessage.value = ''
  showError.value = false
}

function statusLabel(status) {
  const key = `common.status.${String(status || '').replace(/[\s-]+/g, '_').toLowerCase()}`
  const translated = t(key)
  return translated !== key ? translated : String(status || '')
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
    statusLabel: statusLabel('info'),
    surfaceClass: 'bg-cyan-50/80 border-cyan-200',
  },
  {
    id: 'team-roster',
    title: t('sportAddTeam.players'),
    value: form.players,
    label: form.players ? t('sportAddTeam.rosterReady') : t('sportAddTeam.rosterPending'),
    status: form.players ? 'success' : 'warning',
    statusLabel: statusLabel(form.players ? 'success' : 'warning'),
    surfaceClass: 'bg-lime-50/80 border-lime-200',
  },
  {
    id: 'team-record',
    title: t('sportAddTeam.pointsPreview'),
    value: points.value,
    label: `${form.wins}-${form.draws}-${form.losses}`,
    status: 'info',
    statusLabel: statusLabel('info'),
    surfaceClass: 'bg-amber-50/80 border-amber-200',
  },
  {
    id: 'team-status',
    title: t('sportAddTeam.status'),
    value: statusLabel(form.status),
    label: form.venue.trim() ? form.venue : t('sportAddTeam.venuePending'),
    status: form.status,
    statusLabel: statusLabel(form.status),
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

function validateForm() {
  if (!form.name.trim()) return t('sportAddTeam.validation.nameRequired')
  if (!form.division.trim()) return t('sportAddTeam.validation.divisionRequired')
  if (!form.coach.trim()) return t('sportAddTeam.validation.coachRequired')
  if (!form.captain.trim()) return t('sportAddTeam.validation.captainRequired')
  if (form.players <= 0) return t('sportAddTeam.validation.playersRequired')
  if (form.matches < 0) return t('sportAddTeam.validation.recordInvalid')
  if (!form.venue.trim()) return t('sportAddTeam.validation.venueRequired')
  if (!form.status) return t('sportAddTeam.validation.statusRequired')
  if (form.wins < 0 || form.draws < 0 || form.losses < 0) {
    return t('sportAddTeam.validation.recordInvalid')
  }
  return ''
}

function onLogoChange(event) {
  if (isFormLocked.value) return

  const [file] = event?.target?.files || []
  if (!file) return

  if (!allowedLogoImageTypes.includes(file.type)) {
    errorMessage.value = t('sportAddTeam.validation.logoType')
    showError.value = true
    return
  }

  if (file.size > maxLogoImageSizeBytes) {
    errorMessage.value = t('sportAddTeam.validation.logoSize')
    showError.value = true
    return
  }

  cleanupLogoObjectUrl()
  logoObjectUrl.value = URL.createObjectURL(file)
  logoPreview.value = logoObjectUrl.value
  form.logo = file
}

function removeLogo() {
  if (isFormLocked.value) return
  cleanupLogoObjectUrl()
  logoPreview.value = ''
  form.logo = null
}

async function goBackToTeams() {
  await router.push(teamDirectoryPath)
}

async function goToEditMode() {
  const id = String(route.query.id || '').trim()
  if (!id) return
  await router.push({ path: '/module/sport-admin/teams/add', query: { mode: 'edit', id } })
}

async function onSubmit() {
  if (isViewMode.value) return

  resetFeedback()
  const validationError = validateForm()
  if (validationError) {
    errorMessage.value = validationError
    showError.value = true
    return
  }

  isSubmitting.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 700))
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

function populateFromTeam(team) {
  form.name = team.name || ''
  form.division = team.division || divisionOptions[0] || ''
  form.coach = team.coach || ''
  form.captain = team.captain || ''
  form.players = Number(team.players || 0)
  form.matches = Number(team.matches || 0)
  form.venue = team.venue || ''

  const normalizedStatus = String(team.status || '')
  const matchedStatus = statusOptions.find(
    (status) => status.toLowerCase() === normalizedStatus.toLowerCase(),
  )
  form.status = matchedStatus || statusOptions[0]
  form.wins = Number(team.wins || 0)
  form.draws = Number(team.draws || 0)
  form.losses = Number(team.losses || 0)
  form.logo = null
  cleanupLogoObjectUrl()
  logoPreview.value = String(team.logo || '').trim()
}

onMounted(() => {
  if (isAddMode.value) return

  const id = String(route.query.id || '').trim()
  const found = (Array.isArray(teamsManagementData) ? teamsManagementData : []).find(
    (item) => String(item?.id || '') === id,
  )

  if (!found) return
  populateFromTeam(found)
})

onBeforeUnmount(() => {
  cleanupLogoObjectUrl()
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
            :status-label="statusLabel(form.status)"
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
            :status-options="statusOptions"
            :is-locked="isFormLocked"
            :status-label="statusLabel"
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
              @back="goBackToTeams"
              @edit="goToEditMode"
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
