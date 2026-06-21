<script setup>
defineProps({
  title: {
    type: String,
    default: 'No data available',
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
    <p class="text-sm font-semibold text-slate-900">{{ title }}</p>
    <p v-if="subtitle" class="mt-2 text-sm text-slate-500">{{ subtitle }}</p>
  </div>
</template>
