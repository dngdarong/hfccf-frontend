<script setup>
// Keep snapshot details in a dedicated dialog so the archive page can inspect
// immutable payloads, comparisons, and audit context without mutating them.
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from '@/components/buttons/Button.vue'
import ReportSummaryCard from './ReportSummaryCard.vue'
import ReportSnapshotBadge from './ReportSnapshotBadge.vue'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  snapshot: {
    type: Object,
    default: null,
  },
  previousSnapshot: {
    type: Object,
    default: null,
  },
  comparison: {
    type: Object,
    default: null,
  },
  auditTrail: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:visible'])
const { t } = useLanguage()

const summaryCards = computed(() => {
  const summary = props.snapshot?.reportSummary || {}
  const attendance = props.snapshot?.attendanceSummary || {}
  const progress = props.snapshot?.progressSummary || {}

  return [
    {
      title: t('preschoolSnapshotArchivePage.cards.finalizedAssessments'),
      value: summary.finalizedAssessments ?? 0,
      caption: t('preschoolSnapshotArchivePage.cards.finalizedAssessmentsCaption'),
    },
    {
      title: t('preschoolSnapshotArchivePage.cards.averageScore'),
      value: summary.averageScore ?? '-',
      caption: t('preschoolSnapshotArchivePage.cards.averageScoreCaption'),
    },
    {
      title: t('preschoolSnapshotArchivePage.cards.attendanceCount'),
      value: attendance.attendanceCount ?? 0,
      caption: t('preschoolSnapshotArchivePage.cards.attendanceCountCaption'),
    },
    {
      title: t('preschoolSnapshotArchivePage.cards.studentCount'),
      value: progress.studentCount ?? summary.studentCount ?? 0,
      caption: t('preschoolSnapshotArchivePage.cards.studentCountCaption'),
    },
  ]
})

const categoryRows = computed(() => props.snapshot?.assessmentSummary?.categories || [])
const progressRows = computed(() => props.snapshot?.progressSummary?.studentSummaries || [])

