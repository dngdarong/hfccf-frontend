<script setup>
// Keep export history rendering isolated so immutable export metadata stays
// read-only and the admin page can focus on filtering and drill-down actions.
import Button from '@/components/buttons/Button.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['view', 'download'])
const { t } = useLanguage()

function exportSourceStatus(source) {
  return source === 'snapshot' ? 'success' : 'warning'
}

function displaySource(source) {
  const labels = {
    snapshot: t('preschoolExportGovernancePage.exportSources.snapshot'),
    live: t('preschoolExportGovernancePage.exportSources.live'),
  }

  return labels[source] || source || '-'
}

function displayExportType(type) {
  const labels = {
    snapshot_archive: t('preschoolExportGovernancePage.exportTypes.snapshotArchive'),
    student_report: t('preschoolExportGovernancePage.exportTypes.studentReport'),
    classroom_report: t('preschoolExportGovernancePage.exportTypes.classroomReport'),
    progress_summary: t('preschoolExportGovernancePage.exportTypes.progressSummary'),
    institutional_summary: t('preschoolExportGovernancePage.exportTypes.institutionalSummary'),
  }

  return labels[type] || type || '-'
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-slate-200 text-sm">
      <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th class="px-4 py-3">{{ t('preschoolExportGovernancePage.columns.export') }}</th>
          <th class="px-4 py-3">{{ t('preschoolExportGovernancePage.columns.source') }}</th>
          <th class="px-4 py-3">{{ t('preschoolExportGovernancePage.columns.context') }}</th>
          <th class="px-4 py-3">{{ t('preschoolExportGovernancePage.columns.actor') }}</th>
          <th class="px-4 py-3">{{ t('preschoolExportGovernancePage.columns.records') }}</th>
          <th class="px-4 py-3">{{ t('preschoolExportGovernancePage.columns.exportedAt') }}</th>
          <th class="px-4 py-3">{{ t('preschoolExportGovernancePage.columns.reason') }}</th>
          <th class="px-4 py-3">{{ t('preschoolExportGovernancePage.columns.actions') }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 bg-white">
        <tr v-if="loading">
          <td class="px-4 py-6 text-slate-500" colspan="8">{{ t('preschoolExportGovernancePage.loading') }}</td>
        </tr>
        <tr v-else-if="!items.length">
          <td class="px-4 py-6 text-slate-500" colspan="8">{{ t('preschoolExportGovernancePage.history.empty') }}</td>
        </tr>
        <tr v-for="item in items" v-else :key="item.id">
          <td class="px-4 py-3">
            <div class="space-y-1">
              <p class="font-medium text-slate-900">{{ displayExportType(item.exportType) }}</p>
              <p class="text-xs text-slate-500">{{ item.exportFormat || '-' }}</p>
              <p v-if="item.fileName" class="text-xs text-slate-500">{{ item.fileName }}</p>
            </div>
          </td>
          <td class="px-4 py-3">
            <StatusBadge
              :status="exportSourceStatus(item.exportSource)"
              :label="displaySource(item.exportSource)"
              :translate-label="false"
              :dot="false"
            />
          </td>
          <td class="px-4 py-3 text-slate-600">
            <div class="space-y-1">
              <p>{{ item.academicYear?.label || item.academicYear?.code || '-' }}</p>
              <p class="text-xs text-slate-500">
                {{ item.term?.name || item.term?.code || '-' }} | {{ item.reportPeriod?.label || '-' }}
              </p>
              <p v-if="item.snapshotCount" class="text-xs text-slate-500">
                {{ item.snapshotCount }} snapshots
              </p>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-600">
            <div class="space-y-1">
              <p>{{ item.actor?.displayName || item.actorRole || `#${item.actorUserId || '-'}` }}</p>
              <p class="text-xs text-slate-500">{{ item.actor?.roleCode || item.actorRole || '-' }}</p>
            </div>
          </td>
          <td class="px-4 py-3 text-slate-600">{{ item.recordCount || 0 }}</td>
          <td class="px-4 py-3 text-slate-600">{{ item.exportedAt || '-' }}</td>
          <td class="px-4 py-3 text-slate-600">
            <div class="space-y-1">
              <p>{{ item.exportReason || '-' }}</p>
              <p v-if="item.checksum" class="text-xs text-slate-500">{{ item.checksum.slice(0, 12) }}...</p>
            </div>
          </td>
          <td class="px-4 py-3">
            <div class="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" size="sm" rounded="lg" @click="emit('view', item)">
                {{ t('preschoolExportGovernancePage.actions.viewDetails') }}
              </Button>
              <Button v-if="item.downloadable" type="button" variant="secondary" size="sm" rounded="lg" @click="emit('download', item)">
                {{ t('preschoolExportGovernancePage.actions.downloadExport') }}
              </Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
