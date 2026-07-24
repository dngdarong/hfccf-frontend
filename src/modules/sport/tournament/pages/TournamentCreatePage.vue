<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from '@/components/buttons/Button.vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import MainLayout from '@/layouts/MainLayout.vue'
import Form from '@/components/forms/Form.vue'
import AlertError from '@/components/alerts/AlertError.vue'
import AlertSuccess from '@/components/alerts/AlertSuccess.vue'
import { useLanguage } from '@/composables/useLanguage'
import { optimizeImageFile } from '@/utils/imageOptimization'
import TournamentFormSection from '@/modules/sport/tournament/components/setup/TournamentFormSection.vue'
import TournamentMediaField from '@/modules/sport/tournament/components/setup/TournamentMediaField.vue'
import TournamentStatusBadge from '@/modules/sport/tournament/components/shared/TournamentStatusBadge.vue'
import {
  TOURNAMENT_REGISTRATION_STATUSES,
  TOURNAMENT_SPORT_TYPES,
  TOURNAMENT_VISIBILITY_OPTIONS,
} from '@/modules/sport/tournament/constants/tournamentStates'
import {
  canEditTournamentConfiguration,
  normalizeTournamentState,
} from '@/modules/sport/tournament/composables/useTournamentStateMachine'
import { useTournamentCrudCatalog } from '@/modules/sport/tournament/composables/useTournamentCrudCatalog'

defineOptions({
  name: 'SportTournamentCreatePage',
})

const router = useRouter()
const route = useRoute()
const { t } = useLanguage()
const { getTournamentById, loadTournament, createTournament, updateTournament, isLoading } = useTournamentCrudCatalog()

const draftFactory = () => ({
  id: '', name: '', season: '', sportType: 'football', description: '', logo: '', banner: '', location: '', organizer: '',
  registrationOpenAt: '', registrationCloseAt: '', startAt: '', endAt: '', state: 'draft', registrationStatus: 'closed', visibility: 'private',
  rules: {}, settings: {}, statistics: {}, teams: [],
})
const form = reactive(draftFactory())
const tournamentId = computed(() => String(route.params.id || '').trim())
const isEditMode = computed(() => route.name === 'dashboard-sport-admin-tournaments-edit')

const isSubmitting = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const logoPreview = ref('')
const bannerPreview = ref('')
const logoObjectUrl = ref('')
const bannerObjectUrl = ref('')
const hasLoadedTournament = ref(!isEditMode.value)
const currentStep = ref(0)

const formSteps = [
  { id: 0, title: 'Basic Info', icon: '📋', description: 'Tournament name, type, and description' },
  { id: 1, title: 'Schedule', icon: '📅', description: 'Registration and tournament dates' },
  { id: 2, title: 'Rules', icon: '⚽', description: 'Points, structure, and match settings' },
  { id: 3, title: 'Settings', icon: '⚙️', description: 'Registration and visibility options' },
  { id: 4, title: 'Media', icon: '🖼️', description: 'Logo and banner uploads' },
]

const canProceedToStep = computed(() => {
  if (currentStep.value === 0) return form.name.trim() && form.season.trim() && form.sportType.trim()
  if (currentStep.value === 1) return form.registrationOpenAt && form.registrationCloseAt && form.startAt && form.endAt
  if (currentStep.value === 2) return form.rules.groupCount && form.rules.teamsPerGroup
  return true
})
const currentTournament = computed(() =>
  tournamentId.value ? getTournamentById(tournamentId.value) : null,
)
const loadingTournament = computed(() => isEditMode.value && isLoading.value && !hasLoadedTournament.value)
const showNotFound = computed(() => isEditMode.value && hasLoadedTournament.value && !currentTournament.value?.id)
const isLockedState = computed(
  () => isEditMode.value && currentTournament.value && !canEditTournamentConfiguration(currentTournament.value.state),
)
const isReadOnly = computed(() => isSubmitting.value || isLockedState.value)

const pageTitle = computed(() =>
  showNotFound.value
    ? t('sportTournament.create.validation.notFoundTitle')
    : isEditMode.value
      ? t('sportTournament.create.editTitle')
      : t('sportTournament.create.title'),
)
const pageSubtitle = computed(() =>
  showNotFound.value
    ? t('sportTournament.create.validation.notFoundMessage')
    : isEditMode.value
      ? t('sportTournament.create.editSubtitle')
      : t('sportTournament.create.subtitle'),
)

const sportTypeOptions = computed(() =>
  TOURNAMENT_SPORT_TYPES.map((value) => ({
    label: t(`sportTournament.sportTypes.${value}`),
    value,
  })),
)
const visibilityOptions = computed(() =>
  TOURNAMENT_VISIBILITY_OPTIONS.map((value) => ({
    label: t(`sportTournament.visibility.${value}`),
    value,
  })),
)
const registrationStatusOptions = computed(() =>
  TOURNAMENT_REGISTRATION_STATUSES.map((value) => ({
    label: t(`sportTournament.registrationStatuses.${value}`),
    value,
  })),
)

function resolveOptionLabel(options, value) {
  const normalizedValue = String(value || '').trim()
  const match = options.find((option) => String(option?.value || '').trim() === normalizedValue)

  return match?.label || normalizedValue || '—'
}

