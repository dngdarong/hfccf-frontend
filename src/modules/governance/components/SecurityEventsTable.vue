<script setup>
import Card from 'primevue/card'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'SecurityEventsTable',
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
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-sm">
          <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3 font-semibold">{{ t('governance.security.fields.eventType') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('governance.security.fields.severity') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('governance.security.fields.user') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('governance.security.fields.description') }}</th>
              <th class="px-4 py-3 font-semibold">{{ t('governance.security.fields.status') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="item in items" :key="item.id">
              <td class="px-4 py-3">
                <p class="font-semibold text-slate-900">{{ item.eventType }}</p>
                <p class="text-xs text-slate-500">{{ item.createdAt }}</p>
              </td>
              <td class="px-4 py-3">{{ item.severity }}</td>
              <td class="px-4 py-3">{{ item.userName || item.userId || '-' }}</td>
              <td class="px-4 py-3">{{ item.description || '-' }}</td>
              <td class="px-4 py-3">{{ item.resolvedAt ? t('governance.statuses.resolved') : t('governance.statuses.open') }}</td>
            </tr>
            <tr v-if="!items.length">
              <td colspan="5" class="px-4 py-8 text-center text-slate-500">{{ emptyLabel }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </Card>
</template>
