<script setup>
import { computed, ref } from 'vue'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import { useLanguage } from '@/composables/useLanguage'
import { PRESCHOOL_ASSESSMENT_PERIOD_OPTIONS, PRESCHOOL_ASSESSMENT_STATUS_OPTIONS } from '@/modules/preschool/admin/pages/assessments/constants/preschoolAssessmentWorkspace'

defineOptions({
  name: 'AssessmentFilterBar',
})

const props = defineProps({
  studentFilter: {
    type: [String, Number],
    default: null,
  },
  classFilter: {
    type: [String, Number],
    default: null,
  },
  categoryFilter: {
    type: [String, Number],
    default: null,
  },
  periodFilter: {
    type: String,
    default: null,
  },
  statusFilter: {
    type: String,
    default: 'all',
  },
  searchFilter: {
    type: String,
    default: '',
  },
  dateFromFilter: {
    type: String,
    default: null,
  },
  dateToFilter: {
    type: String,
    default: null,
  },
  studentOptions: {
    type: Array,
    required: true,
  },
  classOptions: {
    type: Array,
    required: true,
  },
  categoryOptions: {
    type: Array,
    required: true,
  },
  activeFilterCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits([
  'update:studentFilter',
  'update:classFilter',
  'update:categoryFilter',
  'update:periodFilter',
  'update:statusFilter',
  'update:searchFilter',
  'update:dateFromFilter',
  'update:dateToFilter',
  'clear-all',
])

const showAdvanced = ref(false)

const { t } = useLanguage()

const localizedOptions = options => options.map(option => ({
  ...option,
  label: option.labelKey ? t(option.labelKey) : option.label,
}))

const statusOptions = computed(() => localizedOptions(PRESCHOOL_ASSESSMENT_STATUS_OPTIONS))
const periodOptions = computed(() => localizedOptions(PRESCHOOL_ASSESSMENT_PERIOD_OPTIONS))

const hasAdvancedFilters = computed(() => showAdvanced.value || props.activeFilterCount > 0)
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-slate-900">{{ t('assessmentList.filters.title') }}</h3>
        <p class="text-xs text-slate-500">{{ t('assessmentList.filters.description') }}</p>
      </div>

      <div class="flex items-center gap-2">
        <span
          v-if="activeFilterCount > 0"
          class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
        >
          {{ activeFilterCount }}
          <span v-if="activeFilterCount === 1">{{ t('assessmentList.filters.activeFilter') }}</span>
          <span v-else>{{ t('assessmentList.filters.activeFilters') }}</span>
        </span>

        <button
          type="button"
          class="text-xs font-medium text-slate-600 transition hover:text-slate-900"
          @click="showAdvanced = !showAdvanced"
        >
          {{ showAdvanced ? t('assessmentList.filters.hideFilters') : t('assessmentList.filters.moreFilters') }}
        </button>

        <button
          v-if="activeFilterCount > 0"
          type="button"
          class="text-xs font-medium text-slate-600 transition hover:text-slate-900"
          @click="emit('clear-all')"
        >
          {{ t('assessmentList.filters.clearAll') }}
        </button>
      </div>
    </div>

    <div class="mt-4 grid gap-3 lg:grid-cols-3">
      <div class="space-y-1">
        <label class="text-xs font-medium text-slate-700">{{ t('assessmentList.filters.search') }}</label>
        <InputText
          :model-value="searchFilter"
          :placeholder="t('assessmentList.filters.searchPlaceholder')"
          class="w-full"
          @update:model-value="emit('update:searchFilter', $event)"
        />
      </div>

      <div class="space-y-1">
        <label class="text-xs font-medium text-slate-700">{{ t('assessmentList.filters.statusLabel') }}</label>
        <Select
          :model-value="statusFilter"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          @update:model-value="emit('update:statusFilter', $event)"
        />
      </div>

      <div class="flex items-end">
        <button
          type="button"
          class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          @click="showAdvanced = !showAdvanced"
        >
          {{ showAdvanced ? t('assessmentList.filters.hideAdvanced') : t('assessmentList.filters.showAdvanced') }}
        </button>
      </div>
    </div>

    <div
      v-if="hasAdvancedFilters"
      class="mt-4 border-t border-slate-200 pt-4"
    >
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-700">{{ t('assessmentList.filters.student') }}</label>
          <Select
            :model-value="studentFilter"
            :options="studentOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('assessmentList.filters.studentAll')"
            show-clear
            filter
            class="w-full"
            @update:model-value="emit('update:studentFilter', $event)"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-700">{{ t('assessmentList.filters.class') }}</label>
          <Select
            :model-value="classFilter"
            :options="classOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('assessmentList.filters.classAll')"
            show-clear
            class="w-full"
            @update:model-value="emit('update:classFilter', $event)"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-700">{{ t('assessmentList.filters.category') }}</label>
          <Select
            :model-value="categoryFilter"
            :options="categoryOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('assessmentList.filters.categoryAll')"
            show-clear
            class="w-full"
            @update:model-value="emit('update:categoryFilter', $event)"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-700">{{ t('assessmentList.filters.periodLabel') }}</label>
          <Select
            :model-value="periodFilter"
            :options="periodOptions"
            option-label="label"
            option-value="value"
            :placeholder="t('assessmentList.filters.periodAll')"
            show-clear
            class="w-full"
            @update:model-value="emit('update:periodFilter', $event)"
          />
        </div>
      </div>

      <div class="mt-3 grid gap-3 md:grid-cols-2">
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-700">{{ t('assessmentList.filters.dateFrom') }}</label>
          <InputText
            :model-value="dateFromFilter"
            type="date"
            class="w-full"
            @update:model-value="emit('update:dateFromFilter', $event)"
          />
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-700">{{ t('assessmentList.filters.dateTo') }}</label>
          <InputText
            :model-value="dateToFilter"
            type="date"
            class="w-full"
            @update:model-value="emit('update:dateToFilter', $event)"
          />
        </div>
      </div>
    </div>
  </section>
</template>
