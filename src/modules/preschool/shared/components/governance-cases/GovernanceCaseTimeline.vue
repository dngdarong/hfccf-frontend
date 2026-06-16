<script setup>
defineOptions({
  name: 'GovernanceCaseTimeline',
})

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  emptyLabel: {
    type: String,
    default: 'No governance timeline entries are available.',
  },
})

function formatContext(context = {}) {
  const parts = []

  if (context.academicYearId) parts.push(`AY#${context.academicYearId}`)
  if (context.termId) parts.push(`T#${context.termId}`)
  if (context.reportPeriodId) parts.push(`RP#${context.reportPeriodId}`)
  if (context.classId) parts.push(`C#${context.classId}`)
  if (context.studentId) parts.push(`S#${context.studentId}`)
  if (context.snapshotId) parts.push(`SN#${context.snapshotId}`)
  if (context.exportRecordId) parts.push(`EX#${context.exportRecordId}`)

  return parts.join(' · ')
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="space-y-1">
      <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
      <p class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <div v-if="!items.length" class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      {{ emptyLabel }}
    </div>

    <div v-else class="mt-4 space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="rounded-xl border border-slate-200 p-3"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="space-y-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ item.source || item.actionType || labels.eventType || 'Event' }}</p>
            <p class="text-sm font-semibold text-slate-900">{{ item.title || item.actionType || '-' }}</p>
            <p class="text-sm text-slate-600">{{ item.description || labels.noDescription || '-' }}</p>
          </div>
          <p class="text-xs text-slate-500">{{ item.recordedAt || '-' }}</p>
        </div>

        <div class="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
          <p>{{ labels.actor || 'Actor' }}: {{ item.actor?.displayName || item.actor?.roleCode || '-' }}</p>
          <p>{{ labels.status || 'Status' }}: {{ item.previousStatus || '-' }} → {{ item.newStatus || '-' }}</p>
          <p>{{ labels.context || 'Context' }}: {{ formatContext(item.context) || '-' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
