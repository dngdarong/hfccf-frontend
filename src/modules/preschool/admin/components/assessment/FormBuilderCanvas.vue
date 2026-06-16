<script setup>
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
  'add-section',
  'drag-section-start',
  'drag-question-start',
  'drag-end',
  'drop-section',
  'drop-question',
])

function handleSelect(section) {
  emit('select-section', section)
}

function handleAdd(section) {
  emit('add-section', section)
}

function handleAddClick() {
  emit('add-section')
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
        <p class="builder-canvas__eyebrow">Canvas</p>
        <h3>Live preview</h3>
      </div>
      <button type="button" class="builder-canvas__action" @click="handleAddClick">
        <i class="pi pi-plus" />
        Add section
      </button>
    </div>

    <div class="builder-canvas__sections">
      <article
        v-for="section in props.sections"
        :key="section.key"
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
            <span class="builder-canvas__badge">{{ section.questionCount }} questions</span>
            <button type="button" class="builder-canvas__link" @click="handleSelect(section)">
              Focus
            </button>
          </div>
        </div>

        <div class="builder-canvas__questions">
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
            @click="handleSelect(section)"
          >
            <span class="builder-canvas__question-title">{{ question.title }}</span>
            <span class="builder-canvas__question-meta">{{ question.group || question.key }}</span>
          </button>
        </div>

        <div class="builder-canvas__dropzone">
          <i class="pi pi-plus-circle" />
          <p>{{ section.hint }}</p>
        </div>

        <div class="builder-canvas__footer">
          <button type="button" class="builder-canvas__footer-action" @click="handleAdd(section)">
            Add question
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

.builder-canvas__sections {
  display: grid;
  gap: 0.85rem;
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

  .builder-canvas__meta {
    align-items: flex-start;
  }
}
</style>
