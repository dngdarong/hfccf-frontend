<script setup>
// Keep the class form localized at the field level so Preschool level/status
// labels stay readable without leaking hardcoded English into the editor.
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AddClassFormFields',
})

const props = defineProps({
  levelOptions: {
    type: Array,
    default: () => [],
  },
  statusOptions: {
    type: Array,
    default: () => [],
  },
  code: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    default: '',
  },
  teacher: {
    type: String,
    default: '',
  },
  teacherOptions: {
    type: Array,
    default: () => [],
  },
  level: {
    type: String,
    default: '',
  },
  schedule: {
    type: String,
    default: '',
  },
  students: {
    type: [String, Number],
    default: 0,
  },
  status: {
    type: String,
    default: '',
  },
  room: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
})

defineEmits([
  'update:code',
  'update:name',
  'update:teacher',
  'update:level',
  'update:schedule',
  'update:students',
  'update:status',
  'update:room',
  'update:notes',
])

const { t, language } = useLanguage()
const isKh = computed(() => language.value === 'KH')

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

function translateOption(namespace, value) {
  const key = `${namespace}.${normalizeKey(value)}`
  return t(key)
}

const translatedLevelOptions = computed(() =>
  props.levelOptions.map((option) => ({
    value: option,
    label: translateOption('common.role', option),
  })),
)

const translatedStatusOptions = computed(() =>
  props.statusOptions.map((option) => ({
    value: option,
    label: translateOption('common.status', option),
  })),
)
</script>

<template>
  <div :class="isKh ? 'add-class-form-fields add-class-form-fields--kh' : 'add-class-form-fields'">
    <label class="add-class-form-fields__field add-class-form-fields__field--half">
      <span class="add-class-form-fields__label">{{ t('preschoolAddClass.classCode') }}</span>
      <input
        :value="code"
        type="text"
        :placeholder="t('preschoolAddClass.classCodePlaceholder')"
        :disabled="isLocked"
        @input="$emit('update:code', $event.target.value)"
      />
    </label>

    <label class="add-class-form-fields__field add-class-form-fields__field--half">
      <span class="add-class-form-fields__label">{{ t('preschoolAddClass.className') }}</span>
      <input
        :value="name"
        type="text"
        :placeholder="t('preschoolAddClass.classNamePlaceholder')"
        :disabled="isLocked"
        @input="$emit('update:name', $event.target.value)"
      />
    </label>

    <label class="add-class-form-fields__field add-class-form-fields__field--half">
      <span class="add-class-form-fields__label">{{ t('preschoolAddClass.teacher') }}</span>
      <select
        :value="teacher"
        :disabled="isLocked"
        @change="$emit('update:teacher', $event.target.value)"
      >
        <option value="">
          {{ t('preschoolAddClass.teacherPlaceholder') }}
        </option>
        <option v-for="option in teacherOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="add-class-form-fields__field add-class-form-fields__field--half">
      <span class="add-class-form-fields__label">{{ t('preschoolAddClass.level') }}</span>
      <select :value="level" :disabled="isLocked" @change="$emit('update:level', $event.target.value)">
        <option v-for="option in translatedLevelOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="add-class-form-fields__field add-class-form-fields__field--half">
      <span class="add-class-form-fields__label">{{ t('preschoolAddClass.schedule') }}</span>
      <input
        :value="schedule"
        type="text"
        :placeholder="t('preschoolAddClass.schedulePlaceholder')"
        :disabled="isLocked"
        @input="$emit('update:schedule', $event.target.value)"
      />
    </label>

    <label class="add-class-form-fields__field add-class-form-fields__field--half">
      <span class="add-class-form-fields__label">{{ t('preschoolAddClass.students') }}</span>
      <input
        :value="students"
        type="number"
        min="0"
        :placeholder="t('preschoolAddClass.studentsPlaceholder')"
        :disabled="isLocked"
        @input="$emit('update:students', $event.target.value)"
      />
    </label>

    <label class="add-class-form-fields__field add-class-form-fields__field--half">
      <span class="add-class-form-fields__label">{{ t('preschoolAddClass.status') }}</span>
      <select :value="status" :disabled="isLocked" @change="$emit('update:status', $event.target.value)">
        <option v-for="option in translatedStatusOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="add-class-form-fields__field add-class-form-fields__field--half">
      <span class="add-class-form-fields__label">{{ t('preschoolAddClass.room') }}</span>
      <input
        :value="room"
        type="text"
        :placeholder="t('preschoolAddClass.roomPlaceholder')"
        :disabled="isLocked"
        @input="$emit('update:room', $event.target.value)"
      />
    </label>

    <label class="add-class-form-fields__field add-class-form-fields__field--full">
      <span class="add-class-form-fields__label">{{ t('preschoolAddClass.notes') }}</span>
      <textarea
        :value="notes"
        rows="4"
        :placeholder="t('preschoolAddClass.notesPlaceholder')"
        :disabled="isLocked"
        @input="$emit('update:notes', $event.target.value)"
      />
    </label>
  </div>
</template>

<style scoped>
.add-class-form-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.95rem;
}

.add-class-form-fields__field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.add-class-form-fields__field--half {
  grid-column: span 1;
}

.add-class-form-fields__field--full {
  grid-column: 1 / -1;
}

.add-class-form-fields__label {
  color: #334155;
  font-size: 0.84rem;
  font-weight: 700;
}

.add-class-form-fields--kh .add-class-form-fields__label,
.add-class-form-fields--kh :deep(input),
.add-class-form-fields--kh :deep(select),
.add-class-form-fields--kh :deep(textarea) {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

@media (max-width: 720px) {
  .add-class-form-fields {
    grid-template-columns: 1fr;
  }
}
</style>
