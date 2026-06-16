<script setup>
import { computed } from 'vue'
import Select from 'primevue/select'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AssessmentCategorySelector',
})

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null,
  },
  categories: {
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
})

const emit = defineEmits(['update:modelValue', 'change'])
const { t } = useLanguage()

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value)
    const selected = props.categories.find(category => category.id === value)
    if (selected) {
      emit('change', selected)
    }
  },
})

const categoryOptions = computed(() =>
  props.categories.map(category => ({
    label: category.name,
    value: category.id,
    code: category.code,
  })),
)
</script>

<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-slate-700">
      {{ t('assessmentList.filters.category') }}
      <span class="text-red-500">*</span>
    </label>

    <Select
      v-model="selectedValue"
      :options="categoryOptions"
      option-label="label"
      option-value="value"
      :placeholder="t('assessmentList.filters.categoryAll')"
      :loading="loading"
      :disabled="disabled || loading"
      show-clear
      class="w-full"
    />

    <p v-if="error" class="text-sm text-red-600">
      {{ error }}
    </p>

    <p class="text-xs text-slate-500">
      {{ t('assessmentList.categorySelector.help') }}
    </p>
  </div>
</template>
