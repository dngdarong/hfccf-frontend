<script setup>
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'
import StudentSelector from './StudentSelector.vue'
import CategorySelector from './CategorySelector.vue'
import ScoringSection from './ScoringSection.vue'
import ObservationPanel from './ObservationPanel.vue'
import {
  PRESCHOOL_ASSESSMENT_DEFAULT_FORM,
  PRESCHOOL_ASSESSMENT_PERIOD_OPTIONS,
} from '@/modules/preschool/admin/pages/assessments/constants/preschoolAssessmentWorkspace'

defineOptions({
  name: 'AssessmentModal',
})

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  assessment: {
    type: Object,
    default: null,
  },
  categories: {
    type: Array,
    required: true,
  },
  studentOptions: {
    type: Array,
    required: true,
  },
  classOptions: {
    type: Array,
    required: true,
  },
  validationErrors: {
    type: Object,
    default: () => ({}),
  },
  saving: {
    type: Boolean,
    default: false,
  },
  periods: {
    type: Array,
    default: () => PRESCHOOL_ASSESSMENT_PERIOD_OPTIONS,
  },
})

const emit = defineEmits(['update:visible', 'save', 'finalize'])

const isEditMode = computed(() => !!props.assessment?.id)
const { t } = useLanguage()

const localizedPeriods = computed(() =>
  props.periods.map(period => ({
    ...period,
    label: period.labelKey ? t(period.labelKey) : period.label,
  })),
)

function createInitialForm() {
  return {
    ...PRESCHOOL_ASSESSMENT_DEFAULT_FORM,
    assessmentDate: new Date().toISOString().split('T')[0],
  }
}

const formData = ref(createInitialForm())

watch(
  () => props.assessment,
  (assessment) => {
    if (assessment) {
      formData.value = {
        studentId: assessment.studentId ?? null,
        classId: assessment.classId ?? null,
        categoryId: assessment.categoryId ?? null,
        periodLabel: assessment.periodLabel ?? null,
        assessmentDate: assessment.assessmentDate ?? new Date().toISOString().split('T')[0],
        score: assessment.score ?? null,
        rating: assessment.rating ?? '',
        observation: assessment.observation ?? '',
        teacherComment: assessment.teacherComment ?? '',
      }
      return
    }

    formData.value = createInitialForm()
  },
  { immediate: true },
)

function handleClose() {
  emit('update:visible', false)
  formData.value = createInitialForm()
}

function handleSave() {
  emit('save', { ...formData.value, id: props.assessment?.id })
}

function handleFinalize() {
  emit('finalize', props.assessment?.id)
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="isEditMode ? t('assessmentList.modal.editTitle') : t('assessmentList.modal.createTitle')"
    :modal="true"
    :style="{ width: '90vw', maxWidth: '900px' }"
    class="p-dialog-centered"
    @update:visible="handleClose"
  >
    <form class="space-y-6">
      <section class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 class="text-sm font-semibold text-slate-900">{{ t('assessmentList.modal.studentInformation') }}</h4>

        <div class="grid gap-4 sm:grid-cols-2">
          <StudentSelector
            v-model="formData.studentId"
            :options="studentOptions"
            :error="validationErrors.studentId"
            :disabled="saving"
          />

          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-700">
              {{ t('assessmentList.modal.class') }}
              <span class="text-red-500">*</span>
            </label>

            <Select
              v-model="formData.classId"
              :options="classOptions"
              option-label="label"
              option-value="value"
              :placeholder="t('assessmentList.modal.selectClass')"
              :disabled="saving"
              show-clear
              class="w-full"
            />

            <p v-if="validationErrors.classId" class="text-sm text-red-600">
              {{ validationErrors.classId }}
            </p>
          </div>
        </div>
      </section>

      <section class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 class="text-sm font-semibold text-slate-900">{{ t('assessmentList.modal.assessmentDetails') }}</h4>

        <div class="grid gap-4 sm:grid-cols-2">
          <CategorySelector
            v-model="formData.categoryId"
            :categories="categories"
            :error="validationErrors.categoryId"
            :disabled="saving"
          />

          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-700">
              {{ t('assessmentList.modal.period') }}
              <span class="text-red-500">*</span>
            </label>

            <Select
              v-model="formData.periodLabel"
              :options="localizedPeriods"
              option-label="label"
              option-value="value"
              :placeholder="t('assessmentList.modal.selectPeriod')"
              :disabled="saving"
              show-clear
              class="w-full"
            />

            <p v-if="validationErrors.periodLabel" class="text-sm text-red-600">
              {{ validationErrors.periodLabel }}
            </p>
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-medium text-slate-700">
            {{ t('assessmentList.modal.assessmentDate') }}
            <span class="text-red-500">*</span>
          </label>

          <InputText
            v-model="formData.assessmentDate"
            type="date"
            :disabled="saving"
            class="w-full"
          />

          <p v-if="validationErrors.assessmentDate" class="text-sm text-red-600">
            {{ validationErrors.assessmentDate }}
          </p>
        </div>
      </section>

      <ScoringSection
        v-model:score="formData.score"
        v-model:rating="formData.rating"
        :score-error="validationErrors.score"
        :rating-error="validationErrors.rating"
        :disabled="saving"
      />

      <ObservationPanel
        v-model:observation="formData.observation"
        v-model:teacher-comment="formData.teacherComment"
        :disabled="saving"
      />
    </form>

    <template #footer>
      <div class="flex items-center justify-between gap-2">
        <Button
          v-if="isEditMode && assessment?.status === 'draft'"
          :label="t('assessmentList.modal.finalizeAndClose')"
          icon="pi pi-check"
          severity="success"
          :loading="saving"
          @click="handleFinalize"
        />

        <div class="flex gap-2">
          <Button
            :label="t('common.cancel')"
            icon="pi pi-times"
            variant="secondary"
            :disabled="saving"
            @click="handleClose"
          />

          <Button
            :label="isEditMode ? t('assessmentList.modal.saveAndUpdate') : t('assessmentList.modal.saveAndCreate')"
            icon="pi pi-check"
            :loading="saving"
            @click="handleSave"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>
