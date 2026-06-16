<script setup>
import Select from 'primevue/select'
import PreschoolSettingsSectionCard from './PreschoolSettingsSectionCard.vue'
import { useLanguage } from '@/composables/useLanguage'

// Enrollment settings capture the default intake rules so the admin workflow
// can keep assignments, class capacity, and term intake aligned.
defineOptions({
  name: 'PreschoolEnrollmentConfiguration',
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
  classLevelOptions: {
    type: Array,
    default: () => [],
  },
  transferPolicyOptions: {
    type: Array,
    default: () => [],
  },
  capacityReviewOptions: {
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
    :eyebrow="t('preschoolSettingsPage.sections.enrollment.eyebrow')"
    :title="t('preschoolSettingsPage.sections.enrollment.title')"
    :subtitle="t('preschoolSettingsPage.sections.enrollment.subtitle')"
  >
    <div class="grid gap-4 md:grid-cols-2">
      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.enrollmentCycle') }}</span>
        <Select
          :model-value="modelValue.enrollmentCycle"
          :options="cycleOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.enrollmentCycle')"
          @update:model-value="updateField({ model: modelValue, key: 'enrollmentCycle' }, $event)"
        />
        <small v-if="errors.enrollmentCycle" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.enrollmentCycle}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.defaultClassLevel') }}</span>
        <Select
          :model-value="modelValue.defaultClassLevel"
          :options="classLevelOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.defaultClassLevel')"
          @update:model-value="updateField({ model: modelValue, key: 'defaultClassLevel' }, $event)"
        />
        <small v-if="errors.defaultClassLevel" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.defaultClassLevel}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.transferPolicy') }}</span>
        <Select
          :model-value="modelValue.transferPolicy"
          :options="transferPolicyOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.transferPolicy')"
          @update:model-value="updateField({ model: modelValue, key: 'transferPolicy' }, $event)"
        />
        <small v-if="errors.transferPolicy" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.transferPolicy}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.capacityReviewMode') }}</span>
        <Select
          :model-value="modelValue.capacityReviewMode"
          :options="capacityReviewOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.capacityReviewMode')"
          @update:model-value="updateField({ model: modelValue, key: 'capacityReviewMode' }, $event)"
        />
        <small v-if="errors.capacityReviewMode" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.capacityReviewMode}`) }}</small>
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
</style>
