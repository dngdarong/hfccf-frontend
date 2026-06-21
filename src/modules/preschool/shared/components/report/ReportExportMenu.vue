<script setup>
import Button from '@/components/buttons/Button.vue'
import Select from 'primevue/select'

defineProps({
  modelValue: {
    type: String,
    default: 'csv',
  },
  formats: {
    type: Array,
    default: () => [
      { label: 'PDF', value: 'pdf' },
      { label: 'Excel', value: 'excel' },
      { label: 'CSV', value: 'csv' },
    ],
  },
  exporting: {
    type: Boolean,
    default: false,
  },
  labels: {
    type: Object,
    default: () => ({
      title: 'Exports',
      export: 'Export',
    }),
  },
})

const emit = defineEmits(['update:modelValue', 'export'])
</script>

<template>
  <div class="flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <label class="space-y-2 text-sm font-medium text-slate-700">
      <span>{{ labels.title }}</span>
      <Select
        :model-value="modelValue"
        :options="formats"
        option-label="label"
        option-value="value"
        class="w-44"
        @update:model-value="(value) => emit('update:modelValue', value)"
      />
    </label>

    <Button type="button" variant="primary" size="md" rounded="xl" :loading="exporting" @click="emit('export')">
      {{ labels.export }}
    </Button>
  </div>
</template>
