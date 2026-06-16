<script setup>
defineOptions({
  name: 'PreschoolAssessmentFormBuilderQuestionPalette',
})

const props = defineProps({
  sections: {
    type: Array,
    default: () => [],
  },
  palette: {
    type: Array,
    default: () => [],
  },
  selectedQuestionKey: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['select-question', 'drag-question-start', 'drag-question-end'])

function handleSelect(question) {
  emit('select-question', question)
}

function handleDragStart(question, event) {
  emit('drag-question-start', { question, event })
}

function handleDragEnd() {
  emit('drag-question-end')
}
</script>

<template>
  <section class="builder-palette">
    <div class="builder-palette__header">
      <div>
        <p class="builder-palette__eyebrow">Question Palette</p>
        <h3>Reusable building blocks</h3>
      </div>
      <span class="builder-palette__count">{{ props.palette.length }}</span>
    </div>

    <div class="builder-palette__sections">
      <article
        v-for="section in props.sections"
        :key="section.key"
        class="builder-palette__section"
      >
        <div class="builder-palette__section-copy">
          <div class="builder-palette__section-icon">
            <i :class="section.icon" />
          </div>
          <div>
            <h4>{{ section.title }}</h4>
            <p>{{ section.description }}</p>
          </div>
        </div>
      </article>
    </div>

    <div class="builder-palette__grid">
      <button
        v-for="question in props.palette"
        :key="question.key"
        type="button"
        class="builder-palette__card"
        :class="{ 'builder-palette__card--active': question.key === props.selectedQuestionKey }"
        @click="handleSelect(question)"
        draggable="true"
        @dragstart="handleDragStart(question, $event)"
        @dragend="handleDragEnd"
      >
        <div class="builder-palette__card-top">
          <span class="builder-palette__card-icon">
            <i :class="question.icon" />
          </span>
          <span class="builder-palette__card-group">{{ question.group }}</span>
        </div>
        <div class="builder-palette__card-copy">
          <h4>{{ question.title }}</h4>
          <p>{{ question.description }}</p>
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
.builder-palette {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.builder-palette__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.builder-palette__eyebrow {
  margin: 0 0 0.25rem;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.builder-palette__header h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
}

.builder-palette__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.82rem;
  font-weight: 700;
}

.builder-palette__sections {
  display: grid;
  gap: 0.75rem;
}

.builder-palette__section {
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  padding: 0.85rem;
}

.builder-palette__section-copy {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.builder-palette__section-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  background: #eff6ff;
  color: #2563eb;
  flex-shrink: 0;
}

.builder-palette__section-copy h4,
.builder-palette__card-copy h4 {
  margin: 0;
  font-size: 0.94rem;
  color: #0f172a;
}

.builder-palette__section-copy p,
.builder-palette__card-copy p {
  margin: 0.25rem 0 0;
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.45;
}

.builder-palette__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.builder-palette__card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  padding: 0.9rem;
  border-radius: 1rem;
  border: 1px solid #dbeafe;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.builder-palette__card:hover,
.builder-palette__card:focus-visible,
.builder-palette__card--active {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.12);
  border-color: #93c5fd;
  outline: none;
}

.builder-palette__card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.builder-palette__card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  background: #dbeafe;
  color: #1d4ed8;
}

.builder-palette__card-group {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #60a5fa;
}

.builder-palette__card-copy {
  display: flex;
  flex-direction: column;
}
</style>
