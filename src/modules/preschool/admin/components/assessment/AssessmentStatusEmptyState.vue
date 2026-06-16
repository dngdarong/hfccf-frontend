<script setup>
defineOptions({
  name: 'AssessmentStatusEmptyState',
})

defineProps({
  tone: {
    type: String,
    default: 'slate',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section
    :class="[
      'rounded-2xl border border-dashed p-12 text-center',
      tone === 'blue' ? 'border-blue-200 bg-blue-50' : 'border-slate-300 bg-slate-50',
    ]"
  >
    <p :class="tone === 'blue' ? 'text-lg font-semibold text-blue-900' : 'text-lg text-slate-600'">
      {{ title }}
    </p>
    <p :class="tone === 'blue' ? 'mt-2 text-sm text-blue-700' : 'mt-2 text-sm text-slate-500'">
      {{ message }}
    </p>
    <slot />
  </section>
</template>
