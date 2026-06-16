<script setup>
// Keep the progress trend list focused on finalized assessment history so the
// summary page stays readable and future report widgets can reuse it safely.
import AssessmentCategoryBadge from './AssessmentCategoryBadge.vue'
import { useLanguage } from '@/composables/useLanguage'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const { t } = useLanguage()
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="border-b border-slate-100 px-4 py-3">
      <h3 class="text-sm font-semibold text-slate-900">
        {{ t('preschoolReportsShared.categoryPerformanceTitle') }}
      </h3>
      <p class="mt-0.5 text-xs text-slate-500">
        {{ t('preschoolReportsShared.categoryPerformanceSubtitle') }}
      </p>
    </div>

    <div v-if="!items.length" class="px-4 py-8 text-center text-sm text-slate-400">
      {{ t('preschoolReportsShared.emptyCategorySummaries') }}
    </div>

    <ul v-else class="divide-y divide-slate-100">
      <li
        v-for="item in items"
        :key="item.category?.id || item.categoryId"
        class="flex items-center gap-4 px-4 py-3"
      >
        <!-- Category badge + assessment count -->
        <div class="min-w-0 flex-1 space-y-1">
          <AssessmentCategoryBadge
            :category="item.category || { code: item.categoryCode, name: item.categoryName }"
          />
          <p class="text-xs text-slate-400">
            {{ t('preschoolReportsShared.assessmentCount', { count: item.count }) }}
          </p>
        </div>

        <!-- Score bar + numeric value -->
        <div class="flex w-36 flex-shrink-0 items-center gap-2">
          <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-violet-500 transition-all"
              :style="{ width: item.averageScore != null ? `${Math.min(100, (item.averageScore / 10) * 100)}%` : '0%' }"
            />
          </div>
          <span class="w-10 text-right text-sm font-semibold text-slate-700">
            {{ item.averageScore ?? '—' }}
          </span>
        </div>

        <p class="hidden w-20 flex-shrink-0 text-right text-xs text-slate-400 sm:block">
          {{ item.latestAssessmentDate || '—' }}
        </p>
      </li>
    </ul>
  </div>
</template>
