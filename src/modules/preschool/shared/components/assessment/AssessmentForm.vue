<script setup>
// Keep the form isolated so create/edit flows reuse the same field contract
// and validation behavior without duplicating template logic.
import { computed, reactive, watch } from 'vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  categories: {
    type: Array,
    default: () => [],
  },
  classes: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  submitLabel: {
    type: String,
    default: '',
  },
  cancelLabel: {
    type: String,
    default: '',
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])
const { t } = useLanguage()

const draft = reactive({
  class_id: '',
  category_id: '',
  period_label: '',
  assessment_date: '',
  score: '',
  rating: '',
  observation: '',
  teacher_comment: '',
})

watch(
  () => props.modelValue,
  (value) => {
    Object.assign(draft, {
      class_id: value?.class_id ?? '',
      category_id: value?.category_id ?? '',
      period_label: value?.period_label ?? '',
      assessment_date: value?.assessment_date ?? '',
      score: value?.score ?? '',
      rating: value?.rating ?? '',
      observation: value?.observation ?? '',
      teacher_comment: value?.teacher_comment ?? '',
    })
  },
  { immediate: true, deep: true },
)

watch(
  draft,
  () => {
    emit('update:modelValue', {
      class_id: draft.class_id || null,
      category_id: draft.category_id || null,
      period_label: draft.period_label,
      assessment_date: draft.assessment_date,
      score: draft.score === '' ? null : draft.score,
      rating: draft.rating || null,
      observation: draft.observation || null,
      teacher_comment: draft.teacher_comment || null,
    })
  },
  { deep: true },
)

const categoryOptions = computed(() =>
  props.categories.map((category) => ({
    label: category.name,
    value: category.id,
  })),
)

const classOptions = computed(() =>
  props.classes.map((item) => ({
    label: item.label || item.name,
    value: item.value ?? item.id,
  })),
)

const ratingOptions = computed(() => [
  { label: t('preschoolAssessmentStatus.emerging'), value: 'emerging' },
  { label: t('preschoolAssessmentStatus.developing'), value: 'developing' },
  { label: t('preschoolAssessmentStatus.proficient'), value: 'proficient' },
  { label: t('preschoolAssessmentStatus.advanced'), value: 'advanced' },
])
</script>

<template>
  <form class="space-y-4" @submit.prevent="$emit('submit')">
    <div
      v-if="isLocked && lockMessage"
      class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      {{ lockMessage }}
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ t('preschoolAssessmentFormPage.fields.class') }}</span>
        <Select
          v-model="draft.class_id"
          :options="classOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolAssessmentFormPage.placeholders.class')"
          :disabled="isLocked"
        />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ t('preschoolAssessmentFormPage.fields.category') }}</span>
        <Select
          v-model="draft.category_id"
          :options="categoryOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolAssessmentFormPage.placeholders.category')"
          :disabled="isLocked"
        />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ t('preschoolAssessmentFormPage.fields.periodLabel') }}</span>
        <InputText v-model="draft.period_label" class="w-full" :placeholder="t('preschoolAssessmentFormPage.placeholders.periodLabel')" :disabled="isLocked" />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ t('preschoolAssessmentFormPage.fields.assessmentDate') }}</span>
        <InputText v-model="draft.assessment_date" type="date" class="w-full" :disabled="isLocked" />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ t('preschoolAssessmentFormPage.fields.score') }}</span>
        <InputText v-model="draft.score" type="number" min="0" max="100" step="0.5" class="w-full" :placeholder="t('preschoolAssessmentFormPage.placeholders.score')" :disabled="isLocked" />
      </label>

      <label class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ t('preschoolAssessmentFormPage.fields.rating') }}</span>
        <Select
          v-model="draft.rating"
          :options="ratingOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolAssessmentFormPage.placeholders.rating')"
          :disabled="isLocked"
        />
      </label>
    </div>

    <label class="space-y-2 text-sm font-medium text-slate-700 block">
      <span>{{ t('preschoolAssessmentFormPage.fields.observation') }}</span>
      <Textarea
        v-model="draft.observation"
        rows="4"
        class="w-full"
        :placeholder="t('preschoolAssessmentFormPage.placeholders.observation')"
        :disabled="isLocked"
      />
    </label>

    <label class="space-y-2 text-sm font-medium text-slate-700 block">
      <span>{{ t('preschoolAssessmentFormPage.fields.teacherComment') }}</span>
      <Textarea
        v-model="draft.teacher_comment"
        rows="4"
        class="w-full"
        :placeholder="t('preschoolAssessmentFormPage.placeholders.teacherComment')"
        :disabled="isLocked"
      />
    </label>

    <div class="flex flex-wrap gap-2 pt-2">
      <Button type="submit" variant="primary" size="md" rounded="xl" :loading="loading" :disabled="isLocked">
        {{ submitLabel || t('preschoolAssessmentFormPage.actions.save') }}
      </Button>
      <Button v-if="showCancel" type="button" variant="secondary" size="md" rounded="xl" :disabled="isLocked" @click="$emit('cancel')">
        {{ cancelLabel || t('common.cancel') }}
      </Button>
    </div>
  </form>
</template>
