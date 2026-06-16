<script setup>
defineOptions({
  name: 'AssessmentSettingsCard',
})

defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h3 class="text-lg font-bold text-slate-900">
      {{ title }}
    </h3>
    <div class="mt-4">
      <slot />
    </div>
  </section>
</template>
