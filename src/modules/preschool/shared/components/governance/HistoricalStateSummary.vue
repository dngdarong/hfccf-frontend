<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  summary: {
    type: Object,
    default: () => ({}),
  },
  retentionReview: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useLanguage()

/** Only render the retention review card when the backend sent data for it. */
const hasRetentionReview = computed(() =>
  Object.keys(props.retentionReview || {}).length > 0,
)
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="mb-4 space-y-0.5">
      <h3 class="text-sm font-semibold text-slate-900">
        {{ t('preschoolInstitutionalReconstructionPage.sections.historicalStateSummary') }}
      </h3>
      <p class="text-xs text-slate-500">
        {{ t('preschoolInstitutionalReconstructionPage.sections.historicalStateSummarySubtitle') }}
      </p>
    </div>

    <!-- Count cards -->
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="rounded-xl bg-violet-50 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-violet-600">
          {{ t('preschoolInstitutionalReconstructionPage.historical.snapshots') }}
        </p>
        <p class="mt-1 text-2xl font-bold text-violet-800">{{ summary.snapshotCount ?? 0 }}</p>
      </div>
      <div class="rounded-xl bg-sky-50 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-sky-600">
          {{ t('preschoolInstitutionalReconstructionPage.historical.audits') }}
        </p>
        <p class="mt-1 text-2xl font-bold text-sky-800">{{ summary.auditCount ?? 0 }}</p>
      </div>
      <div class="rounded-xl bg-amber-50 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-amber-600">
          {{ t('preschoolInstitutionalReconstructionPage.historical.exports') }}
        </p>
        <p class="mt-1 text-2xl font-bold text-amber-800">{{ summary.exportCount ?? 0 }}</p>
      </div>
      <div class="rounded-xl bg-emerald-50 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          {{ t('preschoolInstitutionalReconstructionPage.historical.assignments') }}
        </p>
        <p class="mt-1 text-2xl font-bold text-emerald-800">{{ summary.assignmentCount ?? 0 }}</p>
      </div>
    </div>

    <!-- Period & year counts + optional retention review -->
    <div class="mt-3 grid gap-3 lg:grid-cols-2">
      <div class="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
        <h4 class="mb-2 font-semibold text-slate-800">
          {{ t('preschoolInstitutionalReconstructionPage.historical.reportPeriods') }}
        </h4>
        <dl class="space-y-1 text-slate-600">
          <div class="flex justify-between">
            <dt>{{ t('preschoolInstitutionalReconstructionPage.historical.periods') }}</dt>
            <dd class="font-semibold text-slate-900">{{ summary.reportPeriodCount ?? 0 }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>{{ t('preschoolInstitutionalReconstructionPage.historical.academicYears') }}</dt>
            <dd class="font-semibold text-slate-900">{{ summary.academicYearCount ?? 0 }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>{{ t('preschoolInstitutionalReconstructionPage.historical.terms') }}</dt>
            <dd class="font-semibold text-slate-900">{{ summary.termCount ?? 0 }}</dd>
          </div>
        </dl>
      </div>

      <div v-if="hasRetentionReview" class="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
        <h4 class="mb-2 font-semibold text-slate-800">
          {{ t('preschoolInstitutionalReconstructionPage.historical.retentionReview') }}
        </h4>
        <dl class="space-y-1 text-slate-600">
          <div class="flex justify-between">
            <dt>{{ t('preschoolInstitutionalReconstructionPage.historical.archivedYears') }}</dt>
            <dd class="font-semibold text-slate-900">{{ retentionReview.archivedAcademicYears ?? 0 }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>{{ t('preschoolInstitutionalReconstructionPage.historical.archivedTerms') }}</dt>
            <dd class="font-semibold text-slate-900">{{ retentionReview.archivedTerms ?? 0 }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>{{ t('preschoolInstitutionalReconstructionPage.historical.archivedPeriods') }}</dt>
            <dd class="font-semibold text-slate-900">{{ retentionReview.archivedReportPeriods ?? 0 }}</dd>
          </div>
          <div class="flex justify-between">
            <dt>{{ t('preschoolInstitutionalReconstructionPage.historical.retentionWindow') }}</dt>
            <dd class="font-semibold text-slate-900">
              {{ t('preschoolInstitutionalReconstructionPage.historical.retentionWindowDays', { days: retentionReview.retentionWindowDays ?? 0 }) }}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