function formatDisplayValue(value) {
  const normalizedValue = String(value || '').trim()

  if (!normalizedValue) return '—'

  return normalizedValue
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

const heroSummaryCards = computed(() => [
  {
    label: t('sportTournament.create.fields.state'),
    value: formatDisplayValue(form.state),
  },
  {
    label: t('sportTournament.create.fields.season'),
    value: String(form.season || '—').trim() || '—',
  },
  {
    label: t('sportTournament.create.fields.sportType'),
    value: resolveOptionLabel(sportTypeOptions.value, form.sportType),
  },
  {
    label: t('sportTournament.create.fields.registrationStatus'),
    value: resolveOptionLabel(registrationStatusOptions.value, form.registrationStatus),
  },
  {
    label: t('sportTournament.create.fields.visibility'),
    value: resolveOptionLabel(visibilityOptions.value, form.visibility),
  },
])

function cleanupObjectUrl(refValue) {
  if (!refValue.value) return
  URL.revokeObjectURL(refValue.value)
  refValue.value = ''
}

function resetForm(tournament = null) {
  cleanupObjectUrl(logoObjectUrl)
  cleanupObjectUrl(bannerObjectUrl)

  const base = draftFactory()
  Object.assign(form, base)

  if (!tournament) {
    logoPreview.value = ''
    bannerPreview.value = ''
    return
  }

  form.id = String(tournament.id || '')
  form.name = String(tournament.name || '')
  form.season = String(tournament.season || '')
  form.sportType = String(tournament.sportType || base.sportType)
  form.description = String(tournament.description || '')
  form.logo = String(tournament.logoPath || tournament.logo || '')
  form.banner = String(tournament.bannerPath || tournament.banner || '')
  form.location = String(tournament.location || '')
  form.organizer = String(tournament.organizer || '')
  form.registrationOpenAt = String(tournament.registrationOpenAt || '')
  form.registrationCloseAt = String(tournament.registrationCloseAt || '')
  form.startAt = String(tournament.startAt || '')
  form.endAt = String(tournament.endAt || '')
  form.state = normalizeTournamentState(tournament.state || base.state)
  form.registrationStatus = String(tournament.registrationStatus || base.registrationStatus)
  form.visibility = String(tournament.visibility || base.visibility)
  form.rules = {
    ...base.rules,
    ...tournament.rules,
  }
  form.statistics = {
    ...base.statistics,
    ...tournament.statistics,
  }
  form.teams = Array.isArray(tournament.teams) ? tournament.teams.map((team) => ({ ...team })) : []

  logoPreview.value = String(tournament.logoUrl || tournament.logo || '')
  bannerPreview.value = String(tournament.bannerUrl || tournament.banner || '')
}

watch(
  currentTournament,
  (value) => {
    resetForm(value)
  },
  { immediate: true },
)

async function handleImageChange(field, event, size = { maxWidth: 1200, maxHeight: 720, quality: 0.84 }) {
  if (isReadOnly.value) return

  const [file] = event?.target?.files || []
  if (!file) return

  const optimized = await optimizeImageFile(file, size).catch(() => file)
  const objectUrl = URL.createObjectURL(optimized)

  if (field === 'logo') {
    cleanupObjectUrl(logoObjectUrl)
    logoObjectUrl.value = objectUrl
    logoPreview.value = objectUrl
    form.logo = objectUrl
    return
  }

  cleanupObjectUrl(bannerObjectUrl)
  bannerObjectUrl.value = objectUrl
  bannerPreview.value = objectUrl
  form.banner = objectUrl
}

function handleImageRemove(field) {
  if (isReadOnly.value) return

  if (field === 'logo') {
    cleanupObjectUrl(logoObjectUrl)
    logoPreview.value = ''
    form.logo = ''
    return
  }

  cleanupObjectUrl(bannerObjectUrl)
  bannerPreview.value = ''
  form.banner = ''
}

function validateForm() {
  if (!form.name.trim()) return t('sportTournament.create.validation.nameRequired')
  if (!form.season.trim()) return t('sportTournament.create.validation.seasonRequired')
  if (!form.sportType.trim()) return t('sportTournament.create.validation.sportTypeRequired')
  if (!form.description.trim()) return t('sportTournament.create.validation.descriptionRequired')
  if (!form.location.trim()) return t('sportTournament.create.validation.locationRequired')
  if (!form.organizer.trim()) return t('sportTournament.create.validation.organizerRequired')
  if (!form.registrationOpenAt.trim()) return t('sportTournament.create.validation.registrationOpenAtRequired')
  if (!form.registrationCloseAt.trim()) return t('sportTournament.create.validation.registrationCloseAtRequired')
  if (!form.startAt.trim()) return t('sportTournament.create.validation.startAtRequired')
  if (!form.endAt.trim()) return t('sportTournament.create.validation.endAtRequired')
  if (form.registrationOpenAt > form.registrationCloseAt) {
    return t('sportTournament.create.validation.dateOrderInvalid')
  }
  if (form.startAt > form.endAt) {
    return t('sportTournament.create.validation.dateOrderInvalid')
  }
  if (Number(form.rules.groupCount) < 1) {
    return t('sportTournament.create.validation.groupCountRequired')
  }
  if (Number(form.rules.teamsPerGroup) < 1) {
    return t('sportTournament.create.validation.teamsPerGroupRequired')
  }
  return ''
}

function buildPayload() {
  return {
    ...draftFactory(),
    id: form.id,
    name: String(form.name || '').trim(),
    season: String(form.season || '').trim(),
    sportType: String(form.sportType || '').trim(),
    description: String(form.description || '').trim(),
    logo: String(form.logo || '').trim(),
    banner: String(form.banner || '').trim(),
    location: String(form.location || '').trim(),
    organizer: String(form.organizer || '').trim(),
    registrationOpenAt: String(form.registrationOpenAt || '').trim(),
    registrationCloseAt: String(form.registrationCloseAt || '').trim(),
    startAt: String(form.startAt || '').trim(),
    endAt: String(form.endAt || '').trim(),
    state: normalizeTournamentState(form.state || 'draft'),
    registrationStatus: String(form.registrationStatus || 'closed').trim(),
    visibility: String(form.visibility || 'private').trim(),
    rules: {
      ...draftFactory().rules,
      ...form.rules,
    },
    statistics: {
      ...draftFactory().statistics,
      ...form.statistics,
    },
    teams: Array.isArray(form.teams) ? form.teams.map((team) => ({ ...team })) : [],
  }
}

async function onSubmit() {
  if (isReadOnly.value) return
  if (showNotFound.value) return

  const validationError = validateForm()
  if (validationError) {
    errorMessage.value = validationError
    showError.value = true
    return
  }

  isSubmitting.value = true

  try {
    const payload = buildPayload()
    const record = isEditMode.value && payload.id ? updateTournament(payload.id, payload) : createTournament(payload)
    if (!record?.id) {
      throw new Error('Tournament save failed')
    }
    form.id = record.id
    showSuccess.value = true
  } catch {
    errorMessage.value = t('sportTournament.create.validation.saveFailed')
    showError.value = true
  } finally {
    isSubmitting.value = false
  }
}

async function goBack() {
  await router.push({ name: 'dashboard-sport-admin-tournaments' })
}

async function goToDetail() {
  const id = String(form.id || tournamentId.value || '').trim()
  if (!id) return goBack()

  await router.push({ name: 'dashboard-sport-admin-tournaments-detail', params: { id } })
}

function onSuccessClose() {
  showSuccess.value = false
  void goToDetail()
}

function onErrorClose() {
  showError.value = false
}

function goToNextStep() {
  if (canProceedToStep.value && currentStep.value < formSteps.length - 1) {
    currentStep.value++
  }
}

function goToPreviousStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function goToStep(stepId) {
  if (stepId < currentStep.value || canProceedToStep.value) {
    currentStep.value = stepId
  }
}

onMounted(() => {
  if (!isEditMode.value) {
    hasLoadedTournament.value = true
    return
  }

  void (async () => {
    try {
      await loadTournament(tournamentId.value)
    } catch {
      errorMessage.value = t('sportTournament.create.validation.saveFailed')
      showError.value = true
    } finally {
      hasLoadedTournament.value = true
    }
  })()
})

onBeforeUnmount(() => {
  cleanupObjectUrl(logoObjectUrl)
  cleanupObjectUrl(bannerObjectUrl)
})
</script>

<template>
  <MainLayout>
    <section class="sport-tournament-form">
      <div v-if="loadingTournament" class="sport-tournament-form__empty">
        <div class="sport-tournament-form__empty-card">
          <h3>{{ t('common.loading') }}</h3>
        </div>
      </div>

      <div v-else-if="showNotFound" class="sport-tournament-form__empty">
        <div class="sport-tournament-form__empty-card">
          <h3>{{ t('sportTournament.create.validation.notFoundTitle') }}</h3>
          <p>{{ t('sportTournament.create.validation.notFoundMessage') }}</p>
          <Button
            type="button"
            class="rounded-xl"
            :label="t('sportTournament.create.actions.backToTournaments')"
            @click="goBack"
          />
        </div>
      </div>

      <div v-else class="sport-tournament-wizard">
        <!-- Progress Steps -->
        <div class="sport-tournament-wizard__progress">
          <div class="sport-tournament-wizard__steps">
            <button
              v-for="step in formSteps"
              :key="step.id"
              type="button"
              class="sport-tournament-wizard__step"
              :class="{ active: currentStep === step.id, completed: step.id < currentStep }"
              @click="goToStep(step.id)"
            >
              <span class="sport-tournament-wizard__step-icon">{{ step.icon }}</span>
              <span class="sport-tournament-wizard__step-title">{{ step.title }}</span>
            </button>
          </div>
          <div class="sport-tournament-wizard__progress-bar">
            <div class="sport-tournament-wizard__progress-fill" :style="{ width: `${(currentStep + 1) / formSteps.length * 100}%` }"></div>
          </div>
        </div>

        <!-- Form Header -->
        <div class="sport-tournament-wizard__header">
          <div>
            <p class="sport-tournament-wizard__step-indicator">{{ t('sportTournament.create.heroEyebrow') }} • {{ currentStep + 1 }} of {{ formSteps.length }}</p>
            <h2 class="sport-tournament-wizard__title">{{ formSteps[currentStep].title }}</h2>
            <p class="sport-tournament-wizard__description">{{ formSteps[currentStep].description }}</p>
          </div>
          <div class="sport-tournament-wizard__summary-grid" :aria-label="t('sportTournament.create.summary')">
            <article
              v-for="card in heroSummaryCards"
              :key="card.label"
              class="sport-tournament-wizard__summary-card"
            >
              <span>{{ card.label }}</span>
              <strong>{{ card.value }}</strong>
            </article>
          </div>
        </div>

        <Form
          id="tournament-create-form"
          class="sport-tournament-wizard__form"
          :show-cancel="false"
          @submit="onSubmit"
        >
          <!-- Step 0: Basic Information -->
          <div v-show="currentStep === 0" class="sport-tournament-wizard__step-content">
            <div class="sport-tournament-wizard__grid sport-tournament-wizard__grid--two">
              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.name') }} *</span>
                <InputText v-model="form.name" :disabled="isReadOnly" placeholder="e.g., National Champions League" />
              </label>

              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.season') }} *</span>
                <InputText v-model="form.season" :disabled="isReadOnly" placeholder="e.g., 2026" />
              </label>

              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.sportType') }} *</span>
                <Select
                  v-model="form.sportType"
                  :options="sportTypeOptions"
                  option-label="label"
                  option-value="value"
                  append-to="self"
                  :disabled="isReadOnly"
                />
              </label>

              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.organizer') }} *</span>
                <InputText v-model="form.organizer" :disabled="isReadOnly" placeholder="e.g., Federation Name" />
              </label>

              <label class="sport-tournament-wizard__field sport-tournament-wizard__field--full">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.description') }} *</span>
                <Textarea
                  v-model="form.description"
                  auto-resize
                  rows="3"
                  :disabled="isReadOnly"
                  placeholder="Describe the tournament objectives and format"
                />
              </label>

              <label class="sport-tournament-wizard__field sport-tournament-wizard__field--full">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.location') }} *</span>
                <InputText v-model="form.location" :disabled="isReadOnly" placeholder="e.g., National Stadium" />
              </label>
            </div>
          </div>

          <!-- Step 1: Schedule -->
          <div v-show="currentStep === 1" class="sport-tournament-wizard__step-content">
            <div class="sport-tournament-wizard__grid sport-tournament-wizard__grid--two">
              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.registrationOpenAt') }} *</span>
                <input v-model="form.registrationOpenAt" type="date" :disabled="isReadOnly" />
              </label>
              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.registrationCloseAt') }} *</span>
                <input v-model="form.registrationCloseAt" type="date" :disabled="isReadOnly" />
              </label>
              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.startAt') }} *</span>
                <input v-model="form.startAt" type="date" :disabled="isReadOnly" />
              </label>
              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.endAt') }} *</span>
                <input v-model="form.endAt" type="date" :disabled="isReadOnly" />
              </label>
            </div>
          </div>

          <!-- Step 2: Rules & Structure -->
          <div v-show="currentStep === 2" class="sport-tournament-wizard__step-content">
            <div class="sport-tournament-wizard__grid sport-tournament-wizard__grid--two">
              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.groupCount') }} *</span>
                <InputNumber v-model="form.rules.groupCount" :min="1" :use-grouping="false" :disabled="isReadOnly" />
              </label>
              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.teamsPerGroup') }} *</span>
                <InputNumber v-model="form.rules.teamsPerGroup" :min="1" :use-grouping="false" :disabled="isReadOnly" />
              </label>
            </div>

            <div class="sport-tournament-wizard__section-title">{{ t('sportTournament.create.rules.points') }}</div>
            <div class="sport-tournament-wizard__grid sport-tournament-wizard__grid--three">
              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.pointsWin') }}</span>
                <InputNumber v-model="form.rules.pointsWin" :min="0" :use-grouping="false" :disabled="isReadOnly" />
              </label>
              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.pointsDraw') }}</span>
                <InputNumber v-model="form.rules.pointsDraw" :min="0" :use-grouping="false" :disabled="isReadOnly" />
              </label>
              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.pointsLoss') }}</span>
                <InputNumber v-model="form.rules.pointsLoss" :min="0" :use-grouping="false" :disabled="isReadOnly" />
              </label>
            </div>

            <div class="sport-tournament-wizard__checklist">
              <label class="sport-tournament-wizard__checkbox">
                <input v-model="form.rules.knockoutEnabled" type="checkbox" :disabled="isReadOnly" />
                <span>{{ t('sportTournament.create.fields.knockoutEnabled') }}</span>
              </label>
              <label class="sport-tournament-wizard__checkbox">
                <input v-model="form.rules.homeAwayEnabled" type="checkbox" :disabled="isReadOnly" />
                <span>{{ t('sportTournament.create.fields.homeAwayEnabled') }}</span>
              </label>
              <label class="sport-tournament-wizard__checkbox">
                <input v-model="form.rules.extraTimeEnabled" type="checkbox" :disabled="isReadOnly" />
                <span>{{ t('sportTournament.create.fields.extraTimeEnabled') }}</span>
              </label>
              <label class="sport-tournament-wizard__checkbox">
                <input v-model="form.rules.penaltyEnabled" type="checkbox" :disabled="isReadOnly" />
                <span>{{ t('sportTournament.create.fields.penaltyEnabled') }}</span>
              </label>
            </div>
          </div>

          <!-- Step 3: Settings & Registration -->
          <div v-show="currentStep === 3" class="sport-tournament-wizard__step-content">
            <div class="sport-tournament-wizard__grid sport-tournament-wizard__grid--two">
              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.registrationStatus') }}</span>
                <Select
                  v-model="form.registrationStatus"
                  :options="registrationStatusOptions"
                  option-label="label"
                  option-value="value"
                  append-to="self"
                  :disabled="isReadOnly"
                />
              </label>
              <label class="sport-tournament-wizard__field">
                <span class="sport-tournament-wizard__label">{{ t('sportTournament.create.fields.visibility') }}</span>
                <Select
                  v-model="form.visibility"
                  :options="visibilityOptions"
                  option-label="label"
                  option-value="value"
                  append-to="self"
                  :disabled="isReadOnly"
                />
              </label>
            </div>

            <div class="sport-tournament-wizard__status-info">
              <strong>Tournament Status</strong>
              <TournamentStatusBadge :state="form.state" />
              <p v-if="isLockedState" class="sport-tournament-wizard__warning">
                {{ t('sportTournament.create.validation.lockedMessage') }}
              </p>
            </div>
          </div>

          <!-- Step 4: Media & Review -->
          <div v-show="currentStep === 4" class="sport-tournament-wizard__step-content">
            <div class="sport-tournament-wizard__media-section">
              <TournamentMediaField
                :title="t('sportTournament.create.fields.logo')"
                :subtitle="t('sportTournament.create.upload.helper')"
                :preview="logoPreview"
                :disabled="isReadOnly"
                @change="handleImageChange('logo', $event)"
                @remove="handleImageRemove('logo')"
              />
              <TournamentMediaField
                :title="t('sportTournament.create.fields.banner')"
                :subtitle="t('sportTournament.create.upload.helper')"
                :preview="bannerPreview"
                :disabled="isReadOnly"
                @change="handleImageChange('banner', $event, { maxWidth: 1600, maxHeight: 720, quality: 0.82 })"
                @remove="handleImageRemove('banner')"
              />
            </div>

            <div class="sport-tournament-wizard__review-section">
              <h3>Review Tournament Details</h3>
              <div class="sport-tournament-wizard__review-grid">
                <div><strong>Name:</strong> <span>{{ form.name }}</span></div>
                <div><strong>Sport:</strong> <span>{{ resolveOptionLabel(sportTypeOptions, form.sportType) }}</span></div>
                <div><strong>Season:</strong> <span>{{ form.season }}</span></div>
                <div><strong>Organizer:</strong> <span>{{ form.organizer }}</span></div>
                <div><strong>Location:</strong> <span>{{ form.location }}</span></div>
                <div><strong>Teams:</strong> <span>{{ (form.rules.groupCount || 0) * (form.rules.teamsPerGroup || 0) }}</span></div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="sport-tournament-wizard__actions">
            <button
              v-if="currentStep > 0"
              type="button"
              @click="goToPreviousStep()"
              class="sport-tournament-wizard__button sport-tournament-wizard__button--secondary"
            >
              ← {{ t('common.previous') || 'Previous' }}
            </button>

            <button
              v-if="currentStep < formSteps.length - 1"
              type="button"
              @click="goToNextStep()"
              :disabled="!canProceedToStep"
              class="sport-tournament-wizard__button sport-tournament-wizard__button--primary"
            >
              {{ t('common.next') || 'Next' }} →
            </button>

            <button
              v-else
              type="submit"
              class="sport-tournament-wizard__button sport-tournament-wizard__button--primary sport-tournament-wizard__button--success"
            >
              ✓ {{ isEditMode ? t('sportTournament.create.actions.saveChanges') : t('sportTournament.create.actions.saveTournament') }}
            </button>
          </div>
        </Form>

        <!-- Cancel Button (always available) -->
        <button
          type="button"
          class="sport-tournament-wizard__cancel-button"
          @click="goBack"
          :disabled="isSubmitting"
        >
          ✕ {{ t('common.cancel') }}
        </button>
      </div>
    </section>

    <AlertError
      :show="showError"
      :title="t('common.errorOccurred')"
      :message="errorMessage"
      :button-text="t('common.close')"
      @close="onErrorClose"
    />

    <AlertSuccess
      :show="showSuccess"
      :title="isEditMode ? t('sportTournament.create.validation.updateSuccessTitle') : t('sportTournament.create.validation.createSuccessTitle')"
      :message="isEditMode ? t('sportTournament.create.validation.updateSuccessMessage') : t('sportTournament.create.validation.createSuccessMessage')"
      :button-text="t('common.close')"
      @close="onSuccessClose"
    />
  </MainLayout>
</template>

<style scoped>
/* Wizard Styles */
.sport-tournament-wizard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 1.5rem;
  border: 1px solid #dbe7f3;
}

