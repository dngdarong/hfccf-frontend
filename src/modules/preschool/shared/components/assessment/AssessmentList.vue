<script setup>
// Keep the assessment table reusable so both the list page and future report
// views can share the same row rendering and action wiring.
import AssessmentCategoryBadge from './AssessmentCategoryBadge.vue'
import AssessmentStatusBadge from './AssessmentStatusBadge.vue'
import Button from '@/components/buttons/Button.vue'
import Pagination from '@/components/data-display/Pagination.vue'
import { useLanguage } from '@/composables/useLanguage'

defineProps({
  assessments: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    default: () => ({ page: 1, perPage: 10, total: 0, totalPages: 1 }),
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

defineEmits(['edit', 'finalize', 'archive', 'page-change'])
const { t } = useLanguage()
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div
      v-if="isLocked && lockMessage"
      class="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
    >
      {{ lockMessage }}
    </div>

    <div v-if="loading" class="border-b border-slate-200 px-4 py-3 text-sm text-slate-500">
      {{ t('preschoolAssessmentPage.loading') }}
    </div>

    <div v-else-if="!assessments.length" class="px-4 py-10 text-center">
      <p class="text-sm font-semibold text-slate-800">{{ t('preschoolAssessmentPage.empty') }}</p>
      <p class="mt-2 text-sm text-slate-500">{{ t('preschoolAssessmentPage.emptyDescription') }}</p>
    </div>

    <table v-else class="min-w-full divide-y divide-slate-200 text-left text-sm">
      <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th class="px-4 py-3">{{ t('preschoolAssessmentPage.columns.period') }}</th>
          <th class="px-4 py-3">{{ t('preschoolAssessmentPage.columns.date') }}</th>
          <th class="px-4 py-3">{{ t('preschoolAssessmentPage.columns.category') }}</th>
          <th class="px-4 py-3">{{ t('preschoolAssessmentPage.columns.rating') }}</th>
          <th class="px-4 py-3">{{ t('preschoolAssessmentPage.columns.score') }}</th>
          <th class="px-4 py-3">{{ t('preschoolAssessmentPage.columns.status') }}</th>
          <th class="px-4 py-3 text-right">{{ t('preschoolAssessmentPage.columns.actions') }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 bg-white">
        <tr v-for="assessment in assessments" :key="assessment.id">
          <td class="px-4 py-3">
            <div class="font-medium text-slate-900">{{ assessment.periodLabel || '-' }}</div>
            <div class="text-xs text-slate-500">{{ assessment.studentName || '-' }}</div>
          </td>
          <td class="px-4 py-3 text-slate-600">{{ assessment.assessmentDate || '-' }}</td>
          <td class="px-4 py-3">
            <AssessmentCategoryBadge :category="assessment.category || { code: assessment.categoryCode, name: assessment.categoryName }" />
          </td>
          <td class="px-4 py-3 text-slate-600">{{ assessment.rating || '-' }}</td>
          <td class="px-4 py-3 text-slate-600">{{ assessment.score ?? '-' }}</td>
          <td class="px-4 py-3">
            <AssessmentStatusBadge :status="assessment.status" />
          </td>
          <td class="px-4 py-3">
            <div class="flex justify-end gap-2">
              <Button size="sm" variant="ghost" type="button" :disabled="isLocked" @click="$emit('edit', assessment)">
                {{ t('common.actions.edit') }}
              </Button>
              <Button size="sm" variant="ghost" type="button" :disabled="isLocked" @click="$emit('finalize', assessment)">
                {{ t('preschoolAssessmentPage.actions.finalize') }}
              </Button>
              <Button size="sm" variant="ghost" type="button" :disabled="isLocked" @click="$emit('archive', assessment)">
                {{ t('preschoolAssessmentPage.actions.archive') }}
              </Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="assessments.length" class="border-t border-slate-200 px-4 py-3">
      <Pagination
        :model-value="pagination.page"
        :total-pages="pagination.totalPages"
        @update:model-value="$emit('page-change', $event)"
      />
    </div>
  </div>
</template>
