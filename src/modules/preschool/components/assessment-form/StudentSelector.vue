<script setup>
import { computed } from 'vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AssessmentStudentSelector',
})

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null,
  },
  options: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])
const { t } = useLanguage()

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    const selected = props.options.find(option => option.value === value)
    if (selected) {
      emit('change', selected)
    }
  },
})

const sortedOptions = computed(() => [...props.options].sort((a, b) => a.label.localeCompare(b.label)))
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-slate-700">
      {{ t('assessmentList.filters.student') }}
      <span class="text-red-500">*</span>
    </label>

    <Select
      v-model="selectedValue"
      :options="sortedOptions"
      option-label="label"
      option-value="value"
      :placeholder="t('assessmentList.selectedStudentPlaceholder')"
      :loading="loading"
      :disabled="disabled || loading"
      :show-clear="clearable && selectedValue !== null && selectedValue !== undefined && selectedValue !== ''"
      filter
      class="w-full"
    />

    <p v-if="error" class="text-sm text-red-600">
      {{ error }}
    </p>

    <p class="text-xs text-slate-500">
      {{ t('assessmentList.studentSelector.help') }}
    </p>
  </div>
</template>
