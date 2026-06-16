<script setup>
// Export detail stays read-only because immutable export metadata is an
// institutional record, not an editable operational document.
import Dialog from 'primevue/dialog'
import Button from '@/components/buttons/Button.vue'
import StatusBadge from '@/components/badges/StatusBadge.vue'
import { useLanguage } from '@/composables/useLanguage'
import { formatDatetimeShort } from '@/utils/date'
import {
  formatAuditCodeFallback,
  resolveLifecycleActionLabel,
  resolveLifecycleContextLabel,
  resolveLifecycleEntityLabel,
  splitLifecycleEntityContext,
} from '@/modules/preschool/shared/utils/lifecycleAuditLabels'

defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  record: {
    type: Object,
    default: null,
  },
  detail: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:visible', 'download'])
const { t, te } = useLanguage()

function sourceStatus(source) {
  return source === 'snapshot' ? 'success' : 'warning'
}

function sourceLabel(source) {
  const labels = {
    snapshot: t('preschoolExportGovernancePage.exportSources.snapshot'),
    live: t('preschoolExportGovernancePage.exportSources.live'),
  }

  return labels[source] || source || '-'
}

function exportTypeLabel(type) {
  const labels = {
    snapshot_archive: t('preschoolExportGovernancePage.exportTypes.snapshotArchive'),
    student_report: t('preschoolExportGovernancePage.exportTypes.studentReport'),
    classroom_report: t('preschoolExportGovernancePage.exportTypes.classroomReport'),
    progress_summary: t('preschoolExportGovernancePage.exportTypes.progressSummary'),
    institutional_summary: t('preschoolExportGovernancePage.exportTypes.institutionalSummary'),
  }

  return labels[type] || type || '-'
}

function reasonLabel(reason) {
  return resolveLifecycleActionLabel(t, reason, te)
}

function entityLabel(entityType) {
  return resolveLifecycleEntityLabel(t, entityType, te)
}

