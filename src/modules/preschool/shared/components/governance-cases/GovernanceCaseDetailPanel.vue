<script setup>
import GovernanceCaseSeverityBadge from './GovernanceCaseSeverityBadge.vue'
import GovernanceCaseStatusBadge from './GovernanceCaseStatusBadge.vue'
import { formatDatetimeShort } from '@/utils/date'

defineOptions({
  name: 'GovernanceCaseDetailPanel',
})

defineProps({
  record: {
    type: Object,
    default: () => ({}),
  },
  detail: {
    type: Object,
    default: () => ({}),
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
  sourceLabelMap: {
    type: Object,
    default: () => ({}),
  },
  statusLabelMap: {
    type: Object,
    default: () => ({}),
  },
  severityLabelMap: {
    type: Object,
    default: () => ({}),
  },
})

function joinContext(context = {}) {
  return [
    context.academicYearId ? `AY#${context.academicYearId}` : '',
    context.termId ? `T#${context.termId}` : '',
    context.reportPeriodId ? `RP#${context.reportPeriodId}` : '',
    context.classId ? `C#${context.classId}` : '',
    context.studentId ? `S#${context.studentId}` : '',
  ].filter(Boolean).join(' · ')
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="space-y-1">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {{ labels.caseLabel || 'Case' }}
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-xl font-semibold text-slate-900">{{ record.caseKey || '-' }}</h3>
          <GovernanceCaseSeverityBadge
            :severity="record.severity"
            :label="severityLabelMap[record.severity] || record.severity"
          />
          <GovernanceCaseStatusBadge
            :status="record.status"
            :label="statusLabelMap[record.status] || record.status"
          />
        </div>
        <p class="text-sm text-slate-500">{{ record.title || '-' }}</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.riskScore || 'Risk score' }}</p>
        <p class="mt-1 text-3xl font-semibold text-slate-900">{{ record.riskScore ?? 0 }}</p>
        <p class="text-xs text-slate-500">{{ labels.severity || 'Severity' }}: {{ severityLabelMap[record.severity] || record.severity || '-' }}</p>
      </div>
    </div>

    <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.source || 'Source' }}</p>
        <p class="mt-1 text-sm font-semibold text-slate-900">{{ sourceLabelMap[record.sourceType] || record.sourceType || '-' }}</p>
        <p class="text-xs text-slate-500">{{ record.sourceReference || '-' }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.owner || 'Owner' }}</p>
        <p class="mt-1 text-sm font-semibold text-slate-900">{{ record.owner?.displayName || '-' }}</p>
        <p class="text-xs text-slate-500">{{ labels.reviewer || 'Reviewer' }}: {{ record.reviewer?.displayName || '-' }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.escalationOfficer || 'Escalation officer' }}</p>
        <p class="mt-1 text-sm font-semibold text-slate-900">{{ record.escalationOfficer?.displayName || '-' }}</p>
        <p class="text-xs text-slate-500">{{ labels.dueDate || 'Due date' }}: {{ record.dueDate || '-' }}</p>
      </div>
    </div>

    <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <div class="rounded-xl border border-slate-200 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.academicContext || 'Academic context' }}</p>
        <p class="mt-1 text-sm text-slate-700">
          {{ record.academicYear?.label || record.academicYear?.code || '-' }}
          <span class="text-slate-400">·</span>
          {{ record.term?.label || record.term?.name || record.term?.code || '-' }}
        </p>
        <p class="text-xs text-slate-500">{{ record.reportPeriod?.label || record.reportPeriod?.code || '-' }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.assignmentContext || 'Assignment context' }}</p>
        <p class="mt-1 text-sm text-slate-700">{{ record.class?.label || record.class?.name || '-' }}</p>
        <p class="text-xs text-slate-500">{{ record.student?.fullName || record.student?.name || '-' }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.statusSummary || 'Status summary' }}</p>
        <p class="mt-1 text-sm text-slate-700">{{ labels.createdBy || 'Created by' }}: {{ record.createdBy?.displayName || '-' }}</p>
        <p class="text-xs text-slate-500">{{ labels.updatedAt || 'Updated' }}: {{ formatDatetimeShort(record.updatedAt) }}</p>
      </div>
    </div>

    <div class="mt-4 grid gap-3 lg:grid-cols-2">
      <div class="rounded-xl border border-slate-200 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.summary || 'Summary' }}</p>
        <p class="mt-1 whitespace-pre-line text-sm text-slate-700">{{ record.summary || labels.noSummary || '-' }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.latestNote || 'Latest note' }}</p>
        <p class="mt-1 whitespace-pre-line text-sm text-slate-700">{{ record.latestNote || labels.noNotes || '-' }}</p>
      </div>
    </div>

    <div class="mt-4 grid gap-3 md:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.eventsCount || 'Events' }}</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ record.eventsCount ?? detail.summary?.eventCount ?? 0 }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.evidenceCount || 'Evidence' }}</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ record.evidenceCount ?? detail.summary?.evidenceCount ?? 0 }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.timelineCount || 'Timeline' }}</p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ detail.summary?.timelineCount ?? detail.timeline?.length ?? 0 }}</p>
      </div>
    </div>

    <div class="mt-4 grid gap-3 md:grid-cols-2">
      <div class="rounded-xl border border-slate-200 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.createdAt || 'Created at' }}</p>
        <p class="mt-1 text-sm text-slate-700">{{ formatDatetimeShort(record.createdAt) }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 p-3">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.resolutionTimeline || 'Resolution timeline' }}</p>
        <p class="mt-1 text-sm text-slate-700">{{ labels.resolvedAt || 'Resolved at' }}: {{ record.resolvedAt || '-' }}</p>
        <p class="text-xs text-slate-500">{{ labels.closedAt || 'Closed at' }}: {{ record.closedAt || '-' }}</p>
      </div>
    </div>

    <div v-if="record.sourceContext && Object.keys(record.sourceContext).length" class="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ labels.sourceContext || 'Source context' }}</p>
      <p class="mt-2 text-sm text-slate-700">{{ joinContext(record.sourceContext) || labels.noSourceContext || '-' }}</p>
      <pre class="mt-2 overflow-auto rounded-lg bg-white p-3 text-xs text-slate-600">{{ JSON.stringify(record.sourceContext, null, 2) }}</pre>
    </div>
  </div>
</template>
