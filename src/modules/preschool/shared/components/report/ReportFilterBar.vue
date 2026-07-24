<script setup>
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from '@/components/buttons/Button.vue'

defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  labels: {
    type: Object,
    default: () => ({
      academicYear: 'Academic Year',
      term: 'Term',
      reportPeriod: 'Report Period',
      dateFrom: 'Date From',
      dateTo: 'Date To',
      class: 'Class',
      student: 'Student',
      teacher: 'Teacher',
      status: 'Status',
      apply: 'Apply Filters',
      reset: 'Reset',
    }),
  },
  visibleFilters: {
    type: Array,
    default: () => ['academicYear', 'term', 'dateRange', 'class', 'teacher', 'status'],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'apply', 'reset'])

function onUpdateField(key, value, modelValue) {
  emit('update:modelValue', {
    ...modelValue,
    [key]: value,
  })
}

function applyFilters() {
  emit('apply')
}

function resetFilters() {
  emit('reset')
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <label v-if="visibleFilters.includes('academicYear')" class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ labels.academicYear }}</span>
        <Select
          :model-value="modelValue.academicYearId"
          :options="options.academicYears || []"
          option-label="label"
          option-value="value"
          class="w-full"
          @update:model-value="(value) => onUpdateField('academicYearId', value, modelValue)"
        />
      </label>

      <label v-if="visibleFilters.includes('term')" class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ labels.term }}</span>
        <Select
          :model-value="modelValue.termId"
          :options="options.terms || []"
          option-label="label"
          option-value="value"
          class="w-full"
          @update:model-value="(value) => onUpdateField('termId', value, modelValue)"
        />
      </label>

      <label v-if="visibleFilters.includes('reportPeriod')" class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ labels.reportPeriod }}</span>
        <Select
          :model-value="modelValue.reportPeriodId"
          :options="options.reportPeriods || []"
          option-label="label"
          option-value="value"
          class="w-full"
          @update:model-value="(value) => onUpdateField('reportPeriodId', value, modelValue)"
        />
      </label>

      <template v-if="visibleFilters.includes('dateRange')">
        <label class="space-y-2 text-sm font-medium text-slate-700">
          <span>{{ labels.dateFrom }}</span>
          <InputText
            :model-value="modelValue.dateFrom"
            type="date"
            class="w-full"
            @update:model-value="(value) => onUpdateField('dateFrom', value, modelValue)"
          />
        </label>
        <label class="space-y-2 text-sm font-medium text-slate-700">
          <span>{{ labels.dateTo }}</span>
          <InputText
            :model-value="modelValue.dateTo"
            type="date"
            class="w-full"
            @update:model-value="(value) => onUpdateField('dateTo', value, modelValue)"
          />
        </label>
      </template>

      <label v-if="visibleFilters.includes('class')" class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ labels.class }}</span>
        <Select
          :model-value="modelValue.classId"
          :options="options.classes || []"
          option-label="label"
          option-value="value"
          class="w-full"
          @update:model-value="(value) => onUpdateField('classId', value, modelValue)"
        />
      </label>

      <label v-if="visibleFilters.includes('student')" class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ labels.student }}</span>
        <Select
          :model-value="modelValue.studentId"
          :options="options.students || []"
          option-label="label"
          option-value="value"
          class="w-full"
          @update:model-value="(value) => onUpdateField('studentId', value, modelValue)"
        />
      </label>

      <label v-if="visibleFilters.includes('teacher')" class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ labels.teacher }}</span>
        <Select
          :model-value="modelValue.teacherId"
          :options="options.teachers || []"
          option-label="label"
          option-value="value"
          class="w-full"
          @update:model-value="(value) => onUpdateField('teacherId', value, modelValue)"
        />
      </label>

      <label v-if="visibleFilters.includes('status')" class="space-y-2 text-sm font-medium text-slate-700">
        <span>{{ labels.status }}</span>
        <Select
          :model-value="modelValue.status"
          :options="options.statuses || []"
          option-label="label"
          option-value="value"
          class="w-full"
          @update:model-value="(value) => onUpdateField('status', value, modelValue)"
        />
      </label>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" @click="applyFilters">
        {{ labels.apply }}
      </Button>
      <Button type="button" variant="ghost" size="md" rounded="xl" :disabled="loading" @click="resetFilters">
        {{ labels.reset }}
      </Button>
    </div>
  </div>
</template>
