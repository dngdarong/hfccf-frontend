<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})

const { t } = useLanguage()

const resolvedTitle = computed(() => props.title || t('common.shell.modulePage'))
const resolvedDescription = computed(() => props.description || t('common.shell.modulePageReady'))
</script>

<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
      {{ t('common.shell.modulePage') }}
    </p>
    <h1 class="mt-3 text-2xl font-bold text-slate-900">{{ resolvedTitle }}</h1>
    <p class="mt-2 max-w-2xl text-sm text-slate-600">{{ resolvedDescription }}</p>
  </section>
</template>
