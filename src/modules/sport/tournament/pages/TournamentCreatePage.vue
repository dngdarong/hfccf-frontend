<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
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
import { createTournamentDraft } from '@/modules/sport/tournament/mocks/tournaments.mock'

defineOptions({
  name: 'SportTournamentCreatePage',
})

const router = useRouter()
const route = useRoute()
const { t } = useLanguage()
const { getTournamentById, loadTournament, createTournament, updateTournament, isLoading } = useTournamentCrudCatalog()

const draftFactory = () => createTournamentDraft()
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
      <HeaderSection :title="pageTitle" :subtitle="pageSubtitle" />

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

      <Form
        v-else
        class="sport-tournament-form__shell"
        :title="pageTitle"
        :description="t('sportTournament.create.formDescription')"
        :show-cancel="false"
        @submit="onSubmit"
      >
        <template #header>
          <div class="sport-tournament-form__header-copy">
            <div>
              <h3 class="sport-tournament-form__heading">{{ pageTitle }}</h3>
              <p class="sport-tournament-form__description">{{ pageSubtitle }}</p>
            </div>

            <TournamentStatusBadge :state="form.state" />
          </div>
        </template>

        <TournamentFormSection
          :title="t('sportTournament.create.sections.basicInformation')"
          :subtitle="t('sportTournament.create.summary')"
        >
          <div class="sport-tournament-form__grid sport-tournament-form__grid--two">
            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.name') }}</span>
              <InputText v-model="form.name" :disabled="isReadOnly" class="sport-tournament-form__input" />
            </label>

            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.season') }}</span>
              <InputText v-model="form.season" :disabled="isReadOnly" class="sport-tournament-form__input" />
            </label>

            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.sportType') }}</span>
              <Select
                v-model="form.sportType"
                :options="sportTypeOptions"
                option-label="label"
                option-value="value"
                append-to="self"
                :disabled="isReadOnly"
                class="sport-tournament-form__input"
              />
            </label>

            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.organizer') }}</span>
              <InputText v-model="form.organizer" :disabled="isReadOnly" class="sport-tournament-form__input" />
            </label>

            <label class="sport-tournament-form__field sport-tournament-form__field--full">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.description') }}</span>
              <Textarea
                v-model="form.description"
                auto-resize
                rows="4"
                :disabled="isReadOnly"
                class="sport-tournament-form__input"
              />
            </label>

            <label class="sport-tournament-form__field sport-tournament-form__field--full">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.location') }}</span>
              <InputText v-model="form.location" :disabled="isReadOnly" class="sport-tournament-form__input" />
            </label>
          </div>

          <div class="sport-tournament-form__media-grid">
            <TournamentMediaField
              :title="t('sportTournament.create.fields.logo')"
              :subtitle="t('sportTournament.create.upload.placeholder')"
              :preview="logoPreview"
              :disabled="isReadOnly"
              @change="handleImageChange('logo', $event)"
              @remove="handleImageRemove('logo')"
            />

            <TournamentMediaField
              :title="t('sportTournament.create.fields.banner')"
              :subtitle="t('sportTournament.create.upload.placeholder')"
              :preview="bannerPreview"
              :disabled="isReadOnly"
              @change="handleImageChange('banner', $event, { maxWidth: 1600, maxHeight: 720, quality: 0.82 })"
              @remove="handleImageRemove('banner')"
            />
          </div>
        </TournamentFormSection>

        <TournamentFormSection
          :title="t('sportTournament.create.sections.dates')"
          :subtitle="t('sportTournament.create.summary')"
        >
          <div class="sport-tournament-form__grid sport-tournament-form__grid--two">
            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.registrationOpenAt') }}</span>
              <input v-model="form.registrationOpenAt" type="date" class="sport-tournament-form__native" :disabled="isReadOnly">
            </label>
            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.registrationCloseAt') }}</span>
              <input v-model="form.registrationCloseAt" type="date" class="sport-tournament-form__native" :disabled="isReadOnly">
            </label>
            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.startAt') }}</span>
              <input v-model="form.startAt" type="date" class="sport-tournament-form__native" :disabled="isReadOnly">
            </label>
            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.endAt') }}</span>
              <input v-model="form.endAt" type="date" class="sport-tournament-form__native" :disabled="isReadOnly">
            </label>
          </div>
        </TournamentFormSection>

        <TournamentFormSection
          :title="t('sportTournament.create.sections.rules')"
          :subtitle="t('sportTournament.create.formDescription')"
        >
          <div class="sport-tournament-form__grid sport-tournament-form__grid--three">
            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.groupCount') }}</span>
              <InputNumber v-model="form.rules.groupCount" :min="1" :use-grouping="false" :disabled="isReadOnly" class="sport-tournament-form__input" />
            </label>
            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.teamsPerGroup') }}</span>
              <InputNumber v-model="form.rules.teamsPerGroup" :min="1" :use-grouping="false" :disabled="isReadOnly" class="sport-tournament-form__input" />
            </label>
            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.pointsWin') }}</span>
              <InputNumber v-model="form.rules.pointsWin" :min="0" :use-grouping="false" :disabled="isReadOnly" class="sport-tournament-form__input" />
            </label>
            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.pointsDraw') }}</span>
              <InputNumber v-model="form.rules.pointsDraw" :min="0" :use-grouping="false" :disabled="isReadOnly" class="sport-tournament-form__input" />
            </label>
            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.pointsLoss') }}</span>
              <InputNumber v-model="form.rules.pointsLoss" :min="0" :use-grouping="false" :disabled="isReadOnly" class="sport-tournament-form__input" />
            </label>
          </div>

          <div class="sport-tournament-form__switch-grid">
            <label class="sport-tournament-form__switch">
              <input v-model="form.rules.knockoutEnabled" type="checkbox" :disabled="isReadOnly">
              <span>{{ t('sportTournament.create.fields.knockoutEnabled') }}</span>
            </label>
            <label class="sport-tournament-form__switch">
              <input v-model="form.rules.homeAwayEnabled" type="checkbox" :disabled="isReadOnly">
              <span>{{ t('sportTournament.create.fields.homeAwayEnabled') }}</span>
            </label>
            <label class="sport-tournament-form__switch">
              <input v-model="form.rules.extraTimeEnabled" type="checkbox" :disabled="isReadOnly">
              <span>{{ t('sportTournament.create.fields.extraTimeEnabled') }}</span>
            </label>
            <label class="sport-tournament-form__switch">
              <input v-model="form.rules.penaltyEnabled" type="checkbox" :disabled="isReadOnly">
              <span>{{ t('sportTournament.create.fields.penaltyEnabled') }}</span>
            </label>
          </div>
        </TournamentFormSection>

        <TournamentFormSection
          :title="t('sportTournament.create.sections.status')"
          :subtitle="t('sportTournament.create.statusNotice')"
        >
          <div class="sport-tournament-form__status-grid">
            <div class="sport-tournament-form__status-card">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.state') }}</span>
              <TournamentStatusBadge :state="form.state" />
              <p class="sport-tournament-form__note">{{ t('sportTournament.create.statusNotice') }}</p>
            </div>

            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.registrationStatus') }}</span>
              <Select
                v-model="form.registrationStatus"
                :options="registrationStatusOptions"
                option-label="label"
                option-value="value"
                append-to="self"
                :disabled="isReadOnly"
                class="sport-tournament-form__input"
              />
            </label>

            <label class="sport-tournament-form__field">
              <span class="sport-tournament-form__label">{{ t('sportTournament.create.fields.visibility') }}</span>
              <Select
                v-model="form.visibility"
                :options="visibilityOptions"
                option-label="label"
                option-value="value"
                append-to="self"
                :disabled="isReadOnly"
                class="sport-tournament-form__input"
              />
            </label>
          </div>

          <div v-if="isLockedState" class="sport-tournament-form__lock-note">
            <strong>{{ t('sportTournament.create.validation.lockedTitle') }}</strong>
            <p>{{ t('sportTournament.create.validation.lockedMessage') }}</p>
          </div>
        </TournamentFormSection>

        <template #actions>
          <div class="sport-tournament-form__actions">
            <Button
              type="button"
              outlined
              class="rounded-xl"
              :label="t('common.cancel')"
              :disabled="isSubmitting"
              @click="goBack"
            />

            <Button
              type="submit"
              class="rounded-xl"
              :label="isEditMode ? t('sportTournament.create.actions.saveChanges') : t('sportTournament.create.actions.saveTournament')"
              :loading="isSubmitting"
              :disabled="isReadOnly"
            />
          </div>
        </template>
      </Form>
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
.sport-tournament-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sport-tournament-form__shell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.sport-tournament-form__heading {
  margin: 0;
  color: #0f172a;
  font-size: 1.5rem;
  line-height: 1.2;
  font-weight: 800;
}

.sport-tournament-form__description {
  margin: 0.45rem 0 0;
  color: #475569;
  font-size: 0.92rem;
  line-height: 1.6;
}

.sport-tournament-form__grid,
.sport-tournament-form__media-grid,
.sport-tournament-form__switch-grid,
.sport-tournament-form__status-grid {
  display: grid;
  gap: 0.9rem;
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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
  padding: 1rem;
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
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

@media (max-width: 1024px) {
  .sport-tournament-form__grid--three,
  .sport-tournament-form__status-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .sport-tournament-form__grid--two,
  .sport-tournament-form__grid--three,
  .sport-tournament-form__media-grid,
  .sport-tournament-form__switch-grid,
  .sport-tournament-form__status-grid {
    grid-template-columns: 1fr;
  }

  .sport-tournament-form__header-copy {
    flex-direction: column;
  }
}
</style>
