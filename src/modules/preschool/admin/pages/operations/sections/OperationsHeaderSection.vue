<script setup>
import Breadcrumb from '@/components/navigation/Breadcrumb.vue'
import Button from '@/components/buttons/Button.vue'

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
  loading: {
    type: Boolean,
    default: false,
  },
  refreshLabel: {
    type: String,
    default: 'Refresh',
  },
})

const emit = defineEmits(['refresh'])
</script>

<template>
  <section class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm md:flex-row md:items-end md:justify-between">
    <div class="space-y-2">
      <Breadcrumb />
      <p class="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Preschool</p>
      <h1 class="text-2xl font-semibold tracking-tight text-slate-900">{{ title }}</h1>
      <p class="max-w-3xl text-sm leading-6 text-slate-600">{{ subtitle }}</p>
      <p v-if="generatedAt" class="text-xs font-medium uppercase tracking-wide text-slate-500">
        {{ generatedAt }}
      </p>
    </div>

    <Button
      type="button"
      variant="primary"
      size="md"
      rounded="xl"
      :loading="loading"
      @click="emit('refresh')"
    >
      {{ loading ? 'Loading…' : refreshLabel }}
    </Button>
  </section>
</template>
