<script setup>
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import PreschoolSettingsSectionCard from './PreschoolSettingsSectionCard.vue'
import { useLanguage } from '@/composables/useLanguage'

// Assessment settings keep the reporting backbone explicit without merging
// scoring and publishing rules into the rest of the Preschool settings form.
defineOptions({
  name: 'PreschoolAssessmentConfiguration',
})

const { t } = useLanguage()

defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  cycleOptions: {
    type: Array,
    default: () => [],
  },
  finalizationOptions: {
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
    :eyebrow="t('preschoolSettingsPage.sections.assessment.eyebrow')"
    :title="t('preschoolSettingsPage.sections.assessment.title')"
    :subtitle="t('preschoolSettingsPage.sections.assessment.subtitle')"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.assessmentCycle') }}</span>
        <Select
          :model-value="modelValue.assessmentCycle"
          :options="cycleOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.assessmentCycle')"
          @update:model-value="updateField({ model: modelValue, key: 'assessmentCycle' }, $event)"
        />
        <small v-if="errors.assessmentCycle" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.assessmentCycle}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.finalizationMode') }}</span>
        <Select
          :model-value="modelValue.finalizationMode"
          :options="finalizationOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.finalizationMode')"
          @update:model-value="updateField({ model: modelValue, key: 'finalizationMode' }, $event)"
        />
        <small v-if="errors.finalizationMode" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.finalizationMode}`) }}</small>
      </label>

      <label class="preschool-settings-field md:col-span-2">
        <span>{{ t('preschoolSettingsPage.fields.defaultTemplate') }}</span>
        <input
          :value="modelValue.defaultTemplate"
          type="text"
          class="preschool-settings-input"
          :placeholder="t('preschoolSettingsPage.placeholders.defaultTemplate')"
          @input="updateField({ model: modelValue, key: 'defaultTemplate' }, $event.target.value)"
        />
        <small v-if="errors.defaultTemplate" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.defaultTemplate}`) }}</small>
      </label>

      <div
        class="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2"
        :class="errors.requireTeacherNotes ? 'border-rose-300' : ''"
      >
        <div class="space-y-0.5">
          <p class="text-sm font-semibold text-slate-800">{{ t('preschoolSettingsPage.fields.requireTeacherNotes') }}</p>
          <p class="text-xs text-slate-500">{{ t('preschoolSettingsPage.help.requireTeacherNotes') }}</p>
        </div>
        <ToggleSwitch
          :model-value="modelValue.requireTeacherNotes"
          @update:model-value="updateField({ model: modelValue, key: 'requireTeacherNotes' }, $event)"
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
