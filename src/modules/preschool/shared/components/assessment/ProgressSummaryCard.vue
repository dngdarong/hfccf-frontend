<script setup>
// Keep summary cards separate from the page so the same trend data can be
// reused in reports once the assessment foundation is expanded later.
import { useLanguage } from '@/composables/useLanguage'

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

const { t } = useLanguage()
</script>

<template>
  <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ title }}</p>
    <div class="mt-2 text-3xl font-semibold text-slate-900">{{ value }}</div>
    <p class="mt-2 text-sm text-slate-500">{{ caption || t('preschoolProgressSummaryPage.cardFallback') }}</p>
  </article>
</template>
