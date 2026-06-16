<script setup>
import RiskBadge from './RiskBadge.vue'

defineProps({
  submission: { type: Object, required: true },
})
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-slate-500">Overall Score</p>
        <p class="mt-1 text-3xl font-bold text-slate-900">
          {{ submission.score_percentage != null ? submission.score_percentage.toFixed(1) + '%' : '—' }}
        </p>
        <p class="text-xs text-slate-400 mt-0.5">
          {{ submission.total_score?.toFixed(1) ?? '—' }} / {{ submission.max_possible_score?.toFixed(1) ?? '—' }} pts
        </p>
      </div>
      <RiskBadge :level="submission.risk_level" />
    </div>

    <div v-if="submission.scores?.length" class="mt-4 space-y-2">
      <div
        v-for="score in submission.scores"
        :key="score.id"
        class="flex items-center gap-3"
      >
        <span class="w-36 truncate text-xs text-slate-500">{{ score.section?.title ?? 'Section' }}</span>
        <div class="flex-1 overflow-hidden rounded-full bg-slate-100 h-1.5">
          <div
            class="h-full rounded-full bg-blue-500 transition-all"
            :style="{ width: score.percentage + '%' }"
          />
        </div>
        <span class="w-10 text-right text-xs font-medium text-slate-700">
          {{ score.percentage?.toFixed(0) }}%
        </span>
      </div>
    </div>
  </div>
</template>
