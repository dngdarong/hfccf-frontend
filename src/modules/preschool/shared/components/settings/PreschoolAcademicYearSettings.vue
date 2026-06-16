<script setup>
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'
import PreschoolSettingsSectionCard from './PreschoolSettingsSectionCard.vue'

// Keep academic-year inputs isolated so the parent can manage the shared
// settings snapshot while this component focuses on the yearly configuration.
defineOptions({
  name: 'PreschoolAcademicYearSettings',
})

const { t } = useLanguage()

defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue'])

function updateField(field, value) {
  emit('update:modelValue', {
    ...field.model,
    [field.key]: value,
  })
}
</script>

<template>
  <PreschoolSettingsSectionCard
    :eyebrow="t('preschoolSettingsPage.sections.academicYear.eyebrow')"
    :title="t('preschoolSettingsPage.sections.academicYear.title')"
    :subtitle="t('preschoolSettingsPage.sections.academicYear.subtitle')"
  >
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <label class="preschool-settings-field xl:col-span-2">
        <span>{{ t('preschoolSettingsPage.fields.currentAcademicYear') }}</span>
        <input
          :value="modelValue.currentAcademicYear"
          type="text"
          class="preschool-settings-input"
          :placeholder="t('preschoolSettingsPage.placeholders.currentAcademicYear')"
          @input="updateField({ model: modelValue, key: 'currentAcademicYear' }, $event.target.value)"
        />
        <small v-if="errors.currentAcademicYear" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.currentAcademicYear}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.status') }}</span>
        <Select
          :model-value="modelValue.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.status')"
          @update:model-value="updateField({ model: modelValue, key: 'status' }, $event)"
        />
        <small v-if="errors.status" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.status}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.startDate') }}</span>
        <DatePicker
          :model-value="modelValue.startDate"
          date-format="yy-mm-dd"
          show-icon
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.startDate')"
          @update:model-value="updateField({ model: modelValue, key: 'startDate' }, $event)"
        />
        <small v-if="errors.startDate" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.startDate}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.endDate') }}</span>
        <DatePicker
          :model-value="modelValue.endDate"
          date-format="yy-mm-dd"
          show-icon
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.endDate')"
          @update:model-value="updateField({ model: modelValue, key: 'endDate' }, $event)"
        />
        <small v-if="errors.endDate" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.endDate}`) }}</small>
      </label>
    </div>
  </PreschoolSettingsSectionCard>
</template>

<style scoped>
.preschool-settings-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.preschool-settings-field > span {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
}

.preschool-settings-input {
  width: 100%;
  min-height: 2.75rem;
  border-radius: 0.9rem;
  border: 1px solid #d7e0ea;
  background: #fff;
  padding: 0.7rem 0.9rem;
  color: #0f172a;
}
</style>