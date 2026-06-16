<script setup>
// Keep the snapshot archive table focused on browsing immutable records and
// not on editing. The admin page owns filtering and export behavior.
import { useLanguage } from '@/composables/useLanguage'
import { formatDatetimeShort } from '@/utils/date'
import Button from '@/components/buttons/Button.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import ReportSnapshotBadge from './ReportSnapshotBadge.vue'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['view', 'page-change'])
const { t } = useLanguage()

function tone(state) {
  const normalized = String(state || '').toLowerCase()
  if (normalized === 'archived') return 'warning'
  if (normalized === 'locked' || normalized === 'finalized') return 'info'
  return 'success'
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div v-if="loading" class="px-4 py-8 text-sm text-slate-500">
      {{ t('preschoolSnapshotArchivePage.loading') }}
    </div>

    <div v-else-if="!items.length" class="px-4 py-8 text-sm text-slate-500">
      {{ t('preschoolSnapshotArchivePage.empty') }}
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.snapshot') }}</th>
            <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.context') }}</th>
            <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.academic') }}</th>
            <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.state') }}</th>
            <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.generated') }}</th>
            <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.source') }}</th>
            <th class="px-4 py-3 text-right">{{ t('preschoolSnapshotArchivePage.columns.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr v-for="item in items" :key="item.id">
            <td class="px-4 py-3">
              <div class="space-y-2">
                <StatusBadge
                  :status="tone(item.lifecycleState)"
                  :label="item.snapshotType"
                  :translate-label="false"
                  :dot="false"
                  size="sm"
                />
                <ReportSnapshotBadge
                  :snapshot="item"
                  :source="item.sourceStatus"
                  :frozen="true"
                  :generated-at="item.generatedAt"
                />
              </div>
            </td>
            <td class="px-4 py-3 text-slate-600">
              <div class="space-y-1">
                <p class="font-medium text-slate-900">{{ item.contextLabel || '-' }}</p>
                <p class="text-xs text-slate-500">{{ item.student?.fullName || item.class?.name || '-' }}</p>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-600">
              <div class="space-y-1">
                <p>{{ item.academicYear?.label || item.academicYear?.code || '-' }}</p>
                <p class="text-xs text-slate-500">{{ item.term?.name || item.term?.code || '-' }}</p>
                <p class="text-xs text-slate-500">{{ item.reportPeriod?.label || '-' }}</p>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-600">
              <p class="font-medium text-slate-900">{{ t(`preschoolReportSnapshots.states.${item.lifecycleState}`) || item.lifecycleState }}</p>
              <p class="text-xs text-slate-500">
                {{ t('preschoolSnapshotArchivePage.labels.version') }} {{ item.snapshotVersion }}
              </p>
            </td>
            <td class="px-4 py-3 text-slate-600">
              <div class="space-y-1">
                <p>{{ formatDatetimeShort(item.generatedAt) }}</p>
                <p class="text-xs text-slate-500">{{ item.generatedBy?.displayName || item.generatedBy?.username || '-' }}</p>
              </div>
            </td>
            <td class="px-4 py-3 text-slate-600">
              <span class="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {{ item.sourceStatus || 'snapshot' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <Button type="button" variant="ghost" size="sm" rounded="xl" @click="emit('view', item)">
                {{ t('preschoolSnapshotArchivePage.actions.view') }}
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500">
      <div class="space-y-1">
        <span class="block">
          {{ t('preschoolSnapshotArchivePage.pagination.summary', { total: pagination.total || items.length }) }}
        </span>
        <span class="block">
          {{ t('preschoolSnapshotArchivePage.pagination.page', { page: pagination.page || 1, totalPages: pagination.totalPages || 1 }) }}
        </span>
      </div>
      <div class="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          rounded="xl"
          :disabled="(pagination.page || 1) <= 1 || loading"
          @click="emit('page-change', -1)"
        >
          {{ t('preschoolSnapshotArchivePage.pagination.previous') }}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          rounded="xl"
          :disabled="(pagination.page || 1) >= (pagination.totalPages || 1) || loading"
          @click="emit('page-change', 1)"
        >
          {{ t('preschoolSnapshotArchivePage.pagination.next') }}
        </Button>
      </div>
    </div>
  </div>
</template>
