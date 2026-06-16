<script setup>
import { computed } from 'vue'
import { useLanguage } from '@/composables/useLanguage'

defineOptions({
  name: 'AssessmentFormVersionReview',
})

const props = defineProps({
  versions: {
    type: Array,
    default: () => [],
  },
  selectedVersionId: {
    type: [String, Number],
    default: '',
  },
  comparison: {
    type: Object,
    default: () => ({}),
  },
  currentTemplateStatus: {
    type: String,
    default: 'draft',
  },
  hasUnsavedChanges: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'select-version',
  'duplicate-version',
  'restore-version',
])

const { t, te } = useLanguage()

function safeText(key, fallback) {
  return te(key) ? t(key) : fallback
}

const selectedVersion = computed(() =>
  props.versions.find(version => String(version.id) === String(props.selectedVersionId)) || props.versions[0] || null,
)

function userLabel(user) {
  if (!user) {
    return safeText('assessmentFormBuilder.versionHistory.system', 'System')
  }

  if (typeof user === 'object') {
    return user.name || user.id || safeText('assessmentFormBuilder.versionHistory.system', 'System')
  }

  return String(user)
}

function versionTone(version) {
  if (version?.isCurrent) return 'success'
  if (version?.status === 'published') return 'info'
  if (version?.status === 'archived') return 'warning'
  return 'secondary'
}

function formatDate(value) {
  if (!value) return safeText('assessmentFormBuilder.versionHistory.notAvailable', 'N/A')
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch {
    return value
  }
}
</script>

