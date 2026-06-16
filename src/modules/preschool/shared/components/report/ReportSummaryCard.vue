<script setup>
// Keep reporting summary cards reusable so student and classroom views can
// share the same visual contract without copying grid markup everywhere.
defineProps({
  title: {
    type: String,
    default: '',
  },
  value: {
    type: [Number, String],
    default: 0,
  },
  caption: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ title }}</p>
    <div class="mt-2 text-3xl font-semibold text-slate-900">{{ value }}</div>
    <p v-if="caption" class="mt-2 text-sm text-slate-500">{{ caption }}</p>
  </article>
</template>
