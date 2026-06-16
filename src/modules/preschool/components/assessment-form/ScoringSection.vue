<script setup>
import { computed } from 'vue'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import { PRESCHOOL_ASSESSMENT_RATING_OPTIONS } from '@/modules/preschool/admin/pages/assessments/constants/preschoolAssessmentWorkspace'

defineOptions({
  name: 'AssessmentScoringSection',
})

const props = defineProps({
  score: {
    type: [String, Number],
    default: null,
  },
  rating: {
    type: String,
    default: '',
  },
  scoreError: {
    type: String,
    default: '',
  },
  ratingError: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:score', 'update:rating'])
const { t } = useLanguage()

const scoreValue = computed({
  get: () => props.score,
  set: value => emit('update:score', value),
})

const ratingValue = computed({
  get: () => props.rating,
  set: value => emit('update:rating', value),
})

const ratingOptions = PRESCHOOL_ASSESSMENT_RATING_OPTIONS.map(option => ({
  label: option.labelKey ? t(option.labelKey) : option.label,
  value: option.value,
}))

const suggestedRating = computed(() => {
  const score = Number(scoreValue.value) || 0
  const match = PRESCHOOL_ASSESSMENT_RATING_OPTIONS.find(option => score >= option.scoreMin && score <= option.scoreMax)
  return match?.value || 'Needs Improvement'
})

const suggestedRatingLabel = computed(() => {
  const match = ratingOptions.find(option => option.value === suggestedRating.value)
  return match?.label || suggestedRating.value
})

function applySuggestedRating() {
  ratingValue.value = suggestedRating.value
}
</script>

<template>
  <section class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
    <h4 class="text-sm font-semibold text-slate-900">{{ t('assessmentList.scoring.title') }}</h4>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-slate-700">
        {{ t('assessmentList.scoring.score') }}
        <span class="text-red-500">*</span>
      </label>

      <InputNumber
        v-model="scoreValue"
        :min="0"
        :max="100"
        :disabled="disabled"
        :placeholder="t('assessmentList.scoring.placeholderScore')"
        class="w-full"
      />

      <p v-if="scoreError" class="text-sm text-red-600">
        {{ scoreError }}
      </p>

      <div v-if="scoreValue !== null && scoreValue !== ''" class="mt-2 rounded-xl bg-blue-50 p-3">
        <p class="text-xs text-blue-700">
          <strong>{{ t('assessmentList.scoring.scoreInterpretation') }}</strong>
          <span class="ml-1">
            {{ suggestedRating === 'Excellent' ? t('assessmentList.scoring.excellentPerformance') : suggestedRating === 'Good' ? t('assessmentList.scoring.goodPerformance') : suggestedRating === 'Fair' ? t('assessmentList.scoring.fairPerformance') : t('assessmentList.scoring.needsImprovement') }}
          </span>
        </p>
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between gap-3">
        <label class="block text-sm font-medium text-slate-700">
          {{ t('assessmentList.scoring.rating') }}
          <span class="text-red-500">*</span>
        </label>
        <button
          v-if="scoreValue !== null && scoreValue !== ''"
          type="button"
          class="text-xs font-medium text-blue-600 transition hover:text-blue-800"
          @click="applySuggestedRating"
        >
          {{ t('assessmentList.scoring.useSuggested') }}
        </button>
      </div>

      <Select
        v-model="ratingValue"
        :options="ratingOptions"
        option-label="label"
        option-value="value"
        :placeholder="t('assessmentList.scoring.placeholderRating')"
        :disabled="disabled"
        show-clear
        class="w-full"
      />

      <p v-if="ratingError" class="text-sm text-red-600">
        {{ ratingError }}
      </p>
    </div>

    <div v-if="scoreValue !== null && scoreValue !== '' && ratingValue !== suggestedRating" class="rounded-xl bg-amber-50 p-3">
      <p class="text-xs text-amber-700">
        <strong>{{ t('assessmentList.scoring.suggestion') }}</strong>
        {{ t('assessmentList.scoring.suggestedRatingIs') }} <strong>{{ suggestedRatingLabel }}</strong>.
      </p>
    </div>
  </section>
</template>