<template>
  <section class="assessment-form-version-review">
    <div class="assessment-form-version-review__header">
      <div>
        <p class="assessment-form-version-review__eyebrow">
          {{ safeText('assessmentFormBuilder.versionHistory.eyebrow', 'Version history') }}
        </p>
        <h3 class="assessment-form-version-review__title">
          {{ safeText('assessmentFormBuilder.versionHistory.title', 'Review versions') }}
        </h3>
        <p class="assessment-form-version-review__subtitle">
          {{ safeText('assessmentFormBuilder.versionHistory.subtitle', 'Compare, duplicate, or restore a saved template version.') }}
        </p>
      </div>
      <span class="assessment-form-version-review__count">
        {{ versions.length }}
      </span>
    </div>

    <div v-if="loading" class="assessment-form-version-review__state">
      <i class="pi pi-spin pi-spinner" />
      <span>{{ safeText('assessmentFormBuilder.versionHistory.loading', 'Loading versions...') }}</span>
    </div>

    <div v-else-if="!versions.length" class="assessment-form-version-review__state assessment-form-version-review__state--empty">
      <i class="pi pi-info-circle" />
      <span>{{ safeText('assessmentFormBuilder.versionHistory.empty', 'No version history yet.') }}</span>
    </div>

    <div v-else class="assessment-form-version-review__list">
      <div
        v-for="version in versions"
        :key="version.id"
        class="assessment-form-version-review__item"
        :class="{ 'assessment-form-version-review__item--selected': String(version.id) === String(selectedVersionId) }"
        role="button"
        tabindex="0"
        @click="emit('select-version', version)"
        @keydown.enter.prevent="emit('select-version', version)"
        @keydown.space.prevent="emit('select-version', version)"
      >
        <div class="assessment-form-version-review__item-meta">
          <div class="assessment-form-version-review__item-title">
            <strong>{{ safeText('assessmentFormBuilder.versionHistory.versionLabel', 'Version') }} {{ version.versionNumber }}</strong>
            <span class="assessment-form-version-review__badge" :data-tone="versionTone(version)">
              {{ version.isCurrent ? safeText('assessmentFormBuilder.versionHistory.currentDraft', 'Current draft') : (version.status || safeText('assessmentFormBuilder.status.draft', 'Draft')) }}
            </span>
          </div>
          <div class="assessment-form-version-review__item-subtitle">
            <span>{{ safeText('assessmentFormBuilder.versionHistory.sections', 'Sections') }}: {{ version.sectionsCount ?? 0 }}</span>
            <span>{{ safeText('assessmentFormBuilder.versionHistory.questions', 'Questions') }}: {{ version.questionsCount ?? 0 }}</span>
          </div>
          <div class="assessment-form-version-review__item-subtitle">
            <span>{{ safeText('assessmentFormBuilder.versionHistory.updatedAt', 'Updated') }}: {{ formatDate(version.updatedAt || version.createdAt) }}</span>
            <span>{{ safeText('assessmentFormBuilder.versionHistory.publishedAt', 'Published') }}: {{ formatDate(version.publishedAt) }}</span>
          </div>
          <div class="assessment-form-version-review__item-subtitle">
            <span>{{ safeText('assessmentFormBuilder.versionHistory.updatedBy', 'Updated by') }}: {{ userLabel(version.updatedBy || version.publishedBy) }}</span>
            <span>{{ safeText('assessmentFormBuilder.versionHistory.reviewedBy', 'Reviewed by') }}: {{ userLabel(version.reviewedBy) }}</span>
            <span>{{ safeText('assessmentFormBuilder.versionHistory.reviewedAt', 'Reviewed at') }}: {{ formatDate(version.reviewedAt) }}</span>
          </div>
          <div class="assessment-form-version-review__item-notes">
            <p>
              <strong>{{ safeText('assessmentFormBuilder.versionHistory.publishReason', 'Publish reason') }}:</strong>
              {{ version.publishNotes || version.changeSummary || safeText('assessmentFormBuilder.versionHistory.noNotesProvided', 'No notes provided') }}
            </p>
            <p>
              <strong>{{ safeText('assessmentFormBuilder.versionHistory.versionNote', 'Version note') }}:</strong>
              {{ version.versionNotes || safeText('assessmentFormBuilder.versionHistory.noNotesProvided', 'No notes provided') }}
            </p>
            <p>
              <strong>{{ safeText('assessmentFormBuilder.versionHistory.reviewNote', 'Review note') }}:</strong>
              {{ version.reviewNotes || safeText('assessmentFormBuilder.versionHistory.noNotesProvided', 'No notes provided') }}
            </p>
            <p v-if="version.duplicatedFromVersion || version.duplicatedFromTemplateId">
              <strong>{{ safeText('assessmentFormBuilder.versionHistory.duplicatedFrom', 'Duplicated from') }}:</strong>
              {{ version.duplicatedFromVersion || version.duplicatedFromTemplateId }}
            </p>
            <p v-if="version.restoredFromVersion || version.restoredFromTemplateId">
              <strong>{{ safeText('assessmentFormBuilder.versionHistory.restoredFrom', 'Restored from') }}:</strong>
              {{ version.restoredFromVersion || version.restoredFromTemplateId }}
            </p>
          </div>
        </div>

        <div class="assessment-form-version-review__item-actions">
          <button
            type="button"
            class="assessment-form-version-review__action"
            @click.stop="emit('select-version', version)"
          >
            {{ safeText('assessmentFormBuilder.versionHistory.viewVersion', 'View version') }}
          </button>
          <button
            type="button"
            class="assessment-form-version-review__action"
            @click.stop="emit('duplicate-version', version)"
          >
            {{ safeText('assessmentFormBuilder.versionHistory.duplicateDraft', 'Duplicate as draft') }}
          </button>
          <button
            v-if="version.isCurrent && currentTemplateStatus === 'draft'"
            type="button"
            class="assessment-form-version-review__action"
            @click.stop="emit('restore-version', version)"
          >
            {{ safeText('assessmentFormBuilder.versionHistory.restoreVersion', 'Restore version') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedVersion" class="assessment-form-version-review__comparison">
      <div class="assessment-form-version-review__comparison-header">
        <h4>
          {{ safeText('assessmentFormBuilder.versionHistory.compareVersions', 'Compare versions') }}
        </h4>
        <span class="assessment-form-version-review__comparison-note">
          {{ safeText('assessmentFormBuilder.versionHistory.currentDraft', 'Current draft') }} vs {{ safeText('assessmentFormBuilder.versionHistory.versionLabel', 'Version') }} {{ selectedVersion.versionNumber }}
        </span>
      </div>

      <div class="assessment-form-version-review__comparison-grid">
        <div class="assessment-form-version-review__comparison-card">
          <h5>{{ safeText('assessmentFormBuilder.versionHistory.summary', 'Summary') }}</h5>
          <dl>
            <div>
              <dt>{{ safeText('assessmentFormBuilder.versionHistory.templateTitle', 'Template title') }}</dt>
              <dd>{{ comparison.current?.title || safeText('assessmentFormBuilder.versionHistory.notAvailable', 'N/A') }}</dd>
            </div>
            <div>
              <dt>{{ safeText('assessmentFormBuilder.versionHistory.versionTitle', 'Selected title') }}</dt>
              <dd>{{ comparison.selected?.title || safeText('assessmentFormBuilder.versionHistory.notAvailable', 'N/A') }}</dd>
            </div>
            <div>
              <dt>{{ safeText('assessmentFormBuilder.versionHistory.publishReason', 'Publish reason') }}</dt>
              <dd>{{ selectedVersion.publishNotes || selectedVersion.changeSummary || safeText('assessmentFormBuilder.versionHistory.noNotesProvided', 'No notes provided') }}</dd>
            </div>
            <div>
              <dt>{{ safeText('assessmentFormBuilder.versionHistory.versionNote', 'Version note') }}</dt>
              <dd>{{ selectedVersion.versionNotes || safeText('assessmentFormBuilder.versionHistory.noNotesProvided', 'No notes provided') }}</dd>
            </div>
            <div>
              <dt>{{ safeText('assessmentFormBuilder.versionHistory.reviewNote', 'Review note') }}</dt>
              <dd>{{ selectedVersion.reviewNotes || safeText('assessmentFormBuilder.versionHistory.noNotesProvided', 'No notes provided') }}</dd>
            </div>
            <div>
              <dt>{{ safeText('assessmentFormBuilder.versionHistory.templateStatus', 'Status') }}</dt>
              <dd>{{ comparison.selected?.status || safeText('assessmentFormBuilder.status.draft', 'Draft') }}</dd>
            </div>
            <div>
              <dt>{{ safeText('assessmentFormBuilder.versionHistory.sectionCount', 'Section count') }}</dt>
              <dd>{{ comparison.selected?.sectionsCount ?? 0 }}</dd>
            </div>
            <div>
              <dt>{{ safeText('assessmentFormBuilder.versionHistory.questionCount', 'Question count') }}</dt>
              <dd>{{ comparison.selected?.questionsCount ?? 0 }}</dd>
            </div>
          </dl>
        </div>

        <div class="assessment-form-version-review__comparison-card">
          <h5>{{ safeText('assessmentFormBuilder.versionHistory.sectionsChanged', 'Sections changed') }}</h5>
          <ul v-if="comparison.sectionsChanged?.length" class="assessment-form-version-review__change-list">
            <li v-for="item in comparison.sectionsChanged" :key="item.key">
              {{ item.label }}
            </li>
          </ul>
          <p v-else class="assessment-form-version-review__empty-inline">
            {{ safeText('assessmentFormBuilder.versionHistory.noSectionChanges', 'No section changes detected.') }}
          </p>
        </div>

        <div class="assessment-form-version-review__comparison-card">
          <h5>{{ safeText('assessmentFormBuilder.versionHistory.questionsChanged', 'Questions changed') }}</h5>
          <ul v-if="comparison.questionsChanged?.length" class="assessment-form-version-review__change-list">
            <li v-for="item in comparison.questionsChanged" :key="item.key">
              {{ item.label }}
            </li>
          </ul>
          <p v-else class="assessment-form-version-review__empty-inline">
            {{ safeText('assessmentFormBuilder.versionHistory.noQuestionChanges', 'No question changes detected.') }}
          </p>
          <h6 class="assessment-form-version-review__mini-title">
            {{ safeText('assessmentFormBuilder.versionHistory.scoringChanges', 'Scoring changes') }}
          </h6>
          <ul v-if="comparison.scoringChanges?.length" class="assessment-form-version-review__change-list">
            <li v-for="item in comparison.scoringChanges" :key="item.key">
              {{ item.label }}
            </li>
          </ul>
          <p v-else class="assessment-form-version-review__empty-inline">
            {{ safeText('assessmentFormBuilder.versionHistory.noScoringChanges', 'No scoring changes detected.') }}
          </p>
          <h6 class="assessment-form-version-review__mini-title">
            {{ safeText('assessmentFormBuilder.versionHistory.validationChanges', 'Validation changes') }}
          </h6>
          <ul v-if="comparison.validationChanges?.length" class="assessment-form-version-review__change-list">
            <li v-for="item in comparison.validationChanges" :key="item.key">
              {{ item.label }}
            </li>
          </ul>
          <p v-else class="assessment-form-version-review__empty-inline">
            {{ safeText('assessmentFormBuilder.versionHistory.noValidationChanges', 'No validation changes detected.') }}
          </p>
        </div>
      </div>

      <p v-if="hasUnsavedChanges" class="assessment-form-version-review__warning">
        {{ safeText('assessmentFormBuilder.versionHistory.unsavedChangesWarning', 'You have unsaved changes in the current builder.') }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.assessment-form-version-review {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.assessment-form-version-review__header,
.assessment-form-version-review__item-title,
.assessment-form-version-review__item-subtitle,
.assessment-form-version-review__comparison-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.assessment-form-version-review__eyebrow {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #2563eb;
}

.assessment-form-version-review__title,
.assessment-form-version-review__comparison-header h4,
.assessment-form-version-review__comparison-card h5 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
}

.assessment-form-version-review__subtitle,
.assessment-form-version-review__item-subtitle,
.assessment-form-version-review__comparison-note,
.assessment-form-version-review__empty-inline,
.assessment-form-version-review__warning {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
  color: #64748b;
}

.assessment-form-version-review__count {
  min-width: 2rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.25rem 0.55rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
}

.assessment-form-version-review__state {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-radius: 0.9rem;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  padding: 0.85rem 1rem;
  color: #1d4ed8;
}

.assessment-form-version-review__state--empty {
  border-color: #e2e8f0;
  background: #f8fafc;
  color: #475569;
}

.assessment-form-version-review__list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.assessment-form-version-review__item {
  width: 100%;
  border: 1px solid #dbeafe;
  border-radius: 1rem;
  background: #ffffff;
  padding: 0.9rem 1rem;
  text-align: left;
  transition: all 0.2s ease;
}

.assessment-form-version-review__item:hover,
.assessment-form-version-review__item--selected {
  border-color: #93c5fd;
  background: #eff6ff;
}

.assessment-form-version-review__item-meta {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.assessment-form-version-review__item-title {
  justify-content: flex-start;
}

.assessment-form-version-review__item-title strong {
  font-size: 0.92rem;
  color: #0f172a;
}

.assessment-form-version-review__badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #334155;
  background: #e2e8f0;
}

.assessment-form-version-review__badge[data-tone='success'] {
  color: #166534;
  background: #dcfce7;
}

.assessment-form-version-review__badge[data-tone='info'] {
  color: #1d4ed8;
  background: #dbeafe;
}

.assessment-form-version-review__badge[data-tone='warning'] {
  color: #b45309;
  background: #fef3c7;
}

.assessment-form-version-review__item-subtitle {
  flex-wrap: wrap;
  justify-content: flex-start;
}

.assessment-form-version-review__item-notes {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem 0.85rem;
  border-radius: 0.85rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.assessment-form-version-review__item-notes p {
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.45;
  color: #334155;
}

.assessment-form-version-review__item-notes strong {
  color: #0f172a;
}

.assessment-form-version-review__item-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.75rem;
}

.assessment-form-version-review__action {
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  padding: 0.35rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 600;
}

.assessment-form-version-review__action:hover {
  border-color: #93c5fd;
  color: #1d4ed8;
}

.assessment-form-version-review__comparison {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding-top: 0.35rem;
}

.assessment-form-version-review__comparison-grid {
  display: grid;
  gap: 0.75rem;
}

.assessment-form-version-review__comparison-card {
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding: 0.85rem 0.9rem;
}

.assessment-form-version-review__comparison-card dl {
  display: grid;
  gap: 0.6rem;
  margin: 0.75rem 0 0;
}

.assessment-form-version-review__comparison-card dl div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.assessment-form-version-review__comparison-card dt {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.assessment-form-version-review__mini-title {
  margin: 0.85rem 0 0;
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #475569;
}

.assessment-form-version-review__comparison-card dd {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
}

.assessment-form-version-review__change-list {
  display: grid;
  gap: 0.35rem;
  margin: 0.75rem 0 0;
  padding-left: 1rem;
}

.assessment-form-version-review__change-list li {
  font-size: 0.82rem;
  color: #334155;
}

.assessment-form-version-review__warning {
  border-radius: 0.9rem;
  border: 1px solid #fde68a;
  background: #fffbeb;
  color: #92400e;
  padding: 0.8rem 0.9rem;
}

@media (min-width: 1024px) {
  .assessment-form-version-review__comparison-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .assessment-form-version-review__comparison-card:first-child {
    grid-column: 1 / -1;
  }
}
</style>