function contextLabel(value) {
  const { context, entity } = splitLifecycleEntityContext(value)
  return resolveLifecycleContextLabel(t, context || entity, te)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="true"
    :dismissable-mask="true"
    :style="{ width: 'min(960px, 96vw)' }"
    :header="t('preschoolExportGovernancePage.detail.title')"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="loading" class="px-1 py-4 text-sm text-slate-500">
      {{ t('preschoolExportGovernancePage.loading') }}
    </div>
    <div v-else-if="!record" class="px-1 py-4 text-sm text-slate-500">
      {{ t('preschoolExportGovernancePage.emptyDetail') }}
    </div>
    <div v-else class="space-y-4">
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolExportGovernancePage.labels.exportType') }}</p>
            <p class="mt-1 text-sm font-medium text-slate-900">{{ exportTypeLabel(record.exportType) }}</p>
          </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolExportGovernancePage.labels.exportFormat') }}</p>
          <p class="mt-1 text-sm font-medium text-slate-900">{{ record.exportFormat || '-' }}</p>
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolExportGovernancePage.labels.exportSource') }}</p>
          <StatusBadge
            class="mt-1"
            :status="sourceStatus(record.exportSource)"
            :label="sourceLabel(record.exportSource)"
            :translate-label="false"
            :dot="false"
          />
        </div>
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolExportGovernancePage.labels.exportedAt') }}</p>
          <p class="mt-1 text-sm font-medium text-slate-900">{{ record.exportedAt || '-' }}</p>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolExportGovernancePage.detail.metadata') }}</h3>
          <dl class="mt-3 grid gap-3 text-sm md:grid-cols-2">
            <div>
              <dt class="text-slate-500">{{ t('preschoolExportGovernancePage.labels.generatedBy') }}</dt>
              <dd class="mt-1 text-slate-900">{{ record.actor?.displayName || record.actorRole || '-' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">{{ t('preschoolExportGovernancePage.labels.generatedByRole') }}</dt>
              <dd class="mt-1 text-slate-900">{{ record.actor?.roleCode || record.actorRole || '-' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">{{ t('preschoolExportGovernancePage.labels.academicYear') }}</dt>
              <dd class="mt-1 text-slate-900">{{ record.academicYear?.label || record.academicYear?.code || '-' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">{{ t('preschoolExportGovernancePage.labels.term') }}</dt>
              <dd class="mt-1 text-slate-900">{{ record.term?.name || record.term?.code || '-' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">{{ t('preschoolExportGovernancePage.labels.reportPeriod') }}</dt>
              <dd class="mt-1 text-slate-900">{{ record.reportPeriod?.label || '-' }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">{{ t('preschoolExportGovernancePage.labels.snapshotCount') }}</dt>
              <dd class="mt-1 text-slate-900">{{ record.snapshotCount || 0 }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">{{ t('preschoolExportGovernancePage.labels.recordCount') }}</dt>
              <dd class="mt-1 text-slate-900">{{ record.recordCount || 0 }}</dd>
            </div>
            <div>
              <dt class="text-slate-500">{{ t('preschoolExportGovernancePage.labels.checksum') }}</dt>
              <dd class="mt-1 break-all text-slate-900">{{ record.checksum || '-' }}</dd>
            </div>
            <div class="md:col-span-2">
              <dt class="text-slate-500">{{ t('preschoolExportGovernancePage.labels.exportReason') }}</dt>
              <dd class="mt-1 text-slate-900">{{ record.exportReason || '-' }}</dd>
            </div>
            <div class="md:col-span-2">
              <dt class="text-slate-500">{{ t('preschoolExportGovernancePage.labels.fileName') }}</dt>
              <dd class="mt-1 break-all text-slate-900">{{ record.fileName || '-' }}</dd>
            </div>
          </dl>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolExportGovernancePage.detail.auditTrail') }}</h3>
          <div v-if="!detail?.auditTrail?.length" class="mt-3 text-sm text-slate-500">
            {{ t('preschoolExportGovernancePage.detail.noAuditTrail') }}
          </div>
          <div v-else class="mt-3 space-y-3">
            <div
              v-for="event in detail.auditTrail"
              :key="event.id"
              class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-medium text-slate-900">{{ reasonLabel(event.actionType) }}</p>
                  <p class="text-xs text-slate-500">{{ entityLabel(event.entityType || event.entity) }} · {{ contextLabel(event.entityId || event.context || event) }}</p>
                </div>
                <p class="text-xs text-slate-500">{{ formatDatetimeShort(event.createdAt) }}</p>
              </div>
              <p class="mt-2 text-slate-600">
                {{ formatAuditCodeFallback(event.overrideReason || event.lockReason) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolExportGovernancePage.detail.includedSnapshots') }}</h3>
            <p class="text-sm text-slate-500">{{ t('preschoolExportGovernancePage.detail.includedSnapshotsSubtitle') }}</p>
          </div>
          <Button type="button" variant="secondary" size="md" rounded="xl" :disabled="!record.downloadable" @click="emit('download', record)">
            {{ t('preschoolExportGovernancePage.actions.downloadExport') }}
          </Button>
        </div>

        <div v-if="detail?.includedSnapshots?.length" class="mt-4 overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">{{ t('preschoolExportGovernancePage.columns.snapshot') }}</th>
                <th class="px-4 py-3">{{ t('preschoolExportGovernancePage.columns.context') }}</th>
                <th class="px-4 py-3">{{ t('preschoolExportGovernancePage.columns.summary') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-for="snapshot in detail.includedSnapshots" :key="snapshot.id">
                <td class="px-4 py-3 text-slate-600">
                  <div class="space-y-1">
                    <p class="font-medium text-slate-900">{{ snapshot.snapshotType || '-' }}</p>
                    <p class="text-xs text-slate-500">{{ snapshot.lifecycleState || '-' }} | v{{ snapshot.snapshotVersion || 0 }}</p>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600">
                  <div class="space-y-1">
                    <p>{{ contextLabel(snapshot.contextLabel || snapshot.context) }}</p>
                    <p class="text-xs text-slate-500">{{ formatAuditCodeFallback(snapshot.academicYear?.label || snapshot.academicYear?.code) }}</p>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600">
                  <div class="space-y-1">
                    <p>{{ t('preschoolExportGovernancePage.detail.attendance') }}: {{ snapshot.attendanceSummary?.attendanceCount ?? 0 }}</p>
                    <p>{{ t('preschoolExportGovernancePage.detail.averageScore') }}: {{ snapshot.reportSummary?.averageScore ?? '-' }}</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="mt-4 text-sm text-slate-500">
          {{ t('preschoolExportGovernancePage.detail.noIncludedSnapshots') }}
        </div>
      </div>
    </div>
  </Dialog>
</template>
