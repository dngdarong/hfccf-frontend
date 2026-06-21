<script setup>
import { nextTick } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'PreschoolAssessmentFormBuilderCanvas',
})

const props = defineProps({
  sections: {
    type: Array,
    default: () => [],
  },
  sectionQuestions: {
    type: Object,
    default: () => ({}),
  },
  selectedSectionKey: {
    type: String,
    default: null,
  },
})

const emit = defineEmits([
  'select-section',
  'select-question',
  'add-section',
  'add-question',
  'drag-section-start',
  'drag-question-start',
  'drag-end',
  'drop-section',
  'drop-question',
])

const { t, te } = useLanguage()

function safeText(key, fallback) {
  return te(key) ? t(key) : fallback
}

function sectionQuestionCount(sectionKey) {
  return Array.isArray(props.sectionQuestions?.[sectionKey]) ? props.sectionQuestions[sectionKey].length : 0
}

function sectionAnchorId(section) {
  return `assessment-section-${String(section?.key || '').replace(/[^a-zA-Z0-9_-]/g, '-')}`
}

async function scrollToSection(section) {
  if (!section) return

  await nextTick()
  const target = document.getElementById(sectionAnchorId(section))
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleSelect(section) {
  emit('select-section', section)
}

function handleSelectQuestion(question, section) {
  emit('select-question', { question, section })
}

function handleAdd(section) {
  emit('add-question', { section })
}

function handleAddClick() {
  emit('add-section')
}

async function handleJumpToSection(section) {
  handleSelect(section)
  await scrollToSection(section)
}

function handleSectionDragStart(section, event) {
  emit('drag-section-start', { section, event })
}

function handleQuestionDragStart(question, section, event) {
  emit('drag-question-start', { question, section, event })
}

function handleSectionDrop(section, event) {
  emit('drop-section', { section, event })
}

function handleQuestionDrop(section, question, event) {
  emit('drop-question', { section, question, event })
}

function handleDragEnd() {
  emit('drag-end')
}
</script>

<template>
  <section class="builder-canvas">
    <div class="builder-canvas__header">
      <div>
        <p class="builder-canvas__eyebrow">
          {{ safeText('assessmentFormBuilder.canvas.eyebrow', 'Canvas') }}
        </p>
        <h3>{{ safeText('assessmentFormBuilder.canvas.title', 'Live preview') }}</h3>
      </div>
      <button type="button" class="builder-canvas__action" @click="handleAddClick">
        <i class="pi pi-plus" />
        {{ safeText('assessmentFormBuilder.actions.addSection', 'Add section') }}
      </button>
    </div>

    <nav v-if="props.sections.length" class="builder-canvas__navigator" :aria-label="safeText('assessmentFormBuilder.canvas.navigatorAriaLabel', 'Section navigator')">
      <div class="builder-canvas__navigator-header">
        <div>
          <p class="builder-canvas__navigator-eyebrow">
            {{ safeText('assessmentFormBuilder.canvas.navigatorTitle', 'Sections') }}
          </p>
          <h4>{{ safeText('assessmentFormBuilder.canvas.navigatorHint', 'Jump to section') }}</h4>
        </div>
        <span class="builder-canvas__navigator-count">{{ props.sections.length }}</span>
      </div>

      <div class="builder-canvas__navigator-list">
        <button
          v-for="section in props.sections"
          :key="section.key"
          type="button"
          class="builder-canvas__navigator-item"
          :class="{
            'builder-canvas__navigator-item--active': section.key === props.selectedSectionKey,
            'builder-canvas__navigator-item--empty': sectionQuestionCount(section.key) === 0,
          }"
          :aria-current="section.key === props.selectedSectionKey ? 'true' : undefined"
          :aria-label="`${safeText('assessmentFormBuilder.canvas.navigatorJump', 'Jump to section')}: ${section.title}`"
          @click="handleJumpToSection(section)"
        >
          <span class="builder-canvas__navigator-title">{{ section.title }}</span>
          <span class="builder-canvas__navigator-meta">
            <span class="builder-canvas__navigator-count-label">
              {{ sectionQuestionCount(section.key) }} {{ safeText('assessmentFormBuilder.canvas.questionsLabel', 'questions') }}
            </span>
            <span v-if="sectionQuestionCount(section.key) === 0" class="builder-canvas__navigator-empty">
              {{ safeText('assessmentFormBuilder.canvas.navigatorEmpty', 'Empty') }}
            </span>
            <span v-if="section.key === props.selectedSectionKey" class="builder-canvas__navigator-current">
              {{ safeText('assessmentFormBuilder.canvas.navigatorCurrent', 'Current') }}
            </span>
          </span>
        </button>
      </div>
    </nav>

    <div v-if="!props.sections.length" class="builder-canvas__empty-state">
      <div class="builder-canvas__empty-state-card">
        <span class="builder-canvas__empty-state-icon">
          <i class="pi pi-sitemap" />
        </span>
        <div class="builder-canvas__empty-state-copy">
          <h4>{{ safeText('assessmentFormBuilder.emptyStates.noSectionsTitle', 'No sections yet') }}</h4>
          <p>{{ safeText('assessmentFormBuilder.emptyStates.noSectionsDescription', 'Create your first section to start building this assessment form.') }}</p>
        </div>
        <button type="button" class="builder-canvas__action builder-canvas__action--full" @click="handleAddClick">
          <i class="pi pi-plus" />
          {{ safeText('assessmentFormBuilder.emptyStates.noSectionsAction', 'Add Section') }}
        </button>
      </div>
    </div>

    <div v-else class="builder-canvas__sections">
      <article
        v-for="section in props.sections"
        :key="section.key"
        :id="sectionAnchorId(section)"
        class="builder-canvas__section"
        :class="{ 'builder-canvas__section--active': section.key === props.selectedSectionKey }"
        draggable="true"
        @dragstart.stop="handleSectionDragStart(section, $event)"
        @dragend="handleDragEnd"
        @dragover.prevent
        @drop.prevent="handleSectionDrop(section, $event)"
      >
        <div class="builder-canvas__section-header">
          <div>
            <h4>{{ section.title }}</h4>
            <p>{{ section.description }}</p>
          </div>
          <div class="builder-canvas__meta">
            <span class="builder-canvas__badge">{{ section.questionCount }} {{ safeText('assessmentFormBuilder.canvas.questionsLabel', 'questions') }}</span>
            <button
              type="button"
              class="builder-canvas__link"
              :aria-label="`${safeText('assessmentFormBuilder.canvas.navigatorJump', 'Jump to section')}: ${section.title}`"
              @click="handleJumpToSection(section)"
            >
              {{ safeText('assessmentFormBuilder.canvas.focusAction', 'Focus') }}
            </button>
          </div>
        </div>

        <div v-if="(props.sectionQuestions?.[section.key] || []).length" class="builder-canvas__questions">
          <button
            v-for="question in props.sectionQuestions?.[section.key] || []"
            :key="question.id"
            type="button"
            class="builder-canvas__question"
            draggable="true"
            @dragstart.stop="handleQuestionDragStart(question, section, $event)"
            @dragend="handleDragEnd"
            @dragover.prevent
            @drop.prevent="handleQuestionDrop(section, question, $event)"
            @click="handleSelectQuestion(question, section)"
          >
            <span class="builder-canvas__question-title">{{ question.title }}</span>
            <span class="builder-canvas__question-meta">{{ question.group || question.key }}</span>
          </button>
        </div>

        <div v-else class="builder-canvas__empty-question-state">
          <span class="builder-canvas__empty-question-state-icon">
            <i class="pi pi-question-circle" />
          </span>
          <div class="builder-canvas__empty-question-state-copy">
            <h4>{{ safeText('assessmentFormBuilder.emptyStates.noQuestionsTitle', 'No questions yet') }}</h4>
            <p>{{ safeText('assessmentFormBuilder.emptyStates.noQuestionsDescription', 'Add your first question to this section.') }}</p>
          </div>
          <button type="button" class="builder-canvas__footer-action builder-canvas__footer-action--primary" @click="handleAdd(section)">
            {{ safeText('assessmentFormBuilder.emptyStates.noQuestionsAction', 'Add Question') }}
          </button>
        </div>

        <div v-if="(props.sectionQuestions?.[section.key] || []).length" class="builder-canvas__dropzone">
          <i class="pi pi-plus-circle" />
          <p>{{ section.hint }}</p>
        </div>

        <div class="builder-canvas__footer">
          <button type="button" class="builder-canvas__footer-action" @click="handleAdd(section)">
            {{ safeText('assessmentFormBuilder.actions.addQuestion', 'Add question') }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.builder-canvas {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.builder-canvas__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.builder-canvas__navigator {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(180deg, #fbfdff 0%, #f8fbff 100%);
}

.builder-canvas__navigator-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.builder-canvas__navigator-eyebrow {
  margin: 0 0 0.15rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.builder-canvas__navigator-header h4 {
  margin: 0;
  font-size: 0.92rem;
  color: #0f172a;
}

.builder-canvas__navigator-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.55rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.8rem;
  font-weight: 700;
}

.builder-canvas__navigator-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.builder-canvas__navigator-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 170px;
  padding: 0.7rem 0.8rem;
  border-radius: 0.9rem;
  border: 1px solid #dbeafe;
  background: #ffffff;
  color: #0f172a;
  text-align: left;
  cursor: pointer;
}

.builder-canvas__navigator-item--active {
  border-color: #60a5fa;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.1);
}

.builder-canvas__navigator-item--empty {
  border-style: dashed;
}

.builder-canvas__navigator-title {
  font-size: 0.86rem;
  font-weight: 700;
}

.builder-canvas__navigator-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.builder-canvas__navigator-count-label,
.builder-canvas__navigator-empty,
.builder-canvas__navigator-current {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
}

.builder-canvas__navigator-count-label {
  background: #eff6ff;
  color: #1d4ed8;
}

.builder-canvas__navigator-empty {
  background: #fef3c7;
  color: #92400e;
}

.builder-canvas__navigator-current {
  background: #dcfce7;
  color: #166534;
}

.builder-canvas__eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.builder-canvas__header h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.builder-canvas__action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 0.55rem 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.builder-canvas__action--full,
.builder-canvas__footer-action--primary {
  justify-content: center;
  width: 100%;
}

.builder-canvas__sections {
  display: grid;
  gap: 0.85rem;
}

.builder-canvas__empty-state {
  display: flex;
  justify-content: center;
}

.builder-canvas__empty-state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.9rem;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 1.25rem 1.1rem;
  border-radius: 1rem;
  border: 1px dashed #bfdbfe;
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 100%);
  text-align: center;
}

.builder-canvas__empty-state-icon,
.builder-canvas__empty-question-state-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #2563eb;
  font-size: 1.15rem;
}

.builder-canvas__empty-state-copy,
.builder-canvas__empty-question-state-copy {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.builder-canvas__empty-state-copy h4,
.builder-canvas__empty-question-state-copy h4 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.builder-canvas__empty-state-copy p,
.builder-canvas__empty-question-state-copy p {
  margin: 0;
  color: #64748b;
  line-height: 1.5;
}

.builder-canvas__section {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  border-radius: 1rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  padding: 1rem;
}

.builder-canvas__section--active {
  border-color: #60a5fa;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.09);
}

.builder-canvas__section-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.builder-canvas__section-header h4 {
  margin: 0;
  font-size: 0.98rem;
  color: #0f172a;
}

.builder-canvas__section-header p {
  margin: 0.25rem 0 0;
  font-size: 0.84rem;
  color: #64748b;
  line-height: 1.45;
}

.builder-canvas__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.builder-canvas__badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 700;
}

.builder-canvas__link {
  border: none;
  background: transparent;
  color: #2563eb;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.builder-canvas__dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  min-height: 140px;
  border-radius: 0.95rem;
  border: 1px dashed #bfdbfe;
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 100%);
  color: #94a3b8;
  text-align: center;
  padding: 1rem;
}

