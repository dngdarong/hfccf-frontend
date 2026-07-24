<script setup>
defineProps({
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  generatedAt: {
    type: String,
    default: '',
  },
  backLabel: {
    type: String,
    default: 'Back',
  },
  refreshLabel: {
    type: String,
    default: 'Refresh',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['back', 'refresh'])
</script>

<template>
  <section class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm md:flex-row md:items-end md:justify-between">
    <div class="space-y-2">
      <button
        type="button"
        class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500"
        @click="emit('back')"
      >
        {{ backLabel }}
      </button>
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">{{ title }}</h1>
      <p class="max-w-3xl text-sm leading-6 text-slate-600">{{ subtitle }}</p>
      <p v-if="generatedAt" class="text-xs font-medium uppercase tracking-wide text-slate-500">{{ generatedAt }}</p>
    </div>

    <button
      type="button"
      class="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="loading"
      @click="emit('refresh')"
    >
      {{ loading ? 'Loading…' : refreshLabel }}
    </button>
  </section>
</template>