function close() {
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :closable="true"
    class="w-[min(1200px,96vw)]"
    :header="t('preschoolSnapshotArchivePage.detail.title')"
    @update:visible="emit('update:visible', $event)"
  >
    <div v-if="loading" class="py-8 text-sm text-slate-500">
      {{ t('preschoolSnapshotArchivePage.loading') }}
    </div>

    <div v-else-if="!snapshot" class="py-8 text-sm text-slate-500">
      {{ t('preschoolSnapshotArchivePage.detail.empty') }}
    </div>

    <div v-else class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div class="space-y-2">
          <h3 class="text-base font-semibold text-slate-900">{{ snapshot.contextLabel || t('preschoolSnapshotArchivePage.detail.untitled') }}</h3>
          <p class="text-sm text-slate-500">
            {{ snapshot.student?.fullName || snapshot.class?.name || '-' }}
          </p>
        </div>
        <ReportSnapshotBadge
          :snapshot="snapshot"
          :source="snapshot.sourceStatus"
          :frozen="true"
          :generated-at="snapshot.generatedAt"
        />
      </div>

      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ReportSummaryCard
          v-for="card in summaryCards"
          :key="card.title"
          :title="card.title"
          :value="card.value"
          :caption="card.caption"
        />
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.detail.metadata') }}</h4>
          <div class="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div><span class="font-medium text-slate-900">{{ t('preschoolSnapshotArchivePage.labels.snapshotType') }}:</span> {{ snapshot.snapshotType }}</div>
            <div><span class="font-medium text-slate-900">{{ t('preschoolSnapshotArchivePage.labels.state') }}:</span> {{ t(`preschoolReportSnapshots.states.${snapshot.lifecycleState}`) || snapshot.lifecycleState }}</div>
            <div><span class="font-medium text-slate-900">{{ t('preschoolSnapshotArchivePage.labels.version') }}:</span> {{ snapshot.snapshotVersion }}</div>
            <div><span class="font-medium text-slate-900">{{ t('preschoolSnapshotArchivePage.labels.generatedAt') }}:</span> {{ snapshot.generatedAt || '-' }}</div>
            <div><span class="font-medium text-slate-900">{{ t('preschoolSnapshotArchivePage.labels.generatedBy') }}:</span> {{ snapshot.generatedBy?.displayName || snapshot.generatedBy?.username || '-' }}</div>
            <div><span class="font-medium text-slate-900">{{ t('preschoolSnapshotArchivePage.labels.source') }}:</span> {{ snapshot.sourceStatus || 'snapshot' }}</div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-4">
          <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.detail.context') }}</h4>
          <div class="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
            <div><span class="font-medium text-slate-900">{{ t('preschoolSnapshotArchivePage.labels.academicYear') }}:</span> {{ snapshot.academicYear?.label || snapshot.academicYear?.code || '-' }}</div>
            <div><span class="font-medium text-slate-900">{{ t('preschoolSnapshotArchivePage.labels.term') }}:</span> {{ snapshot.term?.name || snapshot.term?.code || '-' }}</div>
            <div><span class="font-medium text-slate-900">{{ t('preschoolSnapshotArchivePage.labels.reportPeriod') }}:</span> {{ snapshot.reportPeriod?.label || '-' }}</div>
            <div><span class="font-medium text-slate-900">{{ t('preschoolSnapshotArchivePage.labels.class') }}:</span> {{ snapshot.class?.name || '-' }}</div>
            <div><span class="font-medium text-slate-900">{{ t('preschoolSnapshotArchivePage.labels.student') }}:</span> {{ snapshot.student?.fullName || '-' }}</div>
            <div><span class="font-medium text-slate-900">{{ t('preschoolSnapshotArchivePage.labels.lockedAt') }}:</span> {{ snapshot.lockedAt || '-' }}</div>
          </div>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.attendanceSummary') }}</h4>
          <div class="mt-3 grid gap-2 text-sm text-slate-600">
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.attendanceCount') }}</span><strong class="text-slate-900">{{ snapshot.attendanceSummary?.attendanceCount ?? '-' }}</strong></div>
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.presentCount') }}</span><strong class="text-slate-900">{{ snapshot.attendanceSummary?.presentCount ?? '-' }}</strong></div>
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.lateCount') }}</span><strong class="text-slate-900">{{ snapshot.attendanceSummary?.lateCount ?? '-' }}</strong></div>
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.absentCount') }}</span><strong class="text-slate-900">{{ snapshot.attendanceSummary?.absentCount ?? '-' }}</strong></div>
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.excusedCount') }}</span><strong class="text-slate-900">{{ snapshot.attendanceSummary?.excusedCount ?? '-' }}</strong></div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.assessmentSummary') }}</h4>
          <div class="mt-3 grid gap-2 text-sm text-slate-600">
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.finalizedAssessments') }}</span><strong class="text-slate-900">{{ snapshot.reportSummary?.finalizedAssessments ?? '-' }}</strong></div>
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.averageScore') }}</span><strong class="text-slate-900">{{ snapshot.reportSummary?.averageScore ?? '-' }}</strong></div>
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.observationCount') }}</span><strong class="text-slate-900">{{ snapshot.reportSummary?.observationCount ?? '-' }}</strong></div>
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.categoryCount') }}</span><strong class="text-slate-900">{{ snapshot.assessmentSummary?.categoryCount ?? '-' }}</strong></div>
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.studentCount') }}</span><strong class="text-slate-900">{{ snapshot.progressSummary?.studentCount ?? snapshot.reportSummary?.studentCount ?? '-' }}</strong></div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.progressSummary') }}</h4>
          <div class="mt-3 grid gap-2 text-sm text-slate-600">
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.finalizedAssessments') }}</span><strong class="text-slate-900">{{ snapshot.progressSummary?.finalizedAssessments ?? '-' }}</strong></div>
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.averageScore') }}</span><strong class="text-slate-900">{{ snapshot.progressSummary?.averageScore ?? '-' }}</strong></div>
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.studentCount') }}</span><strong class="text-slate-900">{{ snapshot.progressSummary?.studentCount ?? '-' }}</strong></div>
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.observationCount') }}</span><strong class="text-slate-900">{{ snapshot.progressSummary?.observationCount ?? '-' }}</strong></div>
            <div class="flex items-center justify-between"><span>{{ t('preschoolSnapshotArchivePage.labels.source') }}</span><strong class="text-slate-900">{{ snapshot.sourceStatus || 'snapshot' }}</strong></div>
          </div>
        </div>
      </div>

      <div v-if="categoryRows.length" class="rounded-2xl border border-slate-200 bg-white p-4">
        <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.categoryBreakdown') }}</h4>
        <div class="mt-3 overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.category') }}</th>
                <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.count') }}</th>
                <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.averageScore') }}</th>
                <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.latestDate') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-for="item in categoryRows" :key="item.category?.id || item.category?.code || item.category?.name">
                <td class="px-4 py-3 text-slate-900">{{ item.category?.name || item.category?.code || '-' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ item.count ?? '-' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ item.averageScore ?? '-' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ item.latestAssessmentDate || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="progressRows.length" class="rounded-2xl border border-slate-200 bg-white p-4">
        <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.studentProgression') }}</h4>
        <div class="mt-3 overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.student') }}</th>
                <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.assessments') }}</th>
                <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.averageScore') }}</th>
                <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.attendanceCount') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
            <tr v-for="item in progressRows" :key="item.student?.id || item.student?.publicId || item.student?.studentCode || item.student?.fullName">
                <td class="px-4 py-3 text-slate-900">{{ item.student?.fullName || item.student?.publicId || item.student?.studentCode || '-' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ item.assessmentCount ?? '-' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ item.averageScore ?? '-' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ item.attendanceCount ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="comparison?.changes?.length" class="rounded-2xl border border-slate-200 bg-white p-4">
        <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.comparison') }}</h4>
        <p class="mt-1 text-sm text-slate-500">
          {{ t('preschoolSnapshotArchivePage.detail.comparisonSubtitle', { previous: previousSnapshot?.snapshotVersion || '-', current: snapshot.snapshotVersion }) }}
        </p>
        <div class="mt-3 overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.field') }}</th>
                <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.previous') }}</th>
                <th class="px-4 py-3">{{ t('preschoolSnapshotArchivePage.columns.current') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              <tr v-for="item in comparison.changes" :key="item.field">
                <td class="px-4 py-3 text-slate-900">{{ item.field }}</td>
                <td class="px-4 py-3 text-slate-600">{{ item.previous ?? '-' }}</td>
                <td class="px-4 py-3 text-slate-600">{{ item.current ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4">
        <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolSnapshotArchivePage.sections.auditTrail') }}</h4>
        <div class="mt-3 space-y-2">
          <div
            v-for="item in auditTrail"
            :key="item.id"
            class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
          >
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="font-medium text-slate-900">{{ item.actionType }}</p>
              <p class="text-xs text-slate-500">{{ item.createdAt || '-' }}</p>
            </div>
            <p class="mt-1 text-xs text-slate-500">
              {{ item.actorRole || '-' }} | {{ item.entityType }} #{{ item.entityId || '-' }}
            </p>
            <p v-if="item.lockReason || item.overrideReason" class="mt-1 text-xs text-slate-500">
              {{ item.lockReason || item.overrideReason }}
            </p>
          </div>
          <p v-if="!auditTrail.length" class="text-sm text-slate-500">
            {{ t('preschoolSnapshotArchivePage.detail.emptyAudit') }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <Button type="button" variant="ghost" size="md" rounded="xl" @click="close">
        {{ t('preschoolSnapshotArchivePage.actions.close') }}
      </Button>
    </template>
  </Dialog>
</template>
