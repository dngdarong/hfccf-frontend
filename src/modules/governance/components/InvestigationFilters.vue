<script setup>
import Card from 'primevue/card'
import Button from '@/components/buttons/Button.vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'InvestigationFilters',
})

const { t } = useLanguage()

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'reset'])

function updateField(field, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}

function submit() {
  emit('submit')
}

function reset() {
  emit('reset')
}
</script>

<template>
  <Card>
    <template #title>{{ title }}</template>
    <template #content>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <label class="flex flex-col gap-2 text-sm">
          <span>{{ t('governance.filters.dateFrom') }}</span>
          <input :value="modelValue.dateFrom" type="date" class="rounded-xl border border-slate-300 px-3 py-2" @input="updateField('dateFrom', $event.target.value)">
        </label>
        <label class="flex flex-col gap-2 text-sm">
          <span>{{ t('governance.filters.dateTo') }}</span>
          <input :value="modelValue.dateTo" type="date" class="rounded-xl border border-slate-300 px-3 py-2" @input="updateField('dateTo', $event.target.value)">
        </label>
        <label class="flex flex-col gap-2 text-sm">
          <span>{{ t('governance.filters.module') }}</span>
          <input :value="modelValue.module" type="text" class="rounded-xl border border-slate-300 px-3 py-2" @input="updateField('module', $event.target.value)">
        </label>
        <label class="flex flex-col gap-2 text-sm">
          <span>{{ t('governance.filters.eventType') }}</span>
          <input :value="modelValue.eventType" type="text" class="rounded-xl border border-slate-300 px-3 py-2" @input="updateField('eventType', $event.target.value)">
        </label>
        <label class="flex flex-col gap-2 text-sm">
          <span>{{ t('governance.filters.severity') }}</span>
          <input :value="modelValue.severity" type="text" class="rounded-xl border border-slate-300 px-3 py-2" @input="updateField('severity', $event.target.value)">
        </label>
        <label class="flex flex-col gap-2 text-sm">
          <span>{{ t('governance.filters.entity') }}</span>
          <input :value="modelValue.entity" type="text" class="rounded-xl border border-slate-300 px-3 py-2" @input="updateField('entity', $event.target.value)">
        </label>
      </div>
      <div class="mt-4 flex flex-wrap gap-2">
        <Button size="sm" :label="t('governance.filters.search')" @click="submit" />
        <Button size="sm" variant="outline" :label="t('governance.filters.reset')" @click="reset" />
      </div>
    </template>
  </Card>
</template>
