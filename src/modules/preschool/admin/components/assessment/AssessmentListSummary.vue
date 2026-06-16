<script setup>
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AssessmentListSummary',
})

defineProps({
  selectedStudentLabel: {
    type: String,
    required: true,
  },
  assessmentCount: {
    type: Number,
    required: true,
  },
  activeFilterCount: {
    type: Number,
    required: true,
  },
})

const { t } = useLanguage()
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="grid gap-4 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] lg:items-end">
      <div>
        <label class="mb-2 block text-sm font-medium text-slate-700">
          {{ t('assessmentList.selectedStudent') }}
        </label>
        <slot name="student-selector" />
      </div>

      <div
        v-for="item in [
          { label: t('assessmentList.selectedStudent'), value: selectedStudentLabel },
          { label: t('assessmentList.summary.assessments'), value: assessmentCount.toString() },
          { label: t('assessmentList.filters.activeFilters'), value: activeFilterCount.toString() },
        ]"
        :key="item.label"
        class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {{ item.label }}
        </p>
        <p class="mt-1 text-sm font-semibold text-slate-900">{{ item.value }}</p>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-3">
      <slot name="actions" />
    </div>
  </section>
</template>
