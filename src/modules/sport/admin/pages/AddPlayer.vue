<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Form from '@/components/forms/Form.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import { useLanguage } from '@/composables/useLanguage'
import teamsManagementData from '@/mocks/sport/teams-management-data.json'
import playersManagementData from '@/mocks/sport/players-management-data.json'
import AddPlayerFormFields from '@/modules/sport/admin/components/add-player/AddPlayerFormFields.vue'
import AddPlayerFormActions from '@/modules/sport/admin/components/add-player/AddPlayerFormActions.vue'
import ParentGuardianInformation from '@/modules/sport/admin/components/add-player/ParentGuardianInformation.vue'
import DocumentsContractsUpload from '@/modules/sport/admin/components/add-player/DocumentsContractsUpload.vue'

defineOptions({
  name: 'SportAdminAddPlayerPage',
})

const router = useRouter()
const route = useRoute()
const { t, language, te } = useLanguage()

const playersDirectoryPath = '/module/sport-admin/players'
const statusOptions = ['active', 'pending', 'inactive', 'suspended']
// Keep these aligned with the shared upload field accept types.
const allowedProfileImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const maxProfileImageSizeBytes = 2 * 1024 * 1024
// Sports profile/admin status fields (separate from the "record status" used by the table).
const registrationStatusOptions = ['registered', 'pending', 'unregistered']

