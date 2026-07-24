<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  options: {
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
  presets: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'apply', 'reset', 'preset'])

const localFilters = ref({
  academicYearId: '',
  classId: '',
  teacherUserId: '',
  dateFrom: '',
  dateTo: '',
  status: '',
  ...props.modelValue,
})

watch(
  () => props.modelValue,
  (value) => {
    localFilters.value = {
      academicYearId: '',
      classId: '',
      teacherUserId: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      ...value,
    }
  },
  { deep: true, immediate: true },
)

const normalizedOptions = computed(() => ({
  academicYears: Array.isArray(props.options?.academicYears)
    ? props.options.academicYears
    : Array.isArray(props.options?.academicYears?.items)
      ? props.options.academicYears.items
      : [],
  classes: Array.isArray(props.options?.classes)
    ? props.options.classes
    : Array.isArray(props.options?.classes?.items)
      ? props.options.classes.items
      : [],
  teachers: Array.isArray(props.options?.teachers)
    ? props.options.teachers
    : Array.isArray(props.options?.teachers?.items)
      ? props.options.teachers.items
      : [],
  statuses: Array.isArray(props.options?.statuses)
    ? props.options.statuses
    : Array.isArray(props.options?.statuses?.items)
      ? props.options.statuses.items
      : [],
}))

function normalizeChoice(item) {
  if (item && typeof item === 'object') {
    const value = item.value ?? item.id ?? item.key ?? item.code ?? item.slug ?? item.label ?? item.name ?? ''
    const label = item.label ?? item.name ?? item.title ?? String(value)
    return { value, label }
  }

  return { value: item, label: String(item) }
}

function updateField(field, value) {
  localFilters.value = {
    ...localFilters.value,
    [field]: value,
  }
  emit('update:modelValue', { ...localFilters.value })
}

function onApply() {
  emit('apply', { ...localFilters.value })
}

function onReset() {
  localFilters.value = {
    academicYearId: '',
    classId: '',
    teacherUserId: '',
    dateFrom: '',
    dateTo: '',
    status: '',
  }
  emit('update:modelValue', { ...localFilters.value })
  emit('reset')
}

function onPreset(presetKey) {
  emit('preset', presetKey)
}
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="mb-4">
      <h3 class="text-sm font-semibold text-slate-900">{{ labels.title || 'Filters' }}</h3>
      <p class="text-sm text-slate-500">{{ labels.subtitle || '' }}</p>
    </div>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <label class="space-y-1 text-sm">
        <span class="block font-medium text-slate-700">{{ labels.dateRange || 'Date Range' }}</span>
        <div class="grid grid-cols-2 gap-2">
          <input
            class="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
            type="date"
            :value="localFilters.dateFrom"
            @input="updateField('dateFrom', $event.target.value)"
          >
          <input
            class="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
            type="date"
            :value="localFilters.dateTo"
            @input="updateField('dateTo', $event.target.value)"
          >
        </div>
      </label>

      <label class="space-y-1 text-sm">
        <span class="block font-medium text-slate-700">{{ labels.academicYear || 'Academic Year' }}</span>
        <select
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
          :value="localFilters.academicYearId"
          @change="updateField('academicYearId', $event.target.value)"
        >
          <option value="">{{ labels.academicYear || 'Academic Year' }}</option>
          <option v-for="item in normalizedOptions.academicYears" :key="normalizeChoice(item).value" :value="normalizeChoice(item).value">
            {{ normalizeChoice(item).label }}
          </option>
        </select>
      </label>

      <label class="space-y-1 text-sm">
        <span class="block font-medium text-slate-700">{{ labels.class || 'Class' }}</span>
        <select
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
          :value="localFilters.classId"
          @change="updateField('classId', $event.target.value)"
        >
          <option value="">{{ labels.class || 'Class' }}</option>
          <option v-for="item in normalizedOptions.classes" :key="normalizeChoice(item).value" :value="normalizeChoice(item).value">
            {{ normalizeChoice(item).label }}
          </option>
        </select>
      </label>

      <label class="space-y-1 text-sm">
        <span class="block font-medium text-slate-700">{{ labels.teacher || 'Teacher' }}</span>
        <select
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
          :value="localFilters.teacherUserId"
          @change="updateField('teacherUserId', $event.target.value)"
        >
          <option value="">{{ labels.teacher || 'Teacher' }}</option>
          <option v-for="item in normalizedOptions.teachers" :key="normalizeChoice(item).value" :value="normalizeChoice(item).value">
            {{ normalizeChoice(item).label }}
          </option>
        </select>
      </label>

      <label class="space-y-1 text-sm">
        <span class="block font-medium text-slate-700">{{ labels.status || 'Status' }}</span>
        <select
          class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400"
          :value="localFilters.status"
          @change="updateField('status', $event.target.value)"
        >
          <option value="">{{ labels.status || 'Status' }}</option>
          <option v-for="item in normalizedOptions.statuses" :key="normalizeChoice(item).value" :value="normalizeChoice(item).value">
            {{ normalizeChoice(item).label }}
          </option>
        </select>
      </label>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
        @click="onApply"
      >
        {{ labels.apply || 'Apply Filters' }}
      </button>
      <button
        type="button"
        class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="loading"
        @click="onReset"
      >
        {{ labels.reset || 'Reset Filters' }}
      </button>
    </div>

    <div v-if="presets.length" class="mt-4 border-t border-slate-100 pt-4">
      <p class="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
        {{ labels.savedFilters || 'Saved Filters' }}
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="preset in presets"
          :key="preset.key"
          type="button"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
          @click="onPreset(preset.key)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>
  </section>
</template>
