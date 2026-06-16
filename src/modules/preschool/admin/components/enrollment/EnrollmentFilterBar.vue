<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'EnrollmentFilterBar' })

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  academicYears: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'clear'])
const { t } = useI18n()

const filters = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function patch(key, val) {
  emit('update:modelValue', { ...props.modelValue, [key]: val })
}

const STATUS_OPTIONS = [
  { label: t('preschoolEnrollmentPage.filters.allStatuses'), value: '' },
  { label: t('preschoolEnrollmentPage.statuses.draft'), value: 'draft' },
  { label: t('preschoolEnrollmentPage.statuses.submitted'), value: 'submitted' },
  { label: t('preschoolEnrollmentPage.statuses.under_review'), value: 'under_review' },
  { label: t('preschoolEnrollmentPage.statuses.approved'), value: 'approved' },
  { label: t('preschoolEnrollmentPage.statuses.waitlisted'), value: 'waitlisted' },
  { label: t('preschoolEnrollmentPage.statuses.rejected'), value: 'rejected' },
  { label: t('preschoolEnrollmentPage.statuses.enrolled'), value: 'enrolled' },
  { label: t('preschoolEnrollmentPage.statuses.cancelled'), value: 'cancelled' },
]
</script>

<template>
  <div class="enr-filters">
    <input
      class="enr-filters__search"
      type="search"
      :placeholder="t('preschoolEnrollmentPage.filters.searchPlaceholder')"
      :value="filters.search"
      @input="patch('search', $event.target.value)"
    />

    <select
      class="enr-filters__select"
      :value="filters.status"
      @change="patch('status', $event.target.value)"
    >
      <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>

    <select
      class="enr-filters__select"
      :value="filters.academicYearId"
      @change="patch('academicYearId', $event.target.value)"
    >
      <option value="">{{ t('preschoolEnrollmentPage.filters.allYears') }}</option>
      <option v-for="yr in academicYears" :key="yr.id" :value="yr.id">{{ yr.label }}</option>
    </select>

    <button class="enr-filters__clear" @click="emit('clear')">
      {{ t('preschoolEnrollmentPage.filters.clearFilters') }}
    </button>
  </div>
</template>

<style scoped>
.enr-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.enr-filters__search {
  flex: 1 1 220px;
  padding: 0.55rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.6rem;
  font-size: 0.875rem;
  outline: none;
  background: #fff;
}

.enr-filters__search:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }

.enr-filters__select {
  padding: 0.55rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.6rem;
  font-size: 0.875rem;
  background: #fff;
  cursor: pointer;
  outline: none;
}

.enr-filters__select:focus { border-color: #6366f1; }

.enr-filters__clear {
  padding: 0.55rem 1.1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: background 0.15s;
}

.enr-filters__clear:hover { background: #f1f5f9; color: #334155; }
</style>
