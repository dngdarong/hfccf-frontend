<script setup>
import { computed, onMounted, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import Button from '@/components/buttons/Button.vue'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import { useLanguage } from '@/composables/useLanguage'
import { useAssessmentData } from '@/modules/preschool/composables/useAssessmentData'
import { usePreschoolSettings } from '@/modules/preschool/composables/usePreschoolSettings'
import AssessmentPageHeader from '@/modules/preschool/admin/components/assessment/AssessmentPageHeader.vue'
import AssessmentSettingsCard from '@/modules/preschool/admin/components/assessment/AssessmentSettingsCard.vue'
import {
  PRESCHOOL_ASSESSMENT_PERIOD_OPTIONS,
  PRESCHOOL_ASSESSMENT_RATING_OPTIONS,
} from './constants/preschoolAssessmentWorkspace'

defineOptions({
  name: 'PreschoolAssessmentSettingsPage',
})

const { categories, loadCategories } = useAssessmentData()
const {
  settings,
  loadSettings: loadAssessmentSettings,
  saveSettings: saveAssessmentSettings,
  resetSettings: resetAssessmentSettings,
} = usePreschoolSettings()
const { t } = useLanguage()

const saving = ref(false)
const saved = ref(false)
const error = ref(null)

const ratingOptions = computed(() =>
  PRESCHOOL_ASSESSMENT_RATING_OPTIONS.map(option => ({
    ...option,
    label: option.labelKey ? t(option.labelKey) : option.label,
  })),
)
const periodOptions = computed(() =>
  PRESCHOOL_ASSESSMENT_PERIOD_OPTIONS.filter(option => option.value).map(option => ({
    ...option,
    label: option.labelKey ? t(option.labelKey) : option.label,
  })),
)

onMounted(async () => {
  // Assessment preferences live in the shared Preschool settings backbone so
  // this page can stay in sync with the general academic configuration
  // instead of inventing a second local-only settings store.
  await Promise.all([loadCategories(), loadAssessmentSettings()])
})

async function persistSettings() {
  saving.value = true
  error.value = null

  try {
    const result = await saveAssessmentSettings()
    if (result && result.ok === false) {
      error.value = 'Please correct the invalid assessment settings before saving.'
      return
    }
    saved.value = true
    setTimeout(() => {
      saved.value = false
    }, 3000)
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}

function restoreSettings() {
  resetAssessmentSettings()
}
</script>

<template>
  <MainLayout>
    <div class="space-y-8">
      <AssessmentPageHeader
        :title="t('assessmentSettings.title')"
        :subtitle="t('assessmentSettings.subtitle')"
      />

      <Message
        v-if="saved"
        severity="success"
        :text="t('assessmentSettings.savedSuccess')"
        class="w-full"
      />

      <Message
        v-if="error"
        severity="error"
        :text="`${t('assessmentSettings.errorPrefix')} ${error}`"
        class="w-full"
      />

      <div class="grid gap-6 xl:grid-cols-2">
        <AssessmentSettingsCard :title="t('assessmentSettings.riskManagement.title')">

          <div class="mt-4 space-y-4">
            <div class="flex items-center gap-3">
              <Checkbox v-model="settings.assessment.enableRiskTracking" binary input-id="enableRisk" />
              <label for="enableRisk" class="cursor-pointer">
                <span class="font-medium text-slate-900">{{ t('assessmentSettings.riskManagement.enableRiskTracking') }}</span>
                <p class="text-sm text-slate-600">{{ t('assessmentSettings.riskManagement.enableRiskTrackingHelp') }}</p>
              </label>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-900">
                {{ t('assessmentSettings.riskManagement.riskThreshold') }}
              </label>
              <div class="flex items-center gap-3">
                <input
                  v-model.number="settings.assessment.riskThreshold"
                  type="range"
                  min="0"
                  max="100"
                  class="flex-1"
                />
                <span class="w-16 rounded-xl border border-slate-200 bg-slate-50 p-2 text-center font-bold text-slate-900">
                  {{ settings.assessment.riskThreshold }}
                </span>
              </div>
              <p class="text-xs text-slate-600">
                {{ t('assessmentSettings.riskManagement.riskThresholdHelp') }}
              </p>
            </div>

            <div class="flex items-center gap-3">
              <Checkbox v-model="settings.assessment.notifyOnHighRisk" binary input-id="notifyRisk" />
              <label for="notifyRisk" class="cursor-pointer">
                <span class="font-medium text-slate-900">{{ t('assessmentSettings.riskManagement.sendNotifications') }}</span>
                <p class="text-sm text-slate-600">{{ t('assessmentSettings.riskManagement.sendNotificationsHelp') }}</p>
              </label>
            </div>
          </div>
        </AssessmentSettingsCard>

        <AssessmentSettingsCard :title="t('assessmentSettings.assessmentOptions.title')">

          <div class="mt-4 space-y-4">
            <div class="flex items-center gap-3">
              <Checkbox v-model="settings.assessment.enableAutoRating" binary input-id="autoRating" />
              <label for="autoRating" class="cursor-pointer">
                <span class="font-medium text-slate-900">{{ t('assessmentSettings.assessmentOptions.enableAutoRating') }}</span>
                <p class="text-sm text-slate-600">{{ t('assessmentSettings.assessmentOptions.enableAutoRatingHelp') }}</p>
              </label>
            </div>

            <div class="flex items-center gap-3">
              <Checkbox v-model="settings.assessment.requireObservation" binary input-id="requireObs" />
              <label for="requireObs" class="cursor-pointer">
                <span class="font-medium text-slate-900">{{ t('assessmentSettings.assessmentOptions.requireObservation') }}</span>
                <p class="text-sm text-slate-600">{{ t('assessmentSettings.assessmentOptions.requireObservationHelp') }}</p>
              </label>
            </div>

            <div class="flex items-center gap-3">
              <Checkbox v-model="settings.assessment.requireTeacherComment" binary input-id="requireComment" />
              <label for="requireComment" class="cursor-pointer">
                <span class="font-medium text-slate-900">{{ t('assessmentSettings.assessmentOptions.requireTeacherComment') }}</span>
                <p class="text-sm text-slate-600">{{ t('assessmentSettings.assessmentOptions.requireTeacherCommentHelp') }}</p>
              </label>
            </div>

            <div class="flex items-center gap-3">
              <Checkbox v-model="settings.assessment.allowArchiving" binary input-id="allowArchive" />
              <label for="allowArchive" class="cursor-pointer">
                <span class="font-medium text-slate-900">{{ t('assessmentSettings.assessmentOptions.allowArchiving') }}</span>
                <p class="text-sm text-slate-600">{{ t('assessmentSettings.assessmentOptions.allowArchivingHelp') }}</p>
              </label>
            </div>
          </div>
        </AssessmentSettingsCard>

        <AssessmentSettingsCard :title="t('assessmentSettings.assessmentCategories.title')">
          <p class="mt-2 text-sm text-slate-600">
            {{ t('assessmentSettings.assessmentCategories.recordsAvailable', { count: categories.length }) }}
          </p>

          <div class="mt-4 space-y-2">
            <div
              v-for="category in categories"
              :key="category.id"
              class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
            >
              <div>
                <p class="font-medium text-slate-900">{{ category.name }}</p>
                <p v-if="category.code" class="text-xs text-slate-600">{{ t('assessmentSettings.assessmentCategories.code') }}: {{ category.code }}</p>
              </div>
              <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {{ t('assessmentSettings.assessmentCategories.active') }}
              </span>
            </div>
          </div>

          <div class="mt-4 flex gap-3">
            <Button :label="t('assessmentSettings.assessmentCategories.manageCategories')" icon="pi pi-cog" size="sm" variant="secondary" />
          </div>
        </AssessmentSettingsCard>

        <AssessmentSettingsCard :title="t('assessmentSettings.assessmentPeriods.title')">
          <p class="mt-2 text-sm text-slate-600">
            {{ t('assessmentSettings.assessmentPeriods.description') }}
          </p>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <div
              v-for="period in periodOptions"
              :key="period.value"
              class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center"
            >
              <p class="font-medium text-slate-900">{{ period.label }}</p>
            </div>
          </div>

          <div class="mt-4 flex gap-3">
            <Button :label="t('assessmentSettings.assessmentPeriods.editPeriods')" icon="pi pi-pencil" size="sm" variant="secondary" />
          </div>
        </AssessmentSettingsCard>
      </div>

      <AssessmentSettingsCard :title="t('assessmentSettings.ratingScale.title')">
        <p class="mt-2 text-sm text-slate-600">{{ t('assessmentSettings.ratingScale.description') }}</p>

        <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div
            v-for="rating in ratingOptions"
            :key="rating.value"
            class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div
              :class="[
                'flex h-10 w-10 items-center justify-center rounded-full',
                rating.riskLevel === 'excellent' ? 'bg-blue-100 text-blue-700' :
                rating.riskLevel === 'good' ? 'bg-emerald-100 text-emerald-700' :
                rating.riskLevel === 'fair' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700',
              ]"
            >
              <i
                :class="[
                  rating.riskLevel === 'excellent' ? 'pi pi-star' :
                  rating.riskLevel === 'good' ? 'pi pi-thumbs-up' :
                  rating.riskLevel === 'fair' ? 'pi pi-minus-circle' :
                  'pi pi-exclamation-triangle',
                ]"
              />
            </div>
            <div>
              <p class="font-medium text-slate-900">{{ rating.label }}</p>
              <p class="text-xs text-slate-600">
                {{ rating.scoreMin }}-{{ rating.scoreMax }} {{ t('assessmentSettings.ratingScale.points') }}
              </p>
            </div>
          </div>
        </div>
      </AssessmentSettingsCard>

      <section class="flex flex-wrap gap-3">
        <Button
          :label="t('assessmentSettings.saveSettings')"
          icon="pi pi-check"
          :loading="saving"
          @click="persistSettings"
        />
        <Button
          :label="t('assessmentSettings.reset')"
          icon="pi pi-refresh"
          variant="secondary"
          :disabled="saving"
          @click="restoreSettings"
        />
      </section>
    </div>
  </MainLayout>
</template>
