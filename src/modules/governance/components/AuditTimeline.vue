<script setup>
import Card from 'primevue/card'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AuditTimeline',
})

const { t } = useLanguage()

defineProps({
  title: {
    type: String,
    default: '',
  },
  items: {
    type: Array,
    default: () => [],
  },
  emptyLabel: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <Card>
    <template #title>{{ title }}</template>
    <template #content>
      <div v-if="items.length" class="space-y-4">
        <article
          v-for="item in items"
          :key="item.id"
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                {{ item.module }}
              </p>
              <h4 class="text-base font-semibold text-slate-900">{{ item.title || item.eventType || item.action }}</h4>
            </div>
            <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="item.severityClass || 'bg-slate-100 text-slate-700'">
              {{ item.severityLabel || item.severity || t('governance.statuses.info') }}
            </span>
          </div>
          <p class="mt-2 text-sm text-slate-600">{{ item.description || item.action || '-' }}</p>
          <p class="mt-3 text-xs text-slate-500">{{ item.createdAt }}</p>
        </article>
      </div>
      <p v-else class="py-8 text-center text-sm text-slate-500">{{ emptyLabel }}</p>
    </template>
  </Card>
</template>
