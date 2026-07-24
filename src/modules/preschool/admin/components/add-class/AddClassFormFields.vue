<script setup>
// Keep the class form localized at the field level so status labels stay
// readable without leaking hardcoded English into the editor.
import { computed } from 'vue'
import MultiSelect from 'primevue/multiselect'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AddClassFormFields',
})

const props = defineProps({
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
  classLevelId: {
    type: [String, Number],
    default: '',
  },
  levelOptions: {
    type: Array,
    default: () => [],
  },
  studentOptions: {
    type: Array,
    default: () => [],
  },
  selectedStudentIds: {
    type: Array,
    default: () => [],
  },
  studentLoading: {
    type: Boolean,
    default: false,
  },
  studentSelectionDisabled: {
    type: Boolean,
    default: false,
  },
  selectedStudentCount: {
    type: Number,
    default: 0,
  },
  selectedStudentSummary: {
    type: String,
    default: '',
  },
  scheduleDayOptions: {
    type: Array,
    default: () => [],
  },
  scheduleDays: {
    type: Array,
    default: () => [],
  },
  scheduleStartTime: {
    type: String,
    default: '',
  },
  scheduleEndTime: {
    type: String,
    default: '',
  },
  schedulePreview: {
    type: String,
    default: '',
  },
  scheduleWarning: {
    type: String,
    default: '',
  },
  scheduleHasWarning: {
    type: Boolean,
    default: false,
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
  codeLabel: {
    type: String,
    default: '',
  },
  codeHint: {
    type: String,
    default: '',
  },
  codeLoading: {
    type: Boolean,
    default: false,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
})

defineEmits([
  'update:name',
  'update:teacher',
  'update:classLevelId',
  'update:schedule-day',
  'update:schedule-start-time',
  'update:schedule-end-time',
  'update:selectedStudentIds',
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
  return t(`${namespace}.${normalizeKey(value)}`)
}

const translatedStatusOptions = computed(() =>
  props.statusOptions.map((option) => ({
    value: option,
    label: translateOption('common.status', option),
  })),
)
</script>

<template>
  <div :class="isKh ? 'add-class-form-fields add-class-form-fields--kh' : 'add-class-form-fields'">
    <section class="add-class-form-fields__section add-class-form-fields__section--wide">
      <header class="add-class-form-fields__section-header">
        <p class="add-class-form-fields__section-title">{{ t('preschoolAddClass.identitySectionTitle') }}</p>
        <p class="add-class-form-fields__section-text">{{ t('preschoolAddClass.identitySectionText') }}</p>
      </header>

      <div class="add-class-form-fields__identity-grid">
        <div class="add-class-form-fields__code-preview" data-testid="add-class-code-preview" :class="{ 'add-class-form-fields__code-preview--loading': codeLoading }">
          <span class="add-class-form-fields__code-label">{{ codeLabel || t('preschoolAddClass.classCode') }}</span>
          <strong class="add-class-form-fields__code-value">{{ code || '-' }}</strong>
          <span class="add-class-form-fields__code-hint">
            {{ codeHint || t('preschoolAddClass.generatedClassCodeHint') }}
          </span>
        </div>

        <label class="add-class-form-fields__field">
          <span class="add-class-form-fields__label">{{ t('preschoolAddClass.className') }}</span>
          <input
            :value="name"
            type="text"
            :placeholder="t('preschoolAddClass.classNamePlaceholder')"
            :disabled="isLocked"
            @input="$emit('update:name', $event.target.value)"
          />
        </label>
      </div>
    </section>

    <section class="add-class-form-fields__section add-class-form-fields__section--wide">
      <header class="add-class-form-fields__section-header">
        <p class="add-class-form-fields__section-title">{{ t('preschoolAddClass.assignmentSectionTitle') }}</p>
        <p class="add-class-form-fields__section-text">{{ t('preschoolAddClass.assignmentSectionText') }}</p>
      </header>

      <div class="add-class-form-fields__assignment-grid">
        <label class="add-class-form-fields__field">
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

        <label class="add-class-form-fields__field">
          <span class="add-class-form-fields__label">{{ t('preschoolAddClass.level') }}</span>
          <select
            data-testid="add-class-level-select"
            :value="classLevelId"
            :placeholder="t('preschoolAddClass.levelPlaceholder')"
            :disabled="isLocked"
            @change="$emit('update:classLevelId', $event.target.value)"
          >
            <option value="">{{ t('preschoolAddClass.levelPlaceholder') }}</option>
            <option v-for="option in levelOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="add-class-form-fields__field add-class-form-fields__field--wide">
          <span class="add-class-form-fields__label">{{ t('preschoolAddClass.schedule') }}</span>
          <div class="add-class-form-fields__schedule">
            <div class="add-class-form-fields__schedule-days">
              <span class="add-class-form-fields__schedule-subtitle">{{ t('preschoolAddClass.days') }}</span>
              <div class="add-class-form-fields__days-grid">
                <label
                  v-for="option in scheduleDayOptions"
                  :key="option.value"
                  class="add-class-form-fields__day-option"
                >
                  <input
                    :data-testid="`add-class-schedule-day-${option.value}`"
                    type="checkbox"
                    :checked="scheduleDays.includes(option.value)"
                    :disabled="isLocked"
                    @change="$emit('update:schedule-day', option.value, $event.target.checked)"
                  />
                  <span>{{ option.label }}</span>
                </label>
              </div>
            </div>

            <div class="add-class-form-fields__schedule-time">
              <span class="add-class-form-fields__schedule-subtitle">{{ t('preschoolAddClass.time') }}</span>
              <div class="add-class-form-fields__time-grid">
                <label class="add-class-form-fields__field">
                  <span class="add-class-form-fields__label">{{ t('preschoolAddClass.startTime') }}</span>
                  <input
                    data-testid="add-class-schedule-start-time"
                    :value="scheduleStartTime"
                    type="time"
                    :disabled="isLocked"
                    @input="$emit('update:schedule-start-time', $event.target.value)"
                  />
                </label>

                <label class="add-class-form-fields__field">
                  <span class="add-class-form-fields__label">{{ t('preschoolAddClass.endTime') }}</span>
                  <input
                    data-testid="add-class-schedule-end-time"
                    :value="scheduleEndTime"
                    type="time"
                    :disabled="isLocked"
                    @input="$emit('update:schedule-end-time', $event.target.value)"
                  />
                </label>
              </div>
            </div>

            <div class="add-class-form-fields__schedule-preview" data-testid="add-class-schedule-preview">
              <span class="add-class-form-fields__schedule-subtitle">{{ t('preschoolAddClass.schedulePreview') }}</span>
              <p class="add-class-form-fields__schedule-preview-text">{{ schedulePreview || t('preschoolAddClass.schedulePreviewEmpty') }}</p>
              <p v-if="scheduleHasWarning" class="add-class-form-fields__schedule-warning">
                {{ scheduleWarning }}
              </p>
              <p v-if="scheduleHasWarning" class="add-class-form-fields__schedule-warning-hint">
                {{ t('preschoolAddClass.customSchedulePreserved') }}
              </p>
            </div>
          </div>
        </label>
      </div>
    </section>

    <section class="add-class-form-fields__section add-class-form-fields__section--wide">
      <header class="add-class-form-fields__section-header">
        <p class="add-class-form-fields__section-title">{{ t('preschoolAddClass.capacitySectionTitle') }}</p>
        <p class="add-class-form-fields__section-text">{{ t('preschoolAddClass.capacitySectionText') }}</p>
      </header>

      <div class="add-class-form-fields__capacity-grid">
        <label class="add-class-form-fields__field">
          <span class="add-class-form-fields__label">{{ t('preschoolAddClass.students') }}</span>
          <MultiSelect
            :model-value="selectedStudentIds"
            :options="studentOptions"
            option-label="label"
            option-value="value"
            display="chip"
            filter
            class="add-class-form-fields__multiselect"
            :placeholder="t('preschoolAddClass.selectStudents')"
            :filter-placeholder="t('preschoolAddClass.selectStudents')"
            :loading="studentLoading"
            :empty-message="t('preschoolAddClass.noStudentsFound')"
            :disabled="isLocked || studentSelectionDisabled"
            @update:model-value="$emit('update:selectedStudentIds', $event)"
          />
          <div class="add-class-form-fields__student-help">
            <span class="add-class-form-fields__student-help-label">{{ t('preschoolAddClass.studentAssignment') }}</span>
            <span class="add-class-form-fields__student-help-text">{{ selectedStudentSummary || t('preschoolAddClass.selectedStudentsCount', { count: selectedStudentCount }) }}</span>
          </div>
        </label>

        <label class="add-class-form-fields__field">
          <span class="add-class-form-fields__label">{{ t('preschoolAddClass.status') }}</span>
          <select :value="status" :disabled="isLocked" @change="$emit('update:status', $event.target.value)">
            <option v-for="option in translatedStatusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="add-class-form-fields__field add-class-form-fields__field--wide">
          <span class="add-class-form-fields__label">{{ t('preschoolAddClass.room') }}</span>
          <input
            :value="room"
            type="text"
            :placeholder="t('preschoolAddClass.roomPlaceholder')"
            :disabled="isLocked"
            @input="$emit('update:room', $event.target.value)"
          />
        </label>
      </div>
    </section>

    <section class="add-class-form-fields__section add-class-form-fields__section--wide add-class-form-fields__section--notes">
      <header class="add-class-form-fields__section-header">
        <p class="add-class-form-fields__section-title">{{ t('preschoolAddClass.notesSectionTitle') }}</p>
        <p class="add-class-form-fields__section-text">{{ t('preschoolAddClass.notesSectionText') }}</p>
      </header>

      <label class="add-class-form-fields__field add-class-form-fields__field--wide">
        <span class="add-class-form-fields__label">{{ t('preschoolAddClass.notes') }}</span>
        <textarea
          :value="notes"
          rows="4"
          :placeholder="t('preschoolAddClass.notesPlaceholder')"
          :disabled="isLocked"
          @input="$emit('update:notes', $event.target.value)"
        />
      </label>
    </section>
  </div>
</template>

<style scoped>
.add-class-form-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.add-class-form-fields__section {
  grid-column: 1 / -1;
  border: 1px solid #dbe5ef;
  border-radius: 1rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(248, 251, 255, 0.96) 100%);
  padding: 1rem;
  box-shadow: 0 10px 26px -22px rgba(15, 23, 42, 0.55);
}

.add-class-form-fields__section--notes {
  background: linear-gradient(180deg, rgba(248, 251, 255, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%);
}

.add-class-form-fields__section-header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-bottom: 0.85rem;
}

.add-class-form-fields__section-title {
  margin: 0;
  color: #0f172a;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.add-class-form-fields__section-text {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.45;
}

.add-class-form-fields__identity-grid,
.add-class-form-fields__assignment-grid,
.add-class-form-fields__capacity-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.add-class-form-fields__identity-grid {
  align-items: start;
}

.add-class-form-fields__field {
  display: flex;
  flex-direction: column;
  gap: 0.38rem;
  min-width: 0;
}

.add-class-form-fields__code-preview {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  max-width: 16.5rem;
  padding: 0.7rem 0.8rem;
  border: 1px solid #cfe2f7;
  border-radius: 0.9rem;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.96) 0%, rgba(255, 255, 255, 0.99) 100%);
}

