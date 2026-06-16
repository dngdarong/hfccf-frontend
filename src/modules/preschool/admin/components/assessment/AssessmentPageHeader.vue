<script setup>
import Breadcrumb from '@/components/navigation/Breadcrumb.vue'

defineOptions({
  name: 'AssessmentPageHeader',
})

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <header class="space-y-2">
    <Breadcrumb />
    <h1 class="text-3xl font-bold text-slate-900">
      {{ title }}
    </h1>
    <p class="max-w-3xl text-sm leading-6 text-slate-600">
      {{ subtitle }}
    </p>
  </header>
</template>