.sport-tournament-wizard__progress {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sport-tournament-wizard__steps {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
}

.sport-tournament-wizard__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  border-radius: 1rem;
  border: 2px solid #dbe7f3;
  background: #ffffff;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}

.sport-tournament-wizard__step:hover {
  border-color: #0284c7;
  background: rgba(2, 132, 199, 0.05);
}

.sport-tournament-wizard__step.active {
  border-color: #0284c7;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  color: #0284c7;
}

.sport-tournament-wizard__step.completed {
  border-color: #16a34a;
  background: rgba(22, 163, 74, 0.05);
  color: #16a34a;
}

.sport-tournament-wizard__step-icon {
  font-size: 1.5rem;
}

.sport-tournament-wizard__step-title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sport-tournament-wizard__progress-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
}

.sport-tournament-wizard__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0284c7 0%, #06b6d4 100%);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.sport-tournament-wizard__header {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: start;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 1.2rem;
  border: 1px solid #bae6fd;
}

.sport-tournament-wizard__step-indicator {
  color: #0284c7;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0;
}

.sport-tournament-wizard__title {
  color: #0f172a;
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1.2;
  margin: 0.25rem 0 0.5rem 0;
}

.sport-tournament-wizard__description {
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.55;
  margin: 0;
}

.sport-tournament-wizard__summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.65rem;
}