const form = reactive({
  name: '',
  phone: '',
  gender: '',
  team: '',
  division: '',
  jerseyNumber: null,
  age: null,
  status: statusOptions[0],
  matchesPlayed: 0,
  goalsScored: 0,
  profileImage: null,
  // Personal information (player record data, not tied to system users).
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

  // Sports profile & status (domain data, not system user fields).
  primaryPosition: '',
  registrationStatus: registrationStatusOptions[0],
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
const showError = ref(false)
const isKh = computed(() => language.value === 'KH')
const profileImagePreview = ref('')
const profileImageObjectUrl = ref('')

const isDeleteOpen = ref(false)
const isDeleting = ref(false)

const mode = computed(() => {
  if (route.query.mode === 'view') return 'view'
  if (route.query.mode === 'edit' || Boolean(route.query.id)) return 'edit'
  return 'add'
})
const isViewMode = computed(() => mode.value === 'view')
const isEditMode = computed(() => mode.value === 'edit')
const isAddMode = computed(() => mode.value === 'add')
const isFormLocked = computed(() => isSubmitting.value || isViewMode.value)

// Build select options from sport team data first; fall back to player mock data if needed.
const teamOptions = computed(() => {
  const fromTeams = (Array.isArray(teamsManagementData) ? teamsManagementData : [])
    .map((item) => String(item?.name || '').trim())
    .filter(Boolean)
  const fromPlayers = (Array.isArray(playersManagementData) ? playersManagementData : [])
    .map((item) => String(item?.team || '').trim())
    .filter(Boolean)
  return [...new Set([...fromTeams, ...fromPlayers])].sort()
})

const divisionOptions = computed(() => {
  const fromTeams = (Array.isArray(teamsManagementData) ? teamsManagementData : [])
    .map((item) => String(item?.division || '').trim())
    .filter(Boolean)
  const fromPlayers = (Array.isArray(playersManagementData) ? playersManagementData : [])
    .map((item) => String(item?.division || '').trim())
    .filter(Boolean)
  return [...new Set([...fromTeams, ...fromPlayers])].sort()
})

// Positions belong to the player record (data), so we derive a stable set of options from the mock dataset.
const positionOptions = computed(() => {
  const fromPlayers = (Array.isArray(playersManagementData) ? playersManagementData : [])
    // Position was refactored into Primary Position; keep a fallback for older mock records.
    .map((item) => String(item?.primaryPosition || item?.position || '').trim())
    .filter(Boolean)
  return [...new Set(fromPlayers)].sort()
})

// Keep these small and stable; can be moved to constants / fetched from API later.
const preferredFootOptions = ['Right', 'Left', 'Both']
const bloodTypeOptions = ['A', 'B', 'AB', 'O']

function playerStatusLabel(status) {
  const key = `sportPlayerInformation.status.${String(status || '').replace(/[\s-]+/g, '_').toLowerCase()}`
  return te(key) ? t(key) : String(status || '')
}

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

function resetFeedback() {
  errorMessage.value = ''
  showError.value = false
}

function cleanupProfileImageObjectUrl() {
  if (!profileImageObjectUrl.value) return
  URL.revokeObjectURL(profileImageObjectUrl.value)
  profileImageObjectUrl.value = ''
}

function onProfileImageChange(event) {
  if (isFormLocked.value) return

  const [file] = event?.target?.files || []
  if (!file) return

  // Basic client-side guardrails; actual enforcement should be done again on the backend.
  if (!allowedProfileImageTypes.includes(file.type)) {
    errorMessage.value = t('sportAddPlayer.validation.imageType')
    showError.value = true
    return
  }

  if (file.size > maxProfileImageSizeBytes) {
    errorMessage.value = t('sportAddPlayer.validation.imageSize')
    showError.value = true
    return
  }

  cleanupProfileImageObjectUrl()
  profileImageObjectUrl.value = URL.createObjectURL(file)
  profileImagePreview.value = profileImageObjectUrl.value
  form.profileImage = file
}

function removeProfileImage() {
  if (isFormLocked.value) return
  cleanupProfileImageObjectUrl()
  profileImagePreview.value = ''
  form.profileImage = null
}

function validate() {
  if (!form.name.trim()) return t('sportAddPlayer.validation.nameRequired')
  if (!form.team.trim()) return t('sportAddPlayer.validation.teamRequired')
  if (!form.division.trim()) return t('sportAddPlayer.validation.divisionRequired')
  if (!form.status) return t('sportAddPlayer.validation.statusRequired')
  if (Number(form.matchesPlayed) < 0) return t('sportAddPlayer.validation.statsInvalid')
  if (Number(form.goalsScored) < 0) return t('sportAddPlayer.validation.statsInvalid')
  if (Number(form.goalsScored) > Number(form.matchesPlayed)) return t('sportAddPlayer.validation.goalsTooHigh')
  return ''
}

async function goBackToPlayers() {
  await router.push(playersDirectoryPath)
}

function goToEditMode() {
  const id = String(route.query.id || '').trim()
  if (!id) return
  router.replace({ query: { ...route.query, mode: 'edit' } })
}

function onDelete() {
  const id = String(route.query.id || '').trim()
  if (!id) return
  // Confirm destructive actions before handing off the delete to the list page.
  isDeleteOpen.value = true
}

async function onSubmit() {
  resetFeedback()
  const message = validate()
  if (message) {
    errorMessage.value = message
    showError.value = true
    return
  }

  // No persistence yet: this page defines the future API contract only.
  isSubmitting.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 450))
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

function onCancelDelete() {
  isDeleteOpen.value = false
}

function onConfirmDelete() {
  if (isDeleting.value) return
  isDeleting.value = true

  const id = String(route.query.id || '').trim()
  if (!id) {
    isDeleting.value = false
    return onCancelDelete()
  }
  // No persistence yet: deletion is applied by the list page via query handoff.
  router.push({ path: playersDirectoryPath, query: { delete: id } })
}

onMounted(() => {
  // Pre-fill from query id when present (supports future view/edit modes).
  const id = String(route.query.id || '').trim()
  if (!id) return

  const found = (Array.isArray(playersManagementData) ? playersManagementData : []).find(
    (item) => String(item?.id || '') === id,
  )
  if (!found) return

  form.name = String(found.name || '')
  form.phone = String(found.phone || '')
  form.gender = String(found.gender || '')
  // When mock/API provides an image URL, allow read-only preview in view/edit modes.
  profileImagePreview.value = String(found.profileImage || found.avatar || found.photo || '').trim()
  form.team = String(found.team || '')
  form.division = String(found.division || '')
  form.jerseyNumber = found.jerseyNumber ?? null
  form.age = found.age ?? null
  form.status = String(found.status || statusOptions[0])
  form.matchesPlayed = Number(found.matchesPlayed ?? 0)
  form.goalsScored = Number(found.goalsScored ?? 0)

  // Personal information is optional in the mock dataset, so default safely.
  form.heightCm = found.heightCm ?? null
  form.weightKg = found.weightKg ?? null
  form.preferredFoot = String(found.preferredFoot || '')
  form.bloodType = String(found.bloodType || '')
  form.village = String(found.village || '')
  form.commune = String(found.commune || '')
  form.district = String(found.district || '')
  form.province = String(found.province || '')
  form.currentSchool = String(found.currentSchool || '')
  form.gradeYear = String(found.gradeYear || '')

  form.primaryPosition = String(found.primaryPosition || found.position || '')
  form.registrationStatus = String(found.registrationStatus || registrationStatusOptions[0])
})

onBeforeUnmount(() => {
  cleanupProfileImageObjectUrl()
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
            :status-label="playerStatusLabel"
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

          <!-- UI-only section: parent/guardian details (no backend persistence yet). -->
          <div class="mt-6">
            <ParentGuardianInformation />
          </div>

          <!-- UI-only section: documents upload (mock drag/drop, no backend persistence yet). -->
          <div class="mt-6">
            <DocumentsContractsUpload />
          </div>

          <template #actions>
            <AddPlayerFormActions
              :is-submitting="isSubmitting"
              :is-view-mode="isViewMode"
              :is-edit-mode="isEditMode"
              :can-delete="!isAddMode && Boolean(route.query.id)"
              @back="goBackToPlayers"
              @edit="goToEditMode"
              @delete="onDelete"
            />
          </template>
        </Form>
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

    <AlertQuestion
      :show="isDeleteOpen"
      :loading="isDeleting"
      :title="t('sportAddPlayer.confirm.deleteTitle')"
      :message="t('sportAddPlayer.confirm.deleteMessage', {
        name: form.name?.trim() || t('sportAddPlayer.confirm.defaultName'),
      })"
      :confirm-text="t('common.delete')"
      :cancel-text="t('common.cancel')"
      type="danger"
      @confirm="onConfirmDelete"
      @cancel="onCancelDelete"
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
  grid-template-columns: minmax(0, 1fr);
  gap: 1rem;
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
</style>
