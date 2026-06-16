<script setup>
// Keep the weekly timetable rendering isolated so management and read-only
// pages can reuse the same layout and empty-state behavior.
import ScheduleEntryCard from './ScheduleEntryCard.vue'

defineProps({
  dayLabel: {
    type: String,
    default: '',
  },
  entries: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingLabel: {
    type: String,
    default: '',
  },
  emptyLabel: {
    type: String,
    default: '',
  },
  showActions: {
    type: Boolean,
    default: false,
  },
  editLabel: {
    type: String,
    default: '',
  },
  archiveLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['edit', 'archive'])
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-lg font-semibold text-slate-900">{{ dayLabel }}</h3>
      <span class="text-sm text-slate-500">{{ entries.length }}</span>
    </div>

    <div
      v-if="loading"
      class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500"
    >
      {{ loadingLabel }}
    </div>

    <div v-else-if="!entries.length" class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      {{ emptyLabel }}
    </div>

    <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <ScheduleEntryCard
        v-for="entry in entries"
        :key="entry.id"
        :entry="entry"
        :day-label="dayLabel"
        :show-actions="showActions"
        :edit-label="editLabel"
        :archive-label="archiveLabel"
        @edit="emit('edit', $event)"
        @archive="emit('archive', $event)"
      />
    </div>
  </div>
</template>