.sport-tournament-wizard__summary-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  padding: 0.8rem 0.85rem;
  border-radius: 1rem;
  border: 1px solid #dbe7f3;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(244, 248, 252, 0.97) 100%);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.sport-tournament-wizard__summary-card span {
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sport-tournament-wizard__summary-card strong {
  color: #0f172a;
  font-size: 0.88rem;
  line-height: 1.3;
}

.sport-tournament-wizard__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sport-tournament-wizard__step-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 300px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sport-tournament-wizard__grid {
  display: grid;
  gap: 1rem;
}

.sport-tournament-wizard__grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sport-tournament-wizard__grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.sport-tournament-wizard__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.sport-tournament-wizard__field--full {
  grid-column: 1 / -1;
}

.sport-tournament-wizard__label {
  color: #475569;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.sport-tournament-wizard__field input[type="date"],
.sport-tournament-wizard__field :deep(input),
.sport-tournament-wizard__field :deep(.p-inputtext),
.sport-tournament-wizard__field :deep(.p-inputnumber),
.sport-tournament-wizard__field :deep(.p-select),
.sport-tournament-wizard__field :deep(.p-textarea) {
  width: 100%;
}

.sport-tournament-wizard__section-title {
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 1rem 0 0.75rem 0;
  padding-top: 1rem;
  border-top: 2px solid #e2e8f0;
}

.sport-tournament-wizard__checklist {
  display: grid;
  gap: 0.75rem;
}

.sport-tournament-wizard__checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.9rem;
  border: 1px solid #dbe7f3;
  background: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  transition: all 0.2s ease;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 500;
}