.add-class-form-fields__code-preview--loading {
  opacity: 0.85;
}

.add-class-form-fields__code-label {
  color: #0f4c81;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.add-class-form-fields__code-value {
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.add-class-form-fields__code-hint {
  color: #475569;
  font-size: 0.78rem;
  line-height: 1.4;
}

.add-class-form-fields__field--wide {
  grid-column: 1 / -1;
}

.add-class-form-fields__label {
  color: #334155;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.add-class-form-fields__student-help {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.add-class-form-fields__student-help-label {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.add-class-form-fields__student-help-text {
  color: #475569;
  font-size: 0.82rem;
  line-height: 1.45;
}

.add-class-form-fields__multiselect {
  width: 100%;
}

.add-class-form-fields__student-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.add-class-form-fields__student-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  overflow: hidden;
  background: linear-gradient(135deg, #bfdbfe 0%, #60a5fa 100%);
  color: #0f172a;
  font-size: 0.72rem;
  font-weight: 800;
}

.add-class-form-fields__student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.add-class-form-fields__student-avatar--fallback {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.add-class-form-fields__student-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.add-class-form-fields__student-name {
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.add-class-form-fields__student-code {
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.3;
}

.add-class-form-fields__schedule {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 0.85rem;
  border: 1px solid #dbe5ef;
  border-radius: 0.95rem;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
}

.add-class-form-fields__schedule-subtitle {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.add-class-form-fields__schedule-days,
.add-class-form-fields__schedule-time,
.add-class-form-fields__schedule-preview {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.add-class-form-fields__days-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem 0.8rem;
}

.add-class-form-fields__day-option {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #0f172a;
  font-size: 0.88rem;
  font-weight: 600;
}

.add-class-form-fields__day-option input {
  flex-shrink: 0;
  width: 0.95rem;
  height: 0.95rem;
  min-height: 0;
  padding: 0;
}

.add-class-form-fields__time-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.add-class-form-fields__schedule-preview-text {
  margin: 0;
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.45;
}

.add-class-form-fields__schedule-warning {
  margin: 0;
  color: #b45309;
  font-size: 0.82rem;
  line-height: 1.45;
}

.add-class-form-fields__schedule-warning-hint {
  margin: 0;
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.45;
}

.add-class-form-fields--kh .add-class-form-fields__label,
.add-class-form-fields--kh .add-class-form-fields__section-title,
.add-class-form-fields--kh .add-class-form-fields__section-text,
.add-class-form-fields--kh .add-class-form-fields__code-label,
.add-class-form-fields--kh :deep(input),
.add-class-form-fields--kh :deep(select),
.add-class-form-fields--kh :deep(textarea) {
  font-family:
    'Noto Sans Khmer', 'Khmer OS Siemreap', 'Khmer OS Battambang', 'Leelawadee UI', sans-serif;
}

.add-class-form-fields--kh .add-class-form-fields__code-hint {
  line-height: 1.65;
}

.add-class-form-fields :deep(input),
.add-class-form-fields :deep(select) {
  min-height: 2.85rem;
  padding: 0.75rem 0.95rem;
}

.add-class-form-fields :deep(textarea) {
  min-height: 7.5rem;
  padding: 0.8rem 0.95rem;
  resize: vertical;
}

.add-class-form-fields :deep(input::placeholder),
.add-class-form-fields :deep(textarea::placeholder) {
  color: #94a3b8;
}

@media (max-width: 720px) {
  .add-class-form-fields {
    grid-template-columns: 1fr;
  }

  .add-class-form-fields__section {
    padding: 0.9rem;
  }

  .add-class-form-fields__identity-grid,
  .add-class-form-fields__assignment-grid,
  .add-class-form-fields__capacity-grid {
    grid-template-columns: 1fr;
  }

  .add-class-form-fields__code-preview {
    max-width: none;
  }
}
</style>
