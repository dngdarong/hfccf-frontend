<script setup>
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import PreschoolSettingsSectionCard from './PreschoolSettingsSectionCard.vue'
import { useLanguage } from '@/composables/useLanguage'

// Schedule settings stay isolated because timetable behavior needs a separate
// configuration surface from class setup and attendance entry.
defineOptions({
  name: 'PreschoolScheduleConfiguration',
})

const { t } = useLanguage()

defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  weeklyModeOptions: {
    type: Array,
    default: () => [],
  },
  planningWindowOptions: {
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
    :eyebrow="t('preschoolSettingsPage.sections.schedule.eyebrow')"
    :title="t('preschoolSettingsPage.sections.schedule.title')"
    :subtitle="t('preschoolSettingsPage.sections.schedule.subtitle')"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.weeklyMode') }}</span>
        <Select
          :model-value="modelValue.weeklyMode"
          :options="weeklyModeOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.weeklyMode')"
          @update:model-value="updateField({ model: modelValue, key: 'weeklyMode' }, $event)"
        />
        <small v-if="errors.weeklyMode" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.weeklyMode}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.defaultSlotMinutes') }}</span>
        <InputNumber
          :model-value="modelValue.defaultSlotMinutes"
          :min="1"
          class="preschool-settings-number"
          :placeholder="t('preschoolSettingsPage.placeholders.defaultSlotMinutes')"
          @update:model-value="updateField({ model: modelValue, key: 'defaultSlotMinutes' }, $event)"
        />
        <small v-if="errors.defaultSlotMinutes" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.defaultSlotMinutes}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.planningWindow') }}</span>
        <Select
          :model-value="modelValue.planningWindow"
          :options="planningWindowOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.planningWindow')"
          @update:model-value="updateField({ model: modelValue, key: 'planningWindow' }, $event)"
        />
        <small v-if="errors.planningWindow" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.planningWindow}`) }}</small>
      </label>

      <div
        class="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
        :class="errors.allowTeacherOverrides ? 'border-rose-300' : ''"
      >
        <div class="space-y-0.5">
          <p class="text-sm font-semibold text-slate-800">{{ t('preschoolSettingsPage.fields.allowTeacherOverrides') }}</p>
          <p class="text-xs text-slate-500">{{ t('preschoolSettingsPage.help.allowTeacherOverrides') }}</p>
        </div>
        <ToggleSwitch
          :model-value="modelValue.allowTeacherOverrides"
          @update:model-value="updateField({ model: modelValue, key: 'allowTeacherOverrides' }, $event)"
        />
      </div>
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

:deep(.preschool-settings-number) {
  width: 100%;
}

:deep(.preschool-settings-number .p-inputnumber-input) {
  width: 100%;
  min-height: 2.75rem;
  border-radius: 0.9rem;
  border: 1px solid #d7e0ea;
  background: #fff;
  padding: 0.7rem 0.9rem;
  color: #0f172a;
  font-size: 0.875rem;
}

:deep(.preschool-settings-number .p-inputnumber-input:focus) {
  outline: none;
  border-color: #7dd3fc;
  box-shadow: 0 0 0 3px rgba(125, 211, 252, 0.25);
}
</style>
