<script setup>
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: '',
  },
  subtitle: {
    type: String,
    default: '',
  },
  contextTypeOptions: {
    type: Array,
    default: () => [],
  },
  snapshotOptions: {
    type: Array,
    default: () => [],
  },
  exportOptions: {
    type: Array,
    default: () => [],
  },
  academicYearOptions: {
    type: Array,
    default: () => [],
  },
  termOptions: {
    type: Array,
    default: () => [],
  },
  reportPeriodOptions: {
    type: Array,
    default: () => [],
  },
  classOptions: {
    type: Array,
    default: () => [],
  },
  studentOptions: {
    type: Array,
    default: () => [],
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

const context = computed(() => ({
  contextType: 'reconstruction',
  snapshotId: '',
  exportRecordId: '',
  academicYearId: '',
  termId: '',
  reportPeriodId: '',
  classId: '',
  studentId: '',
  search: '',
  ...props.modelValue,
}))

function updateField(field, value) {
  emit('update:modelValue', {
    ...context.value,
    [field]: value,
  })
}

function isContext(type) {
  return context.value.contextType === type
}

const showTerm = computed(() => ['reconstruction', 'academic_year', 'term', 'report_period', 'class', 'student', 'system'].includes(context.value.contextType))
const showReportPeriod = computed(() => ['reconstruction', 'report_period', 'class', 'student', 'system'].includes(context.value.contextType))
const showClass = computed(() => ['reconstruction', 'class', 'student', 'system'].includes(context.value.contextType))
const showStudent = computed(() => ['reconstruction', 'student', 'system'].includes(context.value.contextType))

const defaultLabels = computed(() => ({
  contextType: 'Context type',
  snapshot: 'Snapshot',
  export: 'Export',
  academicYear: 'Academic year',
  term: 'Term',
  reportPeriod: 'Report period',
  class: 'Class',
  student: 'Student',
  search: 'Search',
  searchPlaceholder: 'Optional search keyword',
  ...props.labels,
}))
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="space-y-1">
      <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
      <p class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>

    <div class="mt-4 space-y-4">
      <label class="space-y-2 text-sm">
        <span class="font-medium text-slate-700">{{ defaultLabels.contextType }}</span>
        <Select
          :model-value="context.contextType"
          :options="contextTypeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          @update:model-value="updateField('contextType', $event)"
        />
      </label>

      <div v-if="isContext('snapshot')" class="space-y-2">
        <label class="space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ defaultLabels.snapshot }}</span>
          <Select
            :model-value="context.snapshotId"
            :options="snapshotOptions"
            option-label="label"
            option-value="value"
            class="w-full"
            @update:model-value="updateField('snapshotId', $event)"
          />
        </label>
      </div>

      <div v-else-if="isContext('export')" class="space-y-2">
        <label class="space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ defaultLabels.export }}</span>
          <Select
            :model-value="context.exportRecordId"
            :options="exportOptions"
            option-label="label"
            option-value="value"
            class="w-full"
            @update:model-value="updateField('exportRecordId', $event)"
          />
        </label>
      </div>

      <div v-else class="grid gap-3 lg:grid-cols-2">
        <label class="space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ defaultLabels.academicYear }}</span>
          <Select
            :model-value="context.academicYearId"
            :options="academicYearOptions"
            option-label="label"
            option-value="value"
            class="w-full"
            @update:model-value="updateField('academicYearId', $event)"
          />
        </label>
        <label v-if="showTerm" class="space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ defaultLabels.term }}</span>
          <Select
            :model-value="context.termId"
            :options="termOptions"
            option-label="label"
            option-value="value"
            class="w-full"
            @update:model-value="updateField('termId', $event)"
          />
        </label>
        <label v-if="showReportPeriod" class="space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ defaultLabels.reportPeriod }}</span>
          <Select
            :model-value="context.reportPeriodId"
            :options="reportPeriodOptions"
            option-label="label"
            option-value="value"
            class="w-full"
            @update:model-value="updateField('reportPeriodId', $event)"
          />
        </label>
        <label v-if="showClass" class="space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ defaultLabels.class }}</span>
          <Select
            :model-value="context.classId"
            :options="classOptions"
            option-label="label"
            option-value="value"
            class="w-full"
            @update:model-value="updateField('classId', $event)"
          />
        </label>
        <label v-if="showStudent" class="space-y-2 text-sm">
          <span class="font-medium text-slate-700">{{ defaultLabels.student }}</span>
          <Select
            :model-value="context.studentId"
            :options="studentOptions"
            option-label="label"
            option-value="value"
            class="w-full"
            @update:model-value="updateField('studentId', $event)"
          />
        </label>
      </div>

      <label class="space-y-2 text-sm">
        <span class="font-medium text-slate-700">{{ defaultLabels.search }}</span>
        <InputText
          :model-value="context.search"
          class="w-full"
          :placeholder="defaultLabels.searchPlaceholder"
          @update:model-value="updateField('search', $event)"
        />
      </label>
    </div>
  </div>
</template>
