<script setup>
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import Select from 'primevue/select'
import PreschoolSettingsSectionCard from './PreschoolSettingsSectionCard.vue'
import { useLanguage } from '@/composables/useLanguage'

// Payment defaults stay separate from attendance so finance rules can be
// validated and reviewed without mixing unrelated configuration concerns.
defineOptions({
  name: 'PreschoolPaymentConfiguration',
})

const { t } = useLanguage()

defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  paymentCycleOptions: {
    type: Array,
    default: () => [],
  },
  lateFeeRuleOptions: {
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
    :eyebrow="t('preschoolSettingsPage.sections.payment.eyebrow')"
    :title="t('preschoolSettingsPage.sections.payment.title')"
    :subtitle="t('preschoolSettingsPage.sections.payment.subtitle')"
  >
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.defaultTuitionFee') }}</span>
        <InputNumber
          :model-value="modelValue.defaultTuitionFee"
          class="w-full"
          input-class="preschool-settings-input"
          :placeholder="t('preschoolSettingsPage.placeholders.defaultTuitionFee')"
          @update:model-value="updateField({ model: modelValue, key: 'defaultTuitionFee' }, $event)"
        />
        <small v-if="errors.defaultTuitionFee" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.defaultTuitionFee}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.paymentCycle') }}</span>
        <Select
          :model-value="modelValue.paymentCycle"
          :options="paymentCycleOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.paymentCycle')"
          @update:model-value="updateField({ model: modelValue, key: 'paymentCycle' }, $event)"
        />
        <small v-if="errors.paymentCycle" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.paymentCycle}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.dueDay') }}</span>
        <InputNumber
          :model-value="modelValue.dueDay"
          class="w-full"
          input-class="preschool-settings-input"
          :placeholder="t('preschoolSettingsPage.placeholders.dueDay')"
          @update:model-value="updateField({ model: modelValue, key: 'dueDay' }, $event)"
        />
        <small v-if="errors.dueDay" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.dueDay}`) }}</small>
      </label>

      <label class="preschool-settings-field">
        <span>{{ t('preschoolSettingsPage.fields.lateFeeRule') }}</span>
        <Select
          :model-value="modelValue.lateFeeRule"
          :options="lateFeeRuleOptions"
          option-label="label"
          option-value="value"
          class="w-full"
          :placeholder="t('preschoolSettingsPage.placeholders.lateFeeRule')"
          @update:model-value="updateField({ model: modelValue, key: 'lateFeeRule' }, $event)"
        />
        <small v-if="errors.lateFeeRule" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.lateFeeRule}`) }}</small>
      </label>

      <label class="preschool-settings-field xl:col-span-4">
        <span>{{ t('preschoolSettingsPage.fields.enableOverdueReminders') }}</span>
        <div class="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <span class="text-sm text-slate-600">{{ t('preschoolSettingsPage.help.enableOverdueReminders') }}</span>
          <ToggleSwitch
            :model-value="modelValue.enableOverdueReminders"
            @update:model-value="updateField({ model: modelValue, key: 'enableOverdueReminders' }, $event)"
          />
        </div>
        <small v-if="errors.enableOverdueReminders" class="text-xs font-medium text-rose-600">{{ t(`preschoolSettingsPage.validation.${errors.enableOverdueReminders}`) }}</small>
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