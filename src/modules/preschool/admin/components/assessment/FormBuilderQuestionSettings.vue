<script setup>
import { computed, reactive, watch } from 'vue'
import Button from '@/components/buttons/Button.vue'

defineOptions({
  name: 'PreschoolAssessmentFormBuilderQuestionSettings',
})

const props = defineProps({
  question: {
    type: Object,
    default: null,
  },
  section: {
    type: Object,
    default: null,
  },
  state: {
    type: Object,
    default: () => ({}),
  },
  sectionOptions: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:state', 'reset', 'apply'])

const localState = reactive({
  label: '',
  helpText: '',
  required: false,
  score: 0,
  answerType: '',
  sectionKey: '',
  validationMode: 'basic',
  options: '',
})

const sectionLabel = computed(() => props.section?.title || 'Selected section')
let syncingFromProps = false

function syncFromProps() {
  syncingFromProps = true
  localState.label = props.state?.label ?? props.question?.title ?? ''
  localState.helpText = props.state?.helpText ?? props.question?.description ?? ''
  localState.required = Boolean(props.state?.required ?? false)
  localState.score = Number(props.state?.score ?? 0)
  localState.answerType = props.state?.answerType ?? props.question?.key ?? 'shortText'
  localState.sectionKey = props.state?.sectionKey ?? props.section?.key ?? ''
  localState.validationMode = props.state?.validationMode ?? 'basic'
  localState.options = props.state?.options ?? ''
  Promise.resolve().then(() => {
    syncingFromProps = false
  })
}

watch(
  () => [props.question, props.section, props.state],
  () => {
    syncFromProps()
  },
  { immediate: true, deep: true },
)

watch(
  localState,
  () => {
    if (syncingFromProps) return
    emit('update:state', {
      label: localState.label,
      helpText: localState.helpText,
      required: localState.required,
      score: localState.score,
      answerType: localState.answerType,
      sectionKey: localState.sectionKey,
      validationMode: localState.validationMode,
      options: localState.options,
    })
  },
  { deep: true },
)
</script>

<template>
  <section class="builder-settings">
    <div class="builder-settings__header">
      <div>
        <p class="builder-settings__eyebrow">Question Settings</p>
        <h3>{{ props.question?.title || 'No question selected' }}</h3>
      </div>
      <span class="builder-settings__section">{{ sectionLabel }}</span>
    </div>

    <div class="builder-settings__summary">
      <div class="builder-settings__summary-item">
        <strong>Type</strong>
        <span>{{ props.question?.title || 'Short Text' }}</span>
      </div>
      <div class="builder-settings__summary-item">
        <strong>Group</strong>
        <span>{{ props.question?.group || 'core' }}</span>
      </div>
    </div>

    <div class="builder-settings__fields">
      <label class="builder-settings__field">
        <span>Label</span>
        <input v-model="localState.label" type="text" placeholder="Question label" />
      </label>

      <label class="builder-settings__field">
        <span>Help text</span>
        <textarea v-model="localState.helpText" rows="3" placeholder="Optional helper text" />
      </label>

      <label class="builder-settings__field">
        <span>Answer type</span>
        <select v-model="localState.answerType">
          <option value="shortText">Short Text</option>
          <option value="longText">Long Text</option>
          <option value="dropdown">Dropdown</option>
          <option value="rating">Rating Scale</option>
          <option value="table">Table / Grid</option>
          <option value="signature">Signature</option>
        </select>
      </label>

      <label class="builder-settings__field">
        <span>Section</span>
        <select v-model="localState.sectionKey">
          <option
            v-for="section in props.sectionOptions"
            :key="section.key"
            :value="section.key"
          >
            {{ section.title }}
          </option>
        </select>
      </label>

      <div class="builder-settings__row">
        <label class="builder-settings__toggle">
          <input v-model="localState.required" type="checkbox" />
          <span>Required</span>
        </label>

        <label class="builder-settings__field builder-settings__field--compact">
          <span>Score</span>
          <input v-model.number="localState.score" type="number" min="0" max="100" />
        </label>
      </div>

      <label class="builder-settings__field">
        <span>Validation mode</span>
        <select v-model="localState.validationMode">
          <option value="basic">Basic</option>
          <option value="strict">Strict</option>
          <option value="scored">Scored</option>
        </select>
      </label>

      <label class="builder-settings__field">
        <span>Options</span>
        <textarea v-model="localState.options" rows="3" placeholder="Comma-separated options for choice fields" />
      </label>
    </div>

    <div class="builder-settings__actions">
      <Button
        label="Reset"
        icon="pi pi-refresh"
        severity="secondary"
        @click="emit('reset')"
      />
      <Button
        label="Apply"
        icon="pi pi-check"
        @click="emit('apply')"
      />
    </div>
  </section>
</template>

<style scoped>
.builder-settings {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.builder-settings__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.builder-settings__eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.builder-settings__header h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.builder-settings__section {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1d4ed8;
  background: #dbeafe;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
}

.builder-settings__summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.builder-settings__summary-item {
  padding: 0.8rem;
  border-radius: 0.9rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.builder-settings__summary-item strong {
  display: block;
  margin-bottom: 0.2rem;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
}

.builder-settings__summary-item span {
  color: #0f172a;
  font-weight: 600;
}

.builder-settings__fields {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.builder-settings__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.builder-settings__field span {
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
}

.builder-settings__field input,
.builder-settings__field textarea,
.builder-settings__field select {
  width: 100%;
  border-radius: 0.85rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  padding: 0.7rem 0.85rem;
  color: #0f172a;
  font: inherit;
}

.builder-settings__field textarea {
  resize: vertical;
}

.builder-settings__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 110px;
  gap: 0.75rem;
  align-items: end;
}

.builder-settings__field--compact input {
  text-align: center;
}

.builder-settings__toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 2.75rem;
  padding: 0 0.2rem;
  color: #0f172a;
  font-weight: 600;
}

.builder-settings__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.25rem;
}

@media (max-width: 768px) {
  .builder-settings__summary,
  .builder-settings__row {
    grid-template-columns: 1fr;
  }

  .builder-settings__header {
    flex-direction: column;
  }
}
</style>
