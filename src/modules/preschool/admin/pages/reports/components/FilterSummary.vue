<script setup>
import { computed } from 'vue'

const props = defineProps({
  academicYearLabel: {
    type: String,
    default: '',
  },
  classLabel: {
    type: String,
    default: '',
  },
  reportPeriod: {
    type: String,
    default: 'monthly',
  },
  monthLabel: {
    type: String,
    default: '',
  },
  year: {
    type: [Number, String],
    default: '',
  },
})

const emit = defineEmits(['clear-filters'])

const activeFiltersCount = computed(() => {
  let count = 0
  if (props.academicYearLabel) count++
  if (props.classLabel) count++
  if (props.monthLabel && props.reportPeriod === 'monthly') count++
  if (props.year) count++
  return count
})

const hasFilters = computed(() => activeFiltersCount.value > 0)
</script>

<template>
  <div v-if="hasFilters" class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <span v-if="academicYearLabel" class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {{ academicYearLabel }}
        </span>
        <span v-if="classLabel" class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {{ classLabel }}
        </span>
        <span v-if="reportPeriod === 'monthly' && monthLabel" class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {{ monthLabel }}
        </span>
        <span v-if="year" class="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {{ year }}
        </span>
      </div>
      <button
        type="button"
        @click="emit('clear-filters')"
        class="text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        Clear
      </button>
    </div>
  </div>
</template>