.sport-tournament-wizard__checkbox:hover {
  background: rgba(2, 132, 199, 0.04);
  border-color: #0284c7;
}

.sport-tournament-wizard__checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
}

.sport-tournament-wizard__info-box {
  padding: 1rem;
  border-radius: 0.9rem;
  border: 1px solid #dbe7f3;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  color: #0284c7;
}

.sport-tournament-wizard__info-box strong {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.sport-tournament-wizard__info-box p {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 800;
  color: #0284c7;
}

.sport-tournament-wizard__status-info {
  padding: 1rem;
  border-radius: 0.9rem;
  border: 1px solid #dbe7f3;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sport-tournament-wizard__status-info strong {
  font-weight: 700;
  color: #0f172a;
}

.sport-tournament-wizard__warning {
  margin: 0;
  padding: 0.75rem;
  border-radius: 0.7rem;
  background: rgba(237, 28, 36, 0.08);
  border-left: 3px solid #ed1c24;
  color: #991b1b;
  font-size: 0.9rem;
}

.sport-tournament-wizard__media-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}

.sport-tournament-wizard__review-section {
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 1rem;
  border: 1px solid #dbe7f3;
}

.sport-tournament-wizard__review-section h3 {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 800;
  margin: 0 0 1rem 0;
}

.sport-tournament-wizard__review-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.sport-tournament-wizard__review-grid div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #dce6f2;
}

