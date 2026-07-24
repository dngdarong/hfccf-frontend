<script setup>
import { useOperationsDateTime } from '../composables/useOperationsDateTime'

defineProps({
  item: {
    type: Object,
    default: () => ({}),
  },
})

const { formatDateTime } = useOperationsDateTime()

function getTimestamp(item) {
  return item?.createdAt || item?.occurredAt || item?.dueAt || item?.resolvedAt || item?.updatedAt || ''
}
</script>

<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm font-semibold text-slate-900">{{ item.label || item.type }}</p>
        <p v-if="item.text" class="mt-1 text-sm text-slate-500">{{ item.text }}</p>
      </div>
      <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
        {{ item.status || item.type }}
      </span>
    </div>
    <p v-if="getTimestamp(item)" class="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">
      {{ formatDateTime(getTimestamp(item)) }}
    </p>
  </article>
</template>
