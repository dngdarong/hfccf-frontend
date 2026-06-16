<script setup>
// Keep category badges self-contained so the assessment tables stay readable
// and future report screens can reuse the same translation lookup.
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  category: {
    type: Object,
    default: () => ({}),
  },
})

const { t } = useLanguage()

const label = computed(() => {
  const code = String(props.category?.code || '').trim()
  if (!code) return props.category?.name || '-'

  const key = `preschoolAssessmentCategories.${code}`
  return t(key) || props.category?.name || code
})
</script>

<template>
  <span class="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
    {{ label }}
  </span>
</template>