.sport-tournament-wizard__review-grid strong {
  color: #64748b;
  font-weight: 700;
  font-size: 0.85rem;
}

.sport-tournament-wizard__review-grid span {
  color: #0f172a;
  font-weight: 600;
  text-align: right;
}

.sport-tournament-wizard__actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.sport-tournament-wizard__button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.95rem 1.75rem;
  border-radius: 0.9rem;
  border: 2px solid #dbe7f3;
  background: #ffffff;
  color: #475569;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: none;
}

.sport-tournament-wizard__button:hover:not(:disabled) {
  border-color: #0284c7;
  background: #f0f9ff;
  color: #0284c7;
}

.sport-tournament-wizard__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sport-tournament-wizard__button--primary {
  border-color: #0284c7;
  background: linear-gradient(135deg, #0284c7 0%, #0ca5e9 100%);
  color: #ffffff;
}

.sport-tournament-wizard__button--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);
  box-shadow: 0 8px 20px rgba(2, 132, 199, 0.3);
}

.sport-tournament-wizard__button--secondary {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #64748b;
}

.sport-tournament-wizard__button--secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.sport-tournament-wizard__button--success {
  border-color: #16a34a;
  background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
}

.sport-tournament-wizard__button--success:hover:not(:disabled) {
  background: linear-gradient(135deg, #16a34a 0%, #16a34a 100%);
  box-shadow: 0 8px 20px rgba(22, 163, 74, 0.3);
}

.sport-tournament-wizard__cancel-button {
  padding: 0.8rem 1.2rem;
  border-radius: 0.9rem;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-start;
}

.sport-tournament-wizard__cancel-button:hover:not(:disabled) {
  border-color: #cbd5e1;
  background: #f8fafc;
  color: #475569;
}

.sport-tournament-wizard__cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Legacy form styles (kept for compatibility) */
.sport-tournament-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  padding-bottom: 7.5rem;
}

.sport-tournament-form__shell {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.sport-tournament-form__empty {
  padding: 1.5rem;
  border-radius: 1.5rem;
  border: 1px dashed #cbd5e1;
  background: rgba(255, 255, 255, 0.92);
}

.sport-tournament-form__empty-card {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  max-width: 34rem;
}

.sport-tournament-form__empty-card h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 800;
}

.sport-tournament-form__empty-card p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.sport-tournament-form__header-copy {
  display: grid;
  gap: 0.9rem;
}

.sport-tournament-form__header-main {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.sport-tournament-form__eyebrow {
  margin: 0;
  color: #0284c7;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.sport-tournament-form__heading {
  margin: 0;
  color: #0f172a;
  font-size: 1.2rem;
  line-height: 1.2;
  font-weight: 800;
}

.sport-tournament-form__description {
  margin: 0;
  color: #475569;
  font-size: 0.88rem;
  line-height: 1.55;
}

.sport-tournament-form__summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.65rem;
}