.builder-canvas__empty-question-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  border-radius: 0.95rem;
  border: 1px dashed #bfdbfe;
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 100%);
  color: #94a3b8;
  text-align: center;
  padding: 1rem;
}

.builder-canvas__questions {
  display: grid;
  gap: 0.5rem;
}

.builder-canvas__question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  padding: 0.7rem 0.85rem;
  border-radius: 0.85rem;
  border: 1px solid #dbeafe;
  background: #ffffff;
  color: #0f172a;
  text-align: left;
  cursor: grab;
}

.builder-canvas__question:active {
  cursor: grabbing;
}

.builder-canvas__question-title {
  font-size: 0.86rem;
  font-weight: 700;
}

.builder-canvas__question-meta {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #60a5fa;
}

.builder-canvas__dropzone i {
  font-size: 1.4rem;
  color: #3b82f6;
}

.builder-canvas__dropzone p {
  margin: 0;
  max-width: 28ch;
}

.builder-canvas__footer {
  display: flex;
  justify-content: flex-end;
}

.builder-canvas__footer-action {
  border: 1px solid #dbeafe;
  background: #ffffff;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 0.5rem 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 768px) {
  .builder-canvas__header,
  .builder-canvas__section-header {
    flex-direction: column;
  }

  .builder-canvas__navigator {
    padding: 0.85rem;
  }

  .builder-canvas__navigator-list {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 0.15rem;
    margin-inline: -0.25rem;
    padding-inline: 0.25rem;
  }

  .builder-canvas__navigator-item {
    min-width: 180px;
    flex: 0 0 auto;
  }

  .builder-canvas__meta {
    align-items: flex-start;
  }

  .builder-canvas__empty-state-card,
  .builder-canvas__empty-question-state {
    padding-inline: 0.9rem;
  }
}
</style>
