<script setup>
// Keep period selection isolated so report pages can switch periods without
// repeating dropdown wiring or losing the backend period contract.
import { useLanguage } from '@/composables/useLanguage'
import Select from 'primevue/select'

defineProps({
  label: {
    type: String,
    default: '',
  },
  modelValue: {
    type: String,
    default: '',
  },
  periods: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const { t } = useLanguage()

/** Emit the new value and immediately trigger a reload — no separate button needed. */
function onUpdate(value) {
  emit('update:modelValue', value)
  emit('refresh')
}
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <label class="flex flex-col gap-1.5">
      <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ label }}</span>
      <Select
        :model-value="modelValue"
        :options="periods"
        option-label="label"
        option-value="label"
        class="w-full"
        :placeholder="placeholder"
        :disabled="disabled || loading || !periods.length"
        @update:model-value="onUpdate"
      />
    </label>

    <!-- Subtle reload hint instead of a prominent Refresh button -->
    <p class="mt-2 text-xs text-slate-400">
      {{ t('preschoolReportsShared.periodHint') }}
    </p>
  </div>
</template>