.sport-tournament-form__summary-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
  padding: 0.8rem 0.85rem;
  border-radius: 1rem;
  border: 1px solid #dbe7f3;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(244, 248, 252, 0.97) 100%);
  box-shadow: 0 14px 34px -30px rgba(15, 23, 42, 0.45);
}

.sport-tournament-form__summary-card span {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sport-tournament-form__summary-card strong {
  color: #0f172a;
  font-size: 0.92rem;
  line-height: 1.4;
}

.sport-tournament-form__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.85fr);
  gap: 1rem;
  align-items: start;
}

.sport-tournament-form__main-column,
.sport-tournament-form__aside {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.sport-tournament-form__section-stack {
  display: grid;
  gap: 0.85rem;
}

.sport-tournament-form__mini-panel {
  padding: 0.95rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 250, 253, 0.98) 100%);
}

.sport-tournament-form__mini-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.sport-tournament-form__mini-panel-head span {
  color: #0f172a;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sport-tournament-form__grid,
.sport-tournament-form__media-grid,
.sport-tournament-form__switch-grid,
.sport-tournament-form__status-grid {
  display: grid;
  gap: 0.8rem;
}

.sport-tournament-form__grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sport-tournament-form__grid--three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.sport-tournament-form__media-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sport-tournament-form__switch-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.sport-tournament-form__status-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
}

.sport-tournament-form__field,
.sport-tournament-form__status-card {
  display: flex;
  flex-direction: column;
  gap: 0.42rem;
  min-width: 0;
}

.sport-tournament-form__field--full {
  grid-column: 1 / -1;
}

.sport-tournament-form__label {
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
}

.sport-tournament-form__input,
.sport-tournament-form__native {
  width: 100%;
}

.sport-tournament-form__native {
  border: 1px solid #d4dde8;
  border-radius: 0.8rem;
  background: #ffffff;
  color: #0f172a;
  padding: 0.82rem 0.95rem;
}

.sport-tournament-form__switch {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: rgba(255, 255, 255, 0.9);
  color: #0f172a;
  font-size: 0.88rem;
  font-weight: 600;
}

.sport-tournament-form__status-card {
  padding: 0.95rem;
  border-radius: 1rem;
  border: 1px solid #dce6f2;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.98) 100%);
}

.sport-tournament-form__note {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.6;
}

.sport-tournament-form__lock-note {
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  border: 1px solid rgba(237, 28, 36, 0.18);
  background: rgba(254, 242, 242, 0.86);
  color: #991b1b;
}

.sport-tournament-form__lock-note strong {
  display: block;
  margin-bottom: 0.25rem;
}

.sport-tournament-form__lock-note p {
  margin: 0;
  line-height: 1.6;
}

.sport-tournament-form__actions {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  z-index: 30;
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 0.8rem;
  border: 1px solid rgba(219, 231, 243, 0.96);
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 40px -28px rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(14px);
}

.sport-tournament-form__actions :deep(button) {
  min-width: 8.75rem;
}

