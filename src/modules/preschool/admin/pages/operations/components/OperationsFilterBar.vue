<script setup>
import { computed } from 'vue'
import Button from '@/components/buttons/Button.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  labels: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['update:modelValue', 'apply', 'reset'])

const filters = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function updateField(field, value) {
  filters.value = {
    ...filters.value,
    [field]: value,
  }
}
</script>

<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          {{ labels.title || 'Filters' }}
        </h2>
        <p v-if="labels.subtitle" class="mt-1 text-sm text-slate-500">
          {{ labels.subtitle }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" size="sm" rounded="xl" :disabled="loading" :label="labels.reset || 'Reset'" @click="emit('reset')" />
        <Button type="button" variant="primary" size="sm" rounded="xl" :loading="loading" :label="labels.apply || 'Apply'" @click="emit('apply')" />
      </div>
    </div>

    <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <label class="space-y-1 text-sm text-slate-600">
        <span class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{{ labels.dateFrom || 'Date' }}</span>
        <input
          :value="filters.dateFrom || ''"
          type="date"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          @input="updateField('dateFrom', $event.target.value)"
        >
      </label>

      <label class="space-y-1 text-sm text-slate-600">
        <span class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{{ labels.dateTo || 'End date' }}</span>
        <input
          :value="filters.dateTo || ''"
          type="date"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          @input="updateField('dateTo', $event.target.value)"
        >
      </label>

      <label class="space-y-1 text-sm text-slate-600">
        <span class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{{ labels.class || 'Class ID' }}</span>
        <input
          :value="filters.classId || ''"
          type="text"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          :placeholder="labels.classPlaceholder || 'Class ID'"
          @input="updateField('classId', $event.target.value)"
        >
      </label>

      <label class="space-y-1 text-sm text-slate-600">
        <span class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{{ labels.teacher || 'Teacher ID' }}</span>
        <input
          :value="filters.teacherUserId || ''"
          type="text"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          :placeholder="labels.teacherPlaceholder || 'Teacher user ID'"
          @input="updateField('teacherUserId', $event.target.value)"
        >
      </label>

      <label class="space-y-1 text-sm text-slate-600">
        <span class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{{ labels.status || 'Status' }}</span>
        <input
          :value="filters.status || ''"
          type="text"
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          :placeholder="labels.statusPlaceholder || 'Status'"
          @input="updateField('status', $event.target.value)"
        >
      </label>
    </div>
  </section>
</template>
