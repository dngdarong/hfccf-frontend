<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import OperationsEmptyState from '../components/OperationsEmptyState.vue'
import OperationsTimelineItem from '../components/OperationsTimelineItem.vue'

const props = defineProps({
  timeline: {
    type: Array,
    default: () => [],
  },
})

const { t } = useLanguage()
const items = computed(() => Array.isArray(props.timeline) ? props.timeline : [])
</script>

<template>
  <section class="space-y-4">
    <div>
      <h2 class="text-lg font-semibold text-slate-900">{{ t('preschoolOperationsPage.timeline') }}</h2>
      <p class="text-sm text-slate-500">{{ t('preschoolOperationsPage.viewDetails') }}</p>
    </div>

    <OperationsEmptyState v-if="items.length === 0" :title="t('preschoolOperationsPage.noTimeline')" />

    <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <OperationsTimelineItem v-for="item in items" :key="item.id || item.createdAt || `${item.type}-${item.label}`" :item="item" />
    </div>
  </section>
</template>
