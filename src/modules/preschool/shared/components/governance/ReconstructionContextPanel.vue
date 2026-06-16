<script setup>
import { useLanguage } from '@/composables/useLanguage'

const { t } = useLanguage()

defineProps({
  context: {
    type: Object,
    default: () => ({}),
  },
  academicContext: {
    type: Object,
    default: () => ({}),
  },
  references: {
    type: Object,
    default: () => ({}),
  },
})

/**
 * Map a list of objects to display labels, preferring label → name → code → #id.
 * @param {Array} items
 * @returns {string[]}
 */
function formatCollection(items = []) {
  if (!Array.isArray(items) || !items.length) return []
  return items.map((item) => item?.label || item?.name || item?.code || `#${item?.id ?? '—'}`)
}

/**
 * Format a count of IDs as a short summary string.
 * Shows the IDs when there are ≤5, otherwise shows just the count.
 * @param {Array} ids
 * @returns {string}
 */
function formatIdList(ids = []) {
  if (!Array.isArray(ids) || !ids.length) return '—'
  if (ids.length <= 5) return ids.join(', ')
  return t('preschoolInstitutionalReconstructionPage.context.idCount', { count: ids.length })
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <h3 class="mb-3 text-sm font-semibold text-slate-900">
      {{ t('preschoolInstitutionalReconstructionPage.sections.reconstructionContext') }}
    </h3>

    <div class="grid gap-3 lg:grid-cols-3">

      <!-- Historical filter context -->
      <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <h4 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {{ t('preschoolInstitutionalReconstructionPage.context.filterContext') }}
        </h4>
        <dl class="space-y-2 text-sm">
          <div class="flex items-center justify-between gap-3">
            <dt class="text-slate-500">{{ t('preschoolInstitutionalReconstructionPage.filters.academicYear') }}</dt>
            <dd class="font-medium text-slate-900">{{ context.academicYearLabel || context.academicYearId || '—' }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-slate-500">{{ t('preschoolInstitutionalReconstructionPage.filters.term') }}</dt>
            <dd class="font-medium text-slate-900">{{ context.termLabel || context.termId || '—' }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-slate-500">{{ t('preschoolInstitutionalReconstructionPage.filters.reportPeriod') }}</dt>
            <dd class="font-medium text-slate-900">{{ context.reportPeriodLabel || context.reportPeriodId || '—' }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-slate-500">{{ t('preschoolInstitutionalReconstructionPage.filters.class') }}</dt>
            <dd class="font-medium text-slate-900">{{ context.className || context.classId || '—' }}</dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-slate-500">{{ t('preschoolInstitutionalReconstructionPage.filters.student') }}</dt>
            <dd class="font-medium text-slate-900">{{ context.studentName || context.studentId || '—' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Active academic context found during reconstruction -->
      <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <h4 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {{ t('preschoolInstitutionalReconstructionPage.context.academicContext') }}
        </h4>
        <div class="space-y-3 text-sm">
          <div>
            <p class="text-xs text-slate-400">{{ t('preschoolInstitutionalReconstructionPage.filters.academicYear') }}</p>
            <p class="mt-0.5 font-medium text-slate-800">
              {{ formatCollection(academicContext.academicYears).join(', ') || '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-slate-400">{{ t('preschoolInstitutionalReconstructionPage.filters.term') }}</p>
            <p class="mt-0.5 font-medium text-slate-800">
              {{ formatCollection(academicContext.terms).join(', ') || '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs text-slate-400">{{ t('preschoolInstitutionalReconstructionPage.filters.reportPeriod') }}</p>
            <p class="mt-0.5 font-medium text-slate-800">
              {{ formatCollection(academicContext.reportPeriods).join(', ') || '—' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Record reference IDs -->
      <div class="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <h4 class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {{ t('preschoolInstitutionalReconstructionPage.context.references') }}
        </h4>
        <div class="space-y-3 text-sm">
          <div>
            <p class="text-xs text-slate-400">{{ t('preschoolInstitutionalReconstructionPage.historical.snapshots') }}</p>
            <p class="mt-0.5 font-medium text-slate-800">{{ formatIdList(references.snapshotIds) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400">{{ t('preschoolInstitutionalReconstructionPage.historical.exports') }}</p>
            <p class="mt-0.5 font-medium text-slate-800">{{ formatIdList(references.exportIds) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400">{{ t('preschoolInstitutionalReconstructionPage.historical.audits') }}</p>
            <p class="mt-0.5 font-medium text-slate-800">{{ formatIdList(references.auditIds) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400">{{ t('preschoolInstitutionalReconstructionPage.historical.assignments') }}</p>
            <p class="mt-0.5 font-medium text-slate-800">{{ formatIdList(references.assignmentIds) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