/* Tablet Breakpoint */
@media (max-width: 1024px) {
  .sport-tournament-wizard {
    gap: 1.2rem;
    padding: 1.2rem;
  }

  .sport-tournament-wizard__steps {
    grid-template-columns: repeat(5, 1fr);
    gap: 0.6rem;
  }

  .sport-tournament-wizard__step {
    padding: 0.8rem 0.6rem;
    font-size: 0.75rem;
    gap: 0.4rem;
  }

  .sport-tournament-wizard__step-icon {
    font-size: 1.3rem;
  }

  .sport-tournament-wizard__header {
    grid-template-columns: 1fr;
    gap: 1.2rem;
    padding: 1.2rem;
  }

  .sport-tournament-wizard__summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.6rem;
  }

  .sport-tournament-wizard__summary-card {
    padding: 0.7rem 0.75rem;
  }

  .sport-tournament-wizard__summary-card span {
    font-size: 0.65rem;
  }

  .sport-tournament-wizard__summary-card strong {
    font-size: 0.8rem;
  }

  .sport-tournament-wizard__grid--three {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sport-tournament-wizard__media-section {
    grid-template-columns: 1fr;
  }

  .sport-tournament-wizard__review-grid {
    grid-template-columns: 1fr;
  }

  .sport-tournament-form__summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .sport-tournament-form__grid--three,
  .sport-tournament-form__status-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sport-tournament-form__layout {
    grid-template-columns: 1fr;
  }

  .sport-tournament-form__aside {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sport-tournament-form__actions {
    width: auto;
    right: 1rem;
    left: auto;
  }
}

/* Mobile Breakpoint */
@media (max-width: 768px) {
  .sport-tournament-wizard {
    gap: 1rem;
    padding: 1rem;
    border-radius: 1.2rem;
  }

  .sport-tournament-wizard__steps {
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
  }

  .sport-tournament-wizard__step {
    padding: 0.7rem 0.5rem;
    font-size: 0.7rem;
    gap: 0.3rem;
    border-radius: 0.8rem;
  }

  .sport-tournament-wizard__step-icon {
    font-size: 1.2rem;
  }

  .sport-tournament-wizard__header {
    gap: 1rem;
    padding: 1rem;
    border-radius: 1rem;
  }

  .sport-tournament-wizard__title {
    font-size: 1.2rem;
  }

  .sport-tournament-wizard__description {
    font-size: 0.9rem;
  }

  .sport-tournament-wizard__summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }

  .sport-tournament-wizard__summary-card {
    padding: 0.65rem 0.7rem;
  }

  .sport-tournament-wizard__summary-card span {
    font-size: 0.6rem;
  }

  .sport-tournament-wizard__summary-card strong {
    font-size: 0.75rem;
  }

  .sport-tournament-wizard__grid--two {
    grid-template-columns: 1fr;
  }

  .sport-tournament-wizard__grid--three {
    grid-template-columns: 1fr;
  }

  .sport-tournament-wizard__media-section {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .sport-tournament-wizard__review-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }

  .sport-tournament-wizard__step-content {
    min-height: auto;
  }

  .sport-tournament-wizard__button {
    padding: 0.8rem 1.2rem;
    font-size: 0.85rem;
  }

  .sport-tournament-wizard__actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .sport-tournament-wizard__cancel-button {
    width: 100%;
  }

  .sport-tournament-form {
    padding-bottom: 8.5rem;
  }

  .sport-tournament-form__summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sport-tournament-form__summary-card {
    padding: 0.7rem 0.75rem;
  }

  .sport-tournament-form__summary-card span {
    font-size: 0.68rem;
  }

  .sport-tournament-form__summary-card strong {
    font-size: 0.85rem;
  }

  .sport-tournament-form__grid--two,
  .sport-tournament-form__grid--three,
  .sport-tournament-form__media-grid,
  .sport-tournament-form__switch-grid,
  .sport-tournament-form__status-grid {
    grid-template-columns: 1fr;
  }

  .sport-tournament-form__aside {
    grid-template-columns: 1fr;
  }

  .sport-tournament-form__actions {
    left: 1rem;
    right: 1rem;
    justify-content: stretch;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .sport-tournament-form__actions :deep(button) {
    min-width: 0;
    flex: 1 1 0;
  }
}

/* Small Mobile Breakpoint */
@media (max-width: 640px) {
  .sport-tournament-wizard {
    padding: 0.9rem;
    gap: 0.9rem;
    border-radius: 1rem;
  }

  .sport-tournament-wizard__steps {
    gap: 0.4rem;
  }

  .sport-tournament-wizard__step {
    padding: 0.6rem 0.4rem;
    font-size: 0.65rem;
    gap: 0.25rem;
  }

  .sport-tournament-wizard__step-icon {
    font-size: 1.1rem;
  }

  .sport-tournament-wizard__header {
    padding: 0.9rem;
    gap: 0.8rem;
  }

  .sport-tournament-wizard__title {
    font-size: 1.05rem;
    margin: 0.15rem 0 0.35rem 0;
  }

  .sport-tournament-wizard__step-indicator {
    font-size: 0.7rem;
  }

  .sport-tournament-wizard__description {
    font-size: 0.85rem;
  }

  .sport-tournament-wizard__summary-grid {
    gap: 0.4rem;
  }

  .sport-tournament-wizard__summary-card {
    padding: 0.6rem 0.6rem;
    gap: 0.15rem;
  }

  .sport-tournament-wizard__summary-card span {
    font-size: 0.55rem;
  }

  .sport-tournament-wizard__summary-card strong {
    font-size: 0.7rem;
  }

  .sport-tournament-wizard__label {
    font-size: 0.8rem;
  }

  .sport-tournament-wizard__grid {
    gap: 0.8rem;
  }

  .sport-tournament-wizard__checkbox {
    padding: 0.8rem;
    gap: 0.6rem;
    font-size: 0.9rem;
  }

  .sport-tournament-wizard__section-title {
    font-size: 0.85rem;
    margin: 0.8rem 0 0.6rem 0;
    padding-top: 0.8rem;
  }

  .sport-tournament-wizard__button {
    padding: 0.7rem 1rem;
    font-size: 0.8rem;
    gap: 0.4rem;
  }

  .sport-tournament-wizard__info-box {
    padding: 0.9rem;
  }

  .sport-tournament-wizard__info-box p {
    font-size: 1.2rem;
  }

  .sport-tournament-form {
    padding-bottom: 9.5rem;
    gap: 0.9rem;
  }

  .sport-tournament-form__header-copy {
    gap: 0.7rem;
  }

  .sport-tournament-form__heading {
    font-size: 1.05rem;
  }

  .sport-tournament-form__description {
    font-size: 0.82rem;
  }

  .sport-tournament-form__summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sport-tournament-form__summary-card {
    padding: 0.6rem 0.65rem;
    gap: 0.2rem;
  }

  .sport-tournament-form__summary-card span {
    font-size: 0.65rem;
  }

  .sport-tournament-form__summary-card strong {
    font-size: 0.78rem;
  }

  .sport-tournament-form__actions {
    flex-direction: column-reverse;
    gap: 0.5rem;
    padding: 0.65rem;
    bottom: 0.75rem;
    right: 0.75rem;
    left: 0.75rem;
  }

  .sport-tournament-form__actions :deep(button) {
    padding: 0.65rem 0.9rem;
  }

  .sport-tournament-form__label {
    font-size: 0.78rem;
  }

  .sport-tournament-form__mini-panel {
    padding: 0.8rem;
  }

  .sport-tournament-form__mini-panel-head {
    margin-bottom: 0.6rem;
    gap: 0.5rem;
  }

  .sport-tournament-form__mini-panel-head span {
    font-size: 0.75rem;
  }

  .sport-tournament-form__switch {
    padding: 0.75rem 0.8rem;
    font-size: 0.8rem;
    gap: 0.5rem;
  }

  .sport-tournament-form__grid,
  .sport-tournament-form__media-grid,
  .sport-tournament-form__switch-grid,
  .sport-tournament-form__section-stack {
    gap: 0.65rem;
  }
}
</style>

