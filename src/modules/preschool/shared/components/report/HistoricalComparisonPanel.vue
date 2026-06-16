<script setup>
// Historical comparison stays read-only and snapshot-bound so leadership can
// compare institutional outputs without mixing live recalculation into frozen
// report history.
import { computed, ref, watch } from 'vue'
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import { useLanguage } from '@/composables/useLanguage'

const props = defineProps({
  options: {
    type: Object,
    default: () => ({}),
  },
  academicYears: {
    type: Array,
    default: () => [],
  },
  terms: {
    type: Array,
    default: () => [],
  },
  reportPeriods: {
    type: Array,
    default: () => [],
  },
  classes: {
    type: Array,
    default: () => [],
  },
  students: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  result: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['compare'])
const { t } = useLanguage()

const mode = ref('report_period_vs_report_period')
const leftContextId = ref('')
const rightContextId = ref('')
const leftSnapshotId = ref('')
const leftSnapshotVersion = ref('')
const rightSnapshotId = ref('')
const rightSnapshotVersion = ref('')

const modeOptions = computed(() => (props.options.comparisonModes || []).map((item) => ({
  label: modeLabel(item.value || item),
  value: item.value || item,
})))

const metricGroupOptions = computed(() => (props.options.metricGroups || []).map((item) => ({
  label: metricGroupLabel(item.value || item),
  value: item.value || item,
})))

watch(mode, () => {
  leftContextId.value = ''
  rightContextId.value = ''
  leftSnapshotId.value = ''
  leftSnapshotVersion.value = ''
  rightSnapshotId.value = ''
  rightSnapshotVersion.value = ''
})

function modeLabel(value) {
  const labels = {
    term_vs_term: t('preschoolExportGovernancePage.comparisonModes.termVsTerm'),
    academic_year_vs_academic_year: t('preschoolExportGovernancePage.comparisonModes.academicYearVsAcademicYear'),
    report_period_vs_report_period: t('preschoolExportGovernancePage.comparisonModes.reportPeriodVsReportPeriod'),
    class_vs_class: t('preschoolExportGovernancePage.comparisonModes.classVsClass'),
    student_progression: t('preschoolExportGovernancePage.comparisonModes.studentProgression'),
    snapshot_version_vs_version: t('preschoolExportGovernancePage.comparisonModes.snapshotVersionVsVersion'),
  }

  return labels[value] || value
}

function metricGroupLabel(value) {
  const labels = {
    overview: t('preschoolExportGovernancePage.metricGroups.overview'),
    attendance: t('preschoolExportGovernancePage.metricGroups.attendance'),
    assessment: t('preschoolExportGovernancePage.metricGroups.assessment'),
    progress: t('preschoolExportGovernancePage.metricGroups.progress'),
  }

  return labels[value] || value
}

function contextLabel(item) {
  if (!item || typeof item !== 'object') {
    return '-'
  }

  return item.label || item.name || item.periodLabel || item.code || item.displayName || item.fullName || `#${item.id || '-'}`
}

function optionList() {
  const source = (() => {
    switch (mode.value) {
      case 'term_vs_term':
        return props.terms
      case 'academic_year_vs_academic_year':
        return props.academicYears
      case 'class_vs_class':
        return props.classes
      case 'student_progression':
        return props.students
      case 'snapshot_version_vs_version':
        return []
      case 'report_period_vs_report_period':
      default:
        return props.reportPeriods
    }
  })()

  return source.map((item) => ({
    ...item,
    id: item.id ?? item.value ?? '',
    label: contextLabel(item),
  }))
}

function buildContextPayload(side) {
  if (mode.value === 'snapshot_version_vs_version') {
    return {
      snapshot_id: side === 'left' ? leftSnapshotId.value || '' : rightSnapshotId.value || '',
      snapshot_version: side === 'left' ? leftSnapshotVersion.value || '' : rightSnapshotVersion.value || '',
    }
  }

  const keyMap = {
    term_vs_term: 'term_id',
    academic_year_vs_academic_year: 'academic_year_id',
    report_period_vs_report_period: 'report_period_id',
    class_vs_class: 'class_id',
    student_progression: 'student_id',
  }

  return {
    [keyMap[mode.value] || 'report_period_id']: side === 'left' ? leftContextId.value || '' : rightContextId.value || '',
  }
}

function submitComparison() {
  emit('compare', {
    comparisonMode: mode.value,
    leftContext: buildContextPayload('left'),
    rightContext: buildContextPayload('right'),
  })
}

function comparisonFieldLabel() {
  switch (mode.value) {
    case 'term_vs_term':
      return t('preschoolExportGovernancePage.comparisonFields.term')
    case 'academic_year_vs_academic_year':
      return t('preschoolExportGovernancePage.comparisonFields.academicYear')
    case 'class_vs_class':
      return t('preschoolExportGovernancePage.comparisonFields.class')
    case 'student_progression':
      return t('preschoolExportGovernancePage.comparisonFields.student')
    case 'snapshot_version_vs_version':
      return t('preschoolExportGovernancePage.comparisonFields.snapshotVersion')
    case 'report_period_vs_report_period':
    default:
      return t('preschoolExportGovernancePage.comparisonFields.reportPeriod')
  }
}

function comparisonSummaryText(side) {
  if (mode.value === 'snapshot_version_vs_version') {
    return `${side === 'left' ? leftSnapshotId.value || '-' : rightSnapshotId.value || '-'} / ${side === 'left' ? leftSnapshotVersion.value || '-' : rightSnapshotVersion.value || '-'}`
  }

  const selectedId = side === 'left' ? leftContextId.value : rightContextId.value
  const selected = optionList().find((item) => String(item.id ?? item.value ?? '') === String(selectedId || ''))

  return contextLabel(selected)
}

function metricDeltaLabel(metric) {
  if (metric.delta === null || metric.delta === undefined) {
    return '-'
  }

  const value = Number(metric.delta)
  return `${value > 0 ? '+' : ''}${value}`
}

function metricLabel(metricKey) {
  const labels = {
    snapshotCount: 'Snapshot count',
    attendanceCount: t('preschoolExportGovernancePage.detail.attendance'),
    absenceRate: 'Absence rate',
    finalizedAssessments: 'Finalized assessments',
    averageScore: t('preschoolExportGovernancePage.detail.averageScore'),
    observationCount: 'Observation count',
    studentCount: 'Student count',
  }

  return labels[metricKey] || metricKey
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolExportGovernancePage.comparison.title') }}</h3>
        <p class="text-sm text-slate-500">{{ t('preschoolExportGovernancePage.comparison.subtitle') }}</p>
      </div>
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-2">
      <div class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div class="grid gap-3 md:grid-cols-2">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.comparison.fields.mode') }}</span>
            <Select v-model="mode" :options="modeOptions" option-label="label" option-value="value" class="w-full" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.comparison.fields.metricGroup') }}</span>
            <Select :options="metricGroupOptions" option-label="label" option-value="value" class="w-full" disabled />
          </label>
        </div>

        <div v-if="mode === 'snapshot_version_vs_version'" class="grid gap-3 md:grid-cols-2">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.comparison.fields.leftSnapshotId') }}</span>
            <InputText v-model="leftSnapshotId" class="w-full" />
            <InputText v-model="leftSnapshotVersion" class="w-full" :placeholder="t('preschoolExportGovernancePage.comparison.fields.snapshotVersionPlaceholder')" />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ t('preschoolExportGovernancePage.comparison.fields.rightSnapshotId') }}</span>
            <InputText v-model="rightSnapshotId" class="w-full" />
            <InputText v-model="rightSnapshotVersion" class="w-full" :placeholder="t('preschoolExportGovernancePage.comparison.fields.snapshotVersionPlaceholder')" />
          </label>
        </div>

        <div v-else class="grid gap-3 md:grid-cols-2">
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ comparisonFieldLabel() }} A</span>
            <Select
              v-model="leftContextId"
              :options="optionList()"
              option-label="label"
              option-value="id"
              class="w-full"
            />
          </label>
          <label class="space-y-2 text-sm">
            <span class="font-medium text-slate-700">{{ comparisonFieldLabel() }} B</span>
            <Select
              v-model="rightContextId"
              :options="optionList()"
              option-label="label"
              option-value="id"
              class="w-full"
            />
          </label>
        </div>

        <div class="flex justify-end">
          <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" @click="submitComparison">
            {{ t('preschoolExportGovernancePage.actions.compareContexts') }}
          </Button>
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="result?.metrics?.length" class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div v-for="metric in result.metrics" :key="metric.metric" class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p class="text-xs uppercase tracking-wide text-slate-500">{{ metricLabel(metric.metric) }}</p>
            <div class="mt-2 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p class="text-slate-500">{{ t('preschoolExportGovernancePage.comparison.left') }}</p>
                <p class="font-medium text-slate-900">{{ metric.left ?? '-' }}</p>
              </div>
              <div>
                <p class="text-slate-500">{{ t('preschoolExportGovernancePage.comparison.delta') }}</p>
                <p class="font-medium text-slate-900">{{ metricDeltaLabel(metric) }}</p>
              </div>
              <div>
                <p class="text-slate-500">{{ t('preschoolExportGovernancePage.comparison.right') }}</p>
                <p class="font-medium text-slate-900">{{ metric.right ?? '-' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="result?.trend?.left || result?.trend?.right" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolExportGovernancePage.comparison.trendTitle') }}</h4>
          <div class="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolExportGovernancePage.comparison.left') }}</p>
              <p class="mt-1 text-sm text-slate-600">{{ comparisonSummaryText('left') }}</p>
              <p class="mt-2 text-xs text-slate-500">{{ JSON.stringify(result?.trend?.left || [], null, 0) }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolExportGovernancePage.comparison.right') }}</p>
              <p class="mt-1 text-sm text-slate-600">{{ comparisonSummaryText('right') }}</p>
              <p class="mt-2 text-xs text-slate-500">{{ JSON.stringify(result?.trend?.right || [], null, 0) }}</p>
            </div>
          </div>
        </div>

        <div v-if="result?.left || result?.right" class="rounded-2xl border border-slate-200 bg-white p-4">
          <h4 class="text-sm font-semibold text-slate-900">{{ t('preschoolExportGovernancePage.comparison.summaryTitle') }}</h4>
          <div class="mt-3 grid gap-4 md:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolExportGovernancePage.comparison.left') }}</p>
              <p class="mt-1 text-sm font-medium text-slate-900">{{ result.left?.context || '-' }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ t('preschoolExportGovernancePage.comparison.right') }}</p>
              <p class="mt-1 text-sm font-medium text-slate-900">{{ result.right?.context || '-' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
