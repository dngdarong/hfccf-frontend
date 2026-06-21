<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import MainLayout from '@/layouts/MainLayout.vue'
import Button from '@/components/buttons/Button.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import { useLanguage } from '@/composables/useLanguage'
import AssessmentPageHeader from '@/modules/preschool/admin/components/assessment/AssessmentPageHeader.vue'
import FormBuilderQuestionPalette from '@/modules/preschool/admin/components/assessment/FormBuilderQuestionPalette.vue'
import FormBuilderCanvas from '@/modules/preschool/admin/components/assessment/FormBuilderCanvas.vue'
import FormBuilderQuestionSettings from '@/modules/preschool/admin/components/assessment/FormBuilderQuestionSettings.vue'
import AssessmentFormVersionReview from '@/modules/preschool/admin/components/assessment/AssessmentFormVersionReview.vue'
import {
  archiveAssessmentForm,
  buildFormTemplatePayload,
  createAssessmentForm,
  duplicateAssessmentForm,
  fetchAssessmentForm,
  fetchAssessmentFormVersions,
  fetchAssessmentQuestionTypes,
  publishAssessmentForm,
  restoreAssessmentForm,
  updateAssessmentForm,
} from '@/modules/preschool/services/api/preschoolAssessmentApi'
import {
  PRESCHOOL_ASSESSMENT_FORM_BUILDER_PALETTE,
  PRESCHOOL_ASSESSMENT_FORM_BUILDER_SECTIONS,
  PRESCHOOL_ASSESSMENT_FORM_BUILDER_DEFAULT_SECTIONS,
  PRESCHOOL_ASSESSMENT_FORM_BUILDER_SECTION_QUESTION_SEEDS,
} from './constants/preschoolAssessmentFormBuilder'

defineOptions({
  name: 'PreschoolAssessmentFormBuilderPage',
})

const { t, te } = useLanguage()
const route = useRoute()
const router = useRouter()
const toast = useToast()
let questionSequence = 0
const selectedQuestionKey = ref(PRESCHOOL_ASSESSMENT_FORM_BUILDER_PALETTE[0]?.key || null)
const selectedQuestionId = ref('')
const selectedSectionKey = ref(PRESCHOOL_ASSESSMENT_FORM_BUILDER_DEFAULT_SECTIONS[0]?.key || null)
const builderSections = ref(
  PRESCHOOL_ASSESSMENT_FORM_BUILDER_DEFAULT_SECTIONS.map((section, index) => ({
    ...section,
    order: index,
    code: section.code || section.key,
  }))
)
const builderSectionQuestionMap = ref(createInitialSectionQuestionMap())
const currentTemplateId = ref(route.query.templateId ? String(route.query.templateId) : '')
const templateStatus = ref('draft')
const templateVersion = ref(1)
const templateName = ref('')
const templateDescription = ref('')
const publishNote = ref('')
const versionNote = ref('')
const reviewNote = ref('')
const duplicateNote = ref('')
const restoreNote = ref('')
const templateSnapshot = ref('')
const isTemplateLoading = ref(false)
const isTemplateSaving = ref(false)
const templateError = ref('')
const templateNotice = ref('')
const assessmentVersions = ref([])
const selectedVersionId = ref('')
const isVersionHistoryLoading = ref(false)
const versionHistoryError = ref('')
const questionTypeLookup = ref({})
const dragState = ref({
  type: null,
  questionKey: null,
  questionId: null,
  sectionKey: null,
  fromSectionKey: null,
})
const questionState = ref({})

function safeText(key, fallback) {
  return te(key) ? t(key) : fallback
}

const workspaceStats = computed(() => [
  {
    label: safeText('assessmentFormBuilder.summary.sections', 'Sections'),
    value: String(builderSections.value.length),
  },
  {
    label: safeText('assessmentFormBuilder.summary.questions', 'Questions'),
    value: String(totalQuestionCount.value),
  },
  {
    label: safeText('assessmentFormBuilder.summary.version', 'Version'),
    value: String(templateVersion.value || '1'),
  },
  {
    label: safeText('assessmentFormBuilder.summary.status', 'Status'),
    value: templateStatusLabel.value,
  },
  {
    label: safeText('assessmentFormBuilder.summary.changeState', 'Changes'),
    value: hasUnsavedChanges.value
      ? safeText('assessmentFormBuilder.summary.unsaved', 'Unsaved changes')
      : safeText('assessmentFormBuilder.summary.saved', 'Saved'),
  },
])

const templateStatusLabel = computed(() => {
  const key = `assessmentFormBuilder.status.${templateStatus.value}`

  return safeText(key, templateStatus.value || 'draft')
})

const templateStatusTone = computed(() => {
  if (templateStatus.value === 'published') return 'success'
  if (templateStatus.value === 'archived') return 'warning'
  return 'secondary'
})

const hasUnsavedChanges = computed(() => templateSnapshot.value !== serializeTemplateSnapshot())

const builderPaletteSections = computed(() =>
  PRESCHOOL_ASSESSMENT_FORM_BUILDER_SECTIONS.map(section => ({
    ...section,
    title: safeText(section.titleKey, section.titleFallback),
    description: safeText(section.descriptionKey, section.descriptionFallback),
  }))
)

const builderCanvasSections = computed(() =>
  builderSections.value.map(section => ({
    ...section,
    title: safeText(`assessmentFormBuilder.sections.${section.key}.title`, section.titleFallback),
    description: safeText(`assessmentFormBuilder.sections.${section.key}.description`, section.descriptionFallback),
    hint: safeText(`assessmentFormBuilder.sections.${section.key}.hint`, section.hintFallback),
    questionCount: (builderSectionQuestionMap.value[section.key] || []).length,
  }))
)

const paletteGroups = computed(() => {
  return PRESCHOOL_ASSESSMENT_FORM_BUILDER_PALETTE.map(item => ({
    ...item,
    title: safeText(`assessmentFormBuilder.palette.${item.key}.title`, item.titleFallback),
    description: safeText(`assessmentFormBuilder.palette.${item.key}.description`, item.descriptionFallback),
  }))
})

function handleQuestionSelect(payload) {
  const question = payload?.question || payload
  const section = payload?.section || null

  if (!question) {
    return
  }

  selectedQuestionKey.value = question.key
  selectedQuestionId.value = section?.key ? String(question.id || '') : ''

  if (section?.key) {
    selectedSectionKey.value = section.key
    return
  }

  if (question.group === 'core') {
    selectedSectionKey.value = 'studentProfile'
    return
  }
  if (question.group === 'choices') {
    selectedSectionKey.value = 'family'
    return
  }
  selectedSectionKey.value = 'scoring'
}

function handleSectionSelect(section) {
  selectedSectionKey.value = section.key
}

function handleAddQuestion(payload) {
  const section = payload?.section || payload

  if (!section?.key) return

  addQuestionToSection(section.key, selectedQuestionKey.value || selectedQuestion.value?.key || 'shortText')
}

function handlePaletteDragStart(payload) {
  dragState.value = {
    type: 'palette-question',
    questionKey: payload.question?.key || null,
    questionId: null,
    sectionKey: null,
    fromSectionKey: null,
  }
}

function handleDragEnd() {
  clearDragState()
}

function handleSectionDragStart(payload) {
  dragState.value = {
    type: 'section',
    questionKey: null,
    questionId: null,
    sectionKey: payload.section?.key || null,
    fromSectionKey: null,
  }
}

function handleQuestionDragStart(payload) {
  dragState.value = {
    type: 'question',
    questionKey: payload.question?.key || null,
    questionId: payload.question?.id || null,
    sectionKey: null,
    fromSectionKey: payload.section?.key || null,
  }
}

const selectedPaletteQuestion = computed(() =>
  paletteGroups.value.find(question => question.key === selectedQuestionKey.value) || paletteGroups.value[0] || null
)

const selectedSection = computed(() =>
  builderCanvasSections.value.find(section => section.key === selectedSectionKey.value) || builderCanvasSections.value[0] || null
)

function findQuestionInSection(sectionKey, questionKey = null, questionId = null) {
  const questions = builderSectionQuestionMap.value?.[sectionKey] || []

  if (questionId) {
    return questions.find(question => String(question.id) === String(questionId)) || null
  }

  if (questionKey) {
    return questions.find(question => question.key === questionKey || question.answerType === questionKey) || null
  }

  return questions[0] || null
}

const selectedQuestion = computed(() => {
  if (selectedSection.value) {
    const question = findQuestionInSection(
      selectedSection.value.key,
      selectedQuestionKey.value,
      selectedQuestionId.value,
    )

    if (question) {
      return question
    }
  }

  return selectedPaletteQuestion.value
})

const totalQuestionCount = computed(() =>
  Object.values(builderSectionQuestionMap.value).reduce((count, sectionQuestions) => count + sectionQuestions.length, 0)
)

const selectedVersion = computed(() =>
  assessmentVersions.value.find(version => String(version.id) === String(selectedVersionId.value))
    || assessmentVersions.value.find(version => version.isCurrent)
    || assessmentVersions.value[0]
    || null,
)

const versionComparison = computed(() =>
  compareTemplateSnapshots(
    buildCurrentTemplateSnapshot(),
    selectedVersion.value?.snapshot || null,
  ),
)

function createInitialSectionQuestionMap() {
  return Object.fromEntries(
    PRESCHOOL_ASSESSMENT_FORM_BUILDER_DEFAULT_SECTIONS.map(section => [
      section.key,
      createSectionQuestions(section.key),
    ])
  )
}

function createSectionQuestions(sectionKey) {
  const seeds = PRESCHOOL_ASSESSMENT_FORM_BUILDER_SECTION_QUESTION_SEEDS[sectionKey] || []

  return seeds.map((seed, index) => createQuestionInstance(seed.key, sectionKey, index, seed))
}

function createQuestionInstance(questionKey, sectionKey, index = 0, seed = null, state = null) {
  const paletteQuestion = PRESCHOOL_ASSESSMENT_FORM_BUILDER_PALETTE.find(question => question.key === questionKey)
  const normalizedState = state || {}
  const title = normalizedState.label
    || seed?.titleFallback
    || paletteQuestion?.title
    || safeText(`assessmentFormBuilder.palette.${questionKey}.title`, questionKey)
  const description = normalizedState.helpText
    || seed?.descriptionFallback
    || paletteQuestion?.description
    || safeText(`assessmentFormBuilder.palette.${questionKey}.description`, '')
  const answerType = normalizedState.answerType || questionKey
  const questionGroup = paletteQuestion?.group || 'core'

  return {
    id: `${sectionKey}-${questionKey}-${index + 1}-${questionSequence += 1}`,
    key: questionKey,
    title,
    description,
    group: questionGroup,
    answerType,
    required: Boolean(normalizedState.required ?? false),
    score: normalizedState.score ?? (questionKey === 'rating' || questionKey === 'table' ? 10 : 5),
    validationMode: normalizedState.validationMode
      || (questionKey === 'table' ? 'strict' : 'basic'),
    options: normalizedState.options
      ?? (questionKey === 'dropdown' || questionKey === 'rating'
        ? 'Option 1, Option 2'
        : ''),
  }
}

function clearDragState() {
  dragState.value = {
    type: null,
    questionKey: null,
    questionId: null,
    sectionKey: null,
    fromSectionKey: null,
  }
}

function reorderSections(fromKey, toKey) {
  if (!fromKey || !toKey || fromKey === toKey) return

  const nextSections = [...builderSections.value]
  const fromIndex = nextSections.findIndex(section => section.key === fromKey)
  const toIndex = nextSections.findIndex(section => section.key === toKey)

  if (fromIndex < 0 || toIndex < 0) return

  const [movedSection] = nextSections.splice(fromIndex, 1)
  const insertIndex = fromIndex < toIndex ? toIndex - 1 : toIndex

  nextSections.splice(insertIndex, 0, movedSection)
  builderSections.value = nextSections
}

function addQuestionToSection(sectionKey, questionKey, beforeQuestionId = null) {
  const targetQuestions = [...(builderSectionQuestionMap.value[sectionKey] || [])]
  const isSelectedQuestionType = questionKey === selectedQuestionKey.value
  const nextQuestion = createQuestionInstance(
    questionKey,
    sectionKey,
    targetQuestions.length,
    null,
    isSelectedQuestionType ? questionState.value : null,
  )
  const insertIndex = beforeQuestionId
    ? targetQuestions.findIndex(question => question.id === beforeQuestionId)
    : targetQuestions.length

  targetQuestions.splice(insertIndex >= 0 ? insertIndex : targetQuestions.length, 0, nextQuestion)
  builderSectionQuestionMap.value = {
    ...builderSectionQuestionMap.value,
    [sectionKey]: targetQuestions,
  }
}

function updateQuestionInSection(sectionKey, questionId, nextState = {}) {
  if (!sectionKey || !questionId) return false

  const targetQuestions = [...(builderSectionQuestionMap.value[sectionKey] || [])]
  const questionIndex = targetQuestions.findIndex(question => String(question.id) === String(questionId))

  if (questionIndex < 0) return false

  const currentQuestion = targetQuestions[questionIndex]
  const nextAnswerType = nextState.answerType || currentQuestion.answerType || currentQuestion.key
  const paletteQuestion = PRESCHOOL_ASSESSMENT_FORM_BUILDER_PALETTE.find(question => question.key === nextAnswerType)

  targetQuestions[questionIndex] = {
    ...currentQuestion,
    key: nextAnswerType,
    title: nextState.label ?? currentQuestion.title,
    description: nextState.helpText ?? currentQuestion.description,
    group: paletteQuestion?.group || currentQuestion.group || 'core',
    answerType: nextAnswerType,
    required: Boolean(nextState.required ?? currentQuestion.required ?? false),
    score: Number(nextState.score ?? currentQuestion.score ?? 0),
    validationMode: nextState.validationMode || currentQuestion.validationMode || 'basic',
    options: nextState.options ?? currentQuestion.options ?? '',
  }

  builderSectionQuestionMap.value = {
    ...builderSectionQuestionMap.value,
    [sectionKey]: targetQuestions,
  }

  return true
}

function moveSelectedQuestionToSection(nextSectionKey, questionId) {
  const currentQuestionId = questionId || selectedQuestionId.value
  if (!currentQuestionId || !nextSectionKey) return false

  const currentLocation = Object.entries(builderSectionQuestionMap.value).find(([, questions]) =>
    questions.some(question => String(question.id) === String(currentQuestionId)),
  )

  if (!currentLocation) return false

  const [fromSectionKey] = currentLocation
  if (fromSectionKey === nextSectionKey) return true

  moveQuestionToSection(currentQuestionId, fromSectionKey, nextSectionKey)
  selectedSectionKey.value = nextSectionKey
  return true
}

function moveQuestionToSection(questionId, fromSectionKey, toSectionKey, beforeQuestionId = null) {
  if (!questionId || !fromSectionKey || !toSectionKey) return

  const fromQuestions = [...(builderSectionQuestionMap.value[fromSectionKey] || [])]
  const sourceIndex = fromQuestions.findIndex(question => question.id === questionId)

  if (sourceIndex < 0) return

  const [movedQuestion] = fromQuestions.splice(sourceIndex, 1)
  const targetQuestions = fromSectionKey === toSectionKey
    ? fromQuestions
    : [...(builderSectionQuestionMap.value[toSectionKey] || [])]

  const insertIndex = beforeQuestionId
    ? targetQuestions.findIndex(question => question.id === beforeQuestionId)
    : targetQuestions.length

  targetQuestions.splice(insertIndex >= 0 ? insertIndex : targetQuestions.length, 0, movedQuestion)

  builderSectionQuestionMap.value = {
    ...builderSectionQuestionMap.value,
    [fromSectionKey]: fromSectionKey === toSectionKey ? targetQuestions : fromQuestions,
    [toSectionKey]: targetQuestions,
  }
}

function handleSectionDrop(payload) {
  if (dragState.value.type === 'section') {
    reorderSections(dragState.value.sectionKey, payload.section?.key)
  }

  if (dragState.value.type === 'palette-question' && dragState.value.questionKey) {
    addQuestionToSection(payload.section?.key, dragState.value.questionKey)
  }

  if (dragState.value.type === 'question' && dragState.value.questionId) {
    moveQuestionToSection(
      dragState.value.questionId,
      dragState.value.fromSectionKey,
      payload.section?.key,
    )
  }

  clearDragState()
}

function handleQuestionDrop(payload) {
  if (
    dragState.value.type === 'question'
    && dragState.value.questionId === payload.question?.id
    && dragState.value.fromSectionKey === payload.section?.key
  ) {
    clearDragState()
    return
  }

  if (dragState.value.type === 'palette-question' && dragState.value.questionKey) {
    addQuestionToSection(payload.section?.key, dragState.value.questionKey, payload.question?.id)
  }

  if (dragState.value.type === 'question' && dragState.value.questionId) {
    moveQuestionToSection(
      dragState.value.questionId,
      dragState.value.fromSectionKey,
      payload.section?.key,
      payload.question?.id,
    )
  }

  clearDragState()
}

function createQuestionState(question, section) {
  return {
    label: question?.title || '',
    helpText: question?.description || '',
    required: Boolean(question?.required ?? false),
    score: Number(question?.score ?? (question?.group === 'structured' ? 10 : 5)),
    answerType: question?.answerType || question?.key || 'shortText',
    sectionKey: section?.key || '',
    validationMode: question?.validationMode || (question?.group === 'structured' ? 'strict' : 'basic'),
    options: question?.options || '',
  }
}

function normalizeNoteValue(value) {
  return String(value ?? '').trim()
}

function normalizeQuestionOptions(value) {
  if (Array.isArray(value)) {
    return value
      .map(option => String(option?.label ?? option?.value ?? option ?? '').trim())
      .filter(Boolean)
  }

  return String(value ?? '')
    .split(',')
    .map(option => option.trim())
    .filter(Boolean)
}

function resetQuestionState() {
  questionState.value = createQuestionState(selectedQuestion.value, selectedSection.value)
}

function handleQuestionStateUpdate(nextState) {
  const normalizedState = {
    label: String(nextState?.label ?? '').trim(),
    helpText: String(nextState?.helpText ?? '').trim(),
    required: Boolean(nextState?.required ?? false),
    score: Number(nextState?.score ?? 0),
    answerType: String(nextState?.answerType ?? selectedQuestion.value?.key ?? 'shortText').trim(),
    sectionKey: String(nextState?.sectionKey || selectedSection.value?.key || '').trim(),
    validationMode: String(nextState?.validationMode ?? 'basic').trim(),
    options: nextState?.options ?? '',
  }

  questionState.value = normalizedState

  if (!selectedSection.value || !selectedQuestion.value) {
    return
  }

  const targetSectionKey = normalizedState.sectionKey || selectedSection.value.key
  const targetQuestionId = selectedQuestionId.value || selectedQuestion.value.id

  if (targetSectionKey && targetSectionKey !== selectedSection.value.key) {
    moveSelectedQuestionToSection(targetSectionKey, targetQuestionId)
  }

  const currentSectionKey = targetSectionKey || selectedSection.value.key
  updateQuestionInSection(currentSectionKey, targetQuestionId, normalizedState)

  if (normalizedState.answerType && normalizedState.answerType !== selectedQuestionKey.value) {
    selectedQuestionKey.value = normalizedState.answerType
  }
}

function handleSettingsApply() {
  handleQuestionStateUpdate({
    ...questionState.value,
    sectionKey: selectedSection.value?.key || questionState.value.sectionKey,
  })
}

resetQuestionState()

watch(
  [selectedQuestionKey, selectedSectionKey, selectedQuestionId],
  () => {
    resetQuestionState()
  },
)

watch(
  () => route.query.templateId,
  (nextTemplateId) => {
    const normalizedId = nextTemplateId ? String(nextTemplateId) : ''
    if (normalizedId !== currentTemplateId.value) {
      loadTemplate(normalizedId)
    }
  },
)

function serializeTemplateSnapshot() {
  return JSON.stringify(buildCurrentTemplateSnapshot())
}

function buildCurrentTemplateSnapshot() {
  return {
    id: currentTemplateId.value,
    name: templateName.value,
    description: templateDescription.value,
    status: templateStatus.value,
    version: templateVersion.value,
    publishNote: publishNote.value,
    versionNote: versionNote.value,
    reviewNote: reviewNote.value,
    sections: builderSections.value.map(section => ({
      id: section.id || null,
      code: section.code || section.key,
      key: section.key,
      title: section.title,
      description: section.description,
      order: section.order,
      questionCount: (builderSectionQuestionMap.value[section.key] || []).length,
      questions: (builderSectionQuestionMap.value[section.key] || []).map(question => ({
        id: question.id || null,
        key: question.key,
        title: question.title,
        description: question.description,
        group: question.group,
        answerType: question.answerType || question.key,
        required: Boolean(question.required),
        score: Number(question.score || 0),
        validationMode: question.validationMode || 'basic',
        options: question.options || '',
      })),
    })),
  }
}

function normalizeVersionSnapshot(snapshot) {
  if (!snapshot) {
    return null
  }

  const raw = typeof snapshot === 'string'
    ? (() => {
        try {
          return JSON.parse(snapshot)
        } catch {
          return null
        }
      })()
    : snapshot

  if (!raw) {
    return null
  }

  const template = raw.template || raw
  const sections = Array.isArray(raw.sections) ? raw.sections : []

  return {
    title: String(template.name ?? template.title ?? '').trim(),
    description: String(template.description ?? '').trim(),
    status: String(template.status ?? 'draft').trim(),
    sectionsCount: Number(raw.sections_count ?? sections.length ?? 0),
    questionsCount: Number(raw.questions_count ?? sections.reduce((count, section) => count + (Array.isArray(section.questions) ? section.questions.length : 0), 0)),
    sections: sections.map((section) => ({
      code: String(section.code ?? section.key ?? section.title ?? '').trim(),
      title: String(section.title ?? '').trim(),
      description: String(section.description ?? '').trim(),
      sortOrder: Number(section.sort_order ?? section.sortOrder ?? 0),
      questions: (section.questions || []).map((question) => ({
        code: String(question.code ?? '').trim(),
        label: String(question.label ?? '').trim(),
        questionTypeKey: String(question.question_type_key ?? question.questionTypeKey ?? question.answerType ?? question.questionType?.key ?? '').trim(),
        questionTypeLabel: String(question.question_type_label ?? question.questionTypeLabel ?? question.questionType?.label ?? '').trim(),
        isRequired: Boolean(question.is_required ?? question.isRequired ?? question.required ?? false),
        isScored: Boolean(question.is_scored ?? question.isScored ?? question.scored ?? false),
        score: Number(question.max_score ?? question.score ?? 0),
        validationRules: question.validation_rules ?? question.validationRules ?? (question.validationMode ? { mode: question.validationMode } : {}),
        options: normalizeQuestionOptions(question.options),
      })),
    })),
    raw,
  }
}

function createQuestionTypeMap(questionTypes = []) {
  return Object.fromEntries(
    questionTypes.map(type => [String(type.id), String(type.key ?? '').trim()]),
  )
}

function resolveQuestionTypeKey(question = {}, typeMap = {}) {
  return String(
    question.questionTypeKey
    || question.question_type_key
    || question.answerType
    || question.answer_type
    || typeMap[String(question.question_type_id ?? question.questionTypeId ?? '')]
    || question.key
    || 'shortText',
  ).trim()
}

function normalizeSectionForBuilder(section = {}, index = 0, typeMap = {}) {
  const questions = Array.isArray(section.questions) ? section.questions : []

  return {
    id: section.id || null,
    key: section.code || section.key || `section-${index + 1}`,
    code: section.code || section.key || `section-${index + 1}`,
    title: section.title || section.code || `Section ${index + 1}`,
    description: section.description || '',
    hint: section.description || '',
    order: section.sort_order ?? section.sortOrder ?? index + 1,
    questionCount: questions.length,
    questions: questions.map((question, questionIndex) => ({
      id: question.id || `${section.code || section.key || index + 1}-question-${questionIndex + 1}`,
      key: resolveQuestionTypeKey(question, typeMap) || 'shortText',
      title: question.label || question.question_text || `Question ${questionIndex + 1}`,
      description: question.help_text || '',
      group: 'review',
      answerType: resolveQuestionTypeKey(question, typeMap) || 'shortText',
      required: Boolean(question.is_required ?? false),
      score: Number(question.max_score ?? question.score ?? 0),
      validationMode: String(question.validation_rules?.mode ?? question.validationMode ?? 'basic'),
      options: Array.isArray(question.options) ? question.options.map(option => option.label).filter(Boolean).join(', ') : '',
    })),
  }
}

function buildCurrentTemplatePayloadFromSnapshot(snapshot = null) {
  const normalized = normalizeVersionSnapshot(snapshot)

  if (!normalized) {
    return serializeTemplatePayload()
  }

  const sections = normalized.sections.map((section, sectionIndex) => ({
    id: null,
    code: section.code || `section-${sectionIndex + 1}`,
    title: section.title,
    description: section.description,
    sortOrder: section.sortOrder || sectionIndex + 1,
    settings: {
      hint: section.description,
    },
    questions: section.questions.map((question, questionIndex) => ({
      id: null,
      code: question.code || `question-${questionIndex + 1}`,
      label: question.label,
      helpText: question.description,
      answerType: question.questionTypeKey || 'shortText',
      questionTypeKey: question.questionTypeKey || 'shortText',
      required: question.isRequired,
      score: question.score,
      validationMode: question.validationRules?.mode || 'basic',
      options: question.options.join(', '),
      sortOrder: questionIndex + 1,
    })),
  }))

  return buildFormTemplatePayload({
    id: '',
    name: normalized.title || safeText('assessmentFormBuilder.title', 'Form Builder'),
    description: normalized.description || safeText('assessmentFormBuilder.subtitle', 'Design assessment forms, scoring rubrics, and reusable question layouts.'),
    category: 'preschool_assessment',
    settings: {
      builder: true,
      module: 'preschool',
      status: normalized.status || 'draft',
    },
  }, sections)
}

function compareTemplateSnapshots(currentSnapshot, selectedSnapshot) {
  const current = normalizeVersionSnapshot(currentSnapshot)
  const selected = normalizeVersionSnapshot(selectedSnapshot)

  if (!selected) {
    return {
      current: current ? {
        title: current.title,
        description: current.description,
        status: current.status,
        sectionsCount: current.sectionsCount,
        questionsCount: current.questionsCount,
      } : null,
      selected: null,
      sectionsChanged: [],
      questionsChanged: [],
      scoringChanges: [],
      validationChanges: [],
    }
  }

  const currentSections = current?.sections || []
  const selectedSections = selected.sections || []

  const currentSectionMap = new Map(currentSections.map(section => [section.code || section.title, section]))
  const currentQuestionMap = new Map()

  currentSections.forEach(section => {
    section.questions.forEach(question => {
      currentQuestionMap.set(question.code || question.label, question)
    })
  })

  const sectionsChanged = []
  const questionsChanged = []
  const scoringChanges = []
  const validationChanges = []

  selectedSections.forEach(section => {
    const key = section.code || section.title
    const currentSection = currentSectionMap.get(key)

    if (!currentSection) {
      sectionsChanged.push({
        key,
        label: `${section.title} (${safeText('assessmentFormBuilder.versionHistory.added', 'added')})`,
      })
      return
    }

    if (currentSection.title !== section.title || currentSection.description !== section.description) {
      sectionsChanged.push({
        key,
        label: `${section.title} (${safeText('assessmentFormBuilder.versionHistory.changed', 'changed')})`,
      })
    }

    section.questions.forEach(question => {
      const questionKey = question.code || question.label
      const currentQuestion = currentQuestionMap.get(questionKey)

      if (!currentQuestion) {
        questionsChanged.push({
          key: questionKey,
          label: `${question.label} (${safeText('assessmentFormBuilder.versionHistory.added', 'added')})`,
        })
        return
      }

      if (currentQuestion.label !== question.label || currentQuestion.questionTypeKey !== question.questionTypeKey) {
        questionsChanged.push({
          key: questionKey,
          label: `${question.label} (${safeText('assessmentFormBuilder.versionHistory.changed', 'changed')})`,
        })
      }

      if (currentQuestion.score !== question.score) {
        scoringChanges.push({
          key: `${questionKey}-score`,
          label: `${question.label}: ${currentQuestion.score || 0} → ${question.score || 0}`,
        })
      }

      if (JSON.stringify(currentQuestion.validationRules || {}) !== JSON.stringify(question.validationRules || {})) {
        validationChanges.push({
          key: `${questionKey}-validation`,
          label: `${question.label}: ${safeText('assessmentFormBuilder.versionHistory.validationChanged', 'validation changed')}`,
        })
      }
    })
  })

  return {
    current: current ? {
      title: current.title,
      description: current.description,
      status: current.status,
      sectionsCount: current.sectionsCount,
      questionsCount: current.questionsCount,
    } : null,
    selected: {
      title: selected.title,
      description: selected.description,
      status: selected.status,
      sectionsCount: selected.sectionsCount,
      questionsCount: selected.questionsCount,
    },
    sectionsChanged,
    questionsChanged,
    scoringChanges,
    validationChanges,
  }
}

function serializeTemplatePayload() {
  const sections = builderSections.value.map(section => ({
    id: section.id || null,
    code: section.code || section.key,
    title: section.title,
    description: section.description,
    sortOrder: section.order,
    settings: {
      hint: section.hint,
    },
    questions: (builderSectionQuestionMap.value[section.key] || []).map((question, index) => ({
      id: question.id || null,
      code: question.code || question.key,
      label: question.title,
      helpText: question.description,
      answerType: question.answerType || question.key,
      questionTypeKey: question.answerType || question.key,
      required: Boolean(question.required),
      score: Number(question.score || 0),
      validationMode: question.validationMode || 'basic',
      options: question.options || '',
      sortOrder: index + 1,
    })),
  }))

  return buildFormTemplatePayload({
    id: currentTemplateId.value,
    name: templateName.value || safeText('assessmentFormBuilder.title', 'Form Builder'),
    description: templateDescription.value || safeText('assessmentFormBuilder.subtitle', 'Design assessment forms, scoring rubrics, and reusable question layouts.'),
    category: 'preschool_assessment',
    publishNotes: publishNote.value,
    versionNotes: versionNote.value,
    reviewNotes: reviewNote.value,
    settings: {
      builder: true,
      module: 'preschool',
      status: templateStatus.value,
    },
    sections,
  }, sections)
}

function hydrateBuilderTemplate(template) {
  currentTemplateId.value = String(template?.id || '')
  templateStatus.value = template?.status || 'draft'
  templateVersion.value = template?.currentVersion || template?.current_version || 1
  templateName.value = template?.name || safeText('assessmentFormBuilder.title', 'Form Builder')
  templateDescription.value = template?.description || safeText(
    'assessmentFormBuilder.subtitle',
    'Design assessment forms, scoring rubrics, and reusable question layouts.',
  )
  publishNote.value = normalizeNoteValue(template?.publishNotes ?? template?.changeSummary ?? template?.versionNotes ?? template?.version_notes)
  versionNote.value = normalizeNoteValue(template?.versionNotes ?? template?.version_notes)
  reviewNote.value = normalizeNoteValue(template?.reviewNotes ?? template?.review_notes)
  duplicateNote.value = ''
  restoreNote.value = ''

  const sections = Array.isArray(template?.sections) && template.sections.length > 0
    ? template.sections.map((section, index) => ({
        id: section.id || null,
        key: section.code || `section-${section.id || index + 1}`,
        code: section.code || `section-${section.id || index + 1}`,
        title: section.title || section.code || `Section ${index + 1}`,
        description: section.description || '',
        hint: section.description || '',
        order: section.sortOrder ?? section.sort_order ?? index + 1,
        questionCount: Array.isArray(section.questions) ? section.questions.length : 0,
      }))
    : PRESCHOOL_ASSESSMENT_FORM_BUILDER_DEFAULT_SECTIONS.map((section, index) => ({
        ...section,
        id: null,
        code: section.code || section.key,
        key: section.key,
        order: index + 1,
      }))

  builderSections.value = sections
  selectedSectionKey.value = sections[0]?.key || selectedSectionKey.value
  builderSectionQuestionMap.value = Object.fromEntries(
    sections.map((section) => {
      const sourceQuestions = template?.sections?.find(item => (item.code || item.id) === (section.code || section.id))?.questions || []
      return [
        section.key,
        sourceQuestions.length > 0
          ? sourceQuestions.map((question, qIndex) => ({
              id: question.id || `${section.key}-question-${qIndex + 1}`,
              key: question.questionTypeKey || question.question_type_key || question.answerType || 'shortText',
              title: question.label || question.question_text || `Question ${qIndex + 1}`,
              description: question.helpText || question.help_text || '',
              group: question.questionTypeKey || question.question_type_key || 'core',
              answerType: question.questionTypeKey || question.question_type_key || 'shortText',
              required: Boolean(question.isRequired ?? question.is_required ?? false),
              score: Number(question.maxScore ?? question.max_score ?? 0),
              validationMode: question.validationRules?.mode || question.validation_rules?.mode || 'basic',
              options: Array.isArray(question.options)
                ? question.options.map(option => option.label || option.value).filter(Boolean).join(', ')
                : '',
              code: question.code || null,
            }))
          : createSectionQuestions(section.key),
      ]
    }),
  )
  selectedQuestionId.value = builderSectionQuestionMap.value[selectedSectionKey.value]?.[0]?.id || ''

  resetQuestionState()
  templateSnapshot.value = serializeTemplateSnapshot()
  templateError.value = ''
  templateNotice.value = ''
}

async function loadTemplate(templateId) {
  if (!templateId) {
    hydrateBuilderTemplate(null)
    assessmentVersions.value = []
    selectedVersionId.value = ''
    return
  }

  isTemplateLoading.value = true
  templateError.value = ''

  try {
    const template = await fetchAssessmentForm(templateId)
    hydrateBuilderTemplate(template)
    await loadVersionHistory(templateId)
  } catch (error) {
    templateError.value = error?.message || 'Unable to load the form template.'
  } finally {
    isTemplateLoading.value = false
  }
}

async function loadQuestionTypes() {
  try {
    const types = await fetchAssessmentQuestionTypes()
    questionTypeLookup.value = createQuestionTypeMap(types)
  } catch {
    questionTypeLookup.value = {}
  }
}

async function loadVersionHistory(templateId = currentTemplateId.value) {
  if (!templateId) {
    assessmentVersions.value = []
    selectedVersionId.value = ''
    return
  }

  isVersionHistoryLoading.value = true
  versionHistoryError.value = ''

  try {
    const versions = await fetchAssessmentFormVersions(templateId)
    assessmentVersions.value = versions
    selectedVersionId.value = versions.find(version => version.isCurrent)?.id || versions[0]?.id || ''
  } catch (error) {
    versionHistoryError.value = error?.message || 'Unable to load version history.'
    assessmentVersions.value = []
    selectedVersionId.value = ''
  } finally {
    isVersionHistoryLoading.value = false
  }
}

function hydrateBuilderTemplateFromVersionSnapshot(snapshot) {
  const normalized = normalizeVersionSnapshot(snapshot)

  if (!normalized) {
    return
  }

  const sections = normalized.sections.length > 0
    ? normalized.sections.map((section, index) => normalizeSectionForBuilder(section, index, questionTypeLookup.value))
    : PRESCHOOL_ASSESSMENT_FORM_BUILDER_DEFAULT_SECTIONS.map((section, index) => ({
        ...section,
        id: null,
        key: section.key,
        code: section.code || section.key,
        order: index + 1,
        questionCount: 0,
        questions: [],
      }))

  templateStatus.value = normalized.status || 'draft'
  templateVersion.value = selectedVersion.value?.versionNumber || templateVersion.value || 1
  templateName.value = normalized.title || templateName.value
  templateDescription.value = normalized.description || templateDescription.value
  versionNote.value = normalizeNoteValue(selectedVersion.value?.versionNotes || selectedVersion.value?.publishNotes)
  reviewNote.value = normalizeNoteValue(selectedVersion.value?.reviewNotes)
  builderSections.value = sections.map((section, index) => ({
    ...section,
    order: section.order || index + 1,
  }))
  builderSectionQuestionMap.value = Object.fromEntries(
    builderSections.value.map((section) => [
      section.key,
      section.questions || [],
    ]),
  )
  selectedSectionKey.value = builderSections.value[0]?.key || selectedSectionKey.value
  selectedQuestionId.value = builderSectionQuestionMap.value[selectedSectionKey.value]?.[0]?.id || ''
  selectedQuestionKey.value = builderSectionQuestionMap.value[selectedSectionKey.value]?.[0]?.key || selectedQuestionKey.value
  templateSnapshot.value = serializeTemplateSnapshot()
}

function requireVersionChangeConfirmation() {
  if (!hasUnsavedChanges.value) {
    return true
  }

  return window.confirm(
    safeText(
      'assessmentFormBuilder.versionHistory.unsavedChangesPrompt',
      'You have unsaved changes. Continue and leave the current draft?',
    ),
  )
}

function collectValidationMessages(payload) {
  const errors = payload?.errors

  if (!errors) return []

  if (Array.isArray(errors)) {
    return errors.map(item => String(item ?? '').trim()).filter(Boolean)
  }

  if (typeof errors !== 'object') {
    return []
  }

  return Object.values(errors)
    .flatMap(value => (Array.isArray(value) ? value : [value]))
    .map(message => String(message ?? '').trim())
    .filter(Boolean)
}

function isTemporaryIdValidationError(error) {
  const payload = error?.response?.data || error?.details || {}
  const message = String(payload?.message || error?.message || '').toLowerCase()
  const validationText = collectValidationMessages(payload).join(' ').toLowerCase()
  const combined = `${message} ${validationText}`

  return /temporary ids?/.test(combined) || /temp(?:orary)?[-_\s]?id/.test(combined) || /client[-_\s]?generated/.test(combined)
}

function resolveTemplateErrorMessage(error, fallbackMessage) {
  const payload = error?.response?.data || error?.details || {}
  const backendMessage = String(payload?.message || payload?.error || '').trim()
  const validationMessages = collectValidationMessages(payload)

  if (backendMessage && !/^(the submitted data has validation errors\.?|validation failed\.?)$/i.test(backendMessage)) {
    return backendMessage
  }

  if (validationMessages.length > 0) {
    return validationMessages[0]
  }

  if (backendMessage) {
    return backendMessage
  }

  if (error?.message) {
    return String(error.message)
  }

  return fallbackMessage
}

function reportTemplateActionError(detail) {
  templateError.value = detail
  toast.add({
    severity: 'error',
    summary: safeText('common.error', 'Error'),
    detail,
    life: 5000,
  })
  return false
}

function selectVersion(version) {
  if (String(version?.id) === String(selectedVersionId.value)) {
    return
  }

  selectedVersionId.value = String(version?.id || '')
}

async function duplicateVersionAsDraft(version) {
  if (!version?.snapshot) {
    templateError.value = safeText(
      'assessmentFormBuilder.versionHistory.missingSnapshot',
      'This version cannot be duplicated because the snapshot is unavailable.',
    )
    return
  }

  if (!requireVersionChangeConfirmation()) {
    return
  }

  isTemplateSaving.value = true
  templateError.value = ''

  try {
    const payload = buildCurrentTemplatePayloadFromSnapshot(version.snapshot)
    payload.publishNotes = version.publishNotes || version.changeSummary || ''
    payload.versionNotes = normalizeNoteValue(duplicateNote.value || version.versionNotes || version.publishNotes)
    payload.reviewNotes = normalizeNoteValue(reviewNote.value || version.reviewNotes)
    const template = await createAssessmentForm(payload)
    hydrateBuilderTemplate(template)
    await loadVersionHistory(currentTemplateId.value)
    await router.replace({
      query: {
        ...route.query,
        templateId: currentTemplateId.value,
      },
    })
    templateNotice.value = safeText(
      'assessmentFormBuilder.versionHistory.versionDuplicated',
      'Version duplicated as a draft.',
    )
  } catch (error) {
    templateError.value = error?.message || 'Unable to duplicate the selected version.'
  } finally {
    isTemplateSaving.value = false
  }
}

async function restoreVersion(version) {
  if (!version?.snapshot) {
    templateError.value = safeText(
      'assessmentFormBuilder.versionHistory.missingSnapshot',
      'This version cannot be restored because the snapshot is unavailable.',
    )
    return
  }

  if (!requireVersionChangeConfirmation()) {
    return
  }

  selectedVersionId.value = String(version.id || selectedVersionId.value)
  restoreNote.value = normalizeNoteValue(restoreNote.value || version.versionNotes || version.publishNotes)
  hydrateBuilderTemplateFromVersionSnapshot(version.snapshot)
  versionNote.value = normalizeNoteValue(restoreNote.value || version.versionNotes || version.publishNotes)
  templateNotice.value = safeText(
    'assessmentFormBuilder.versionHistory.versionLoaded',
    'Version loaded into the current draft.',
  )
}

async function saveDraft() {
  isTemplateSaving.value = true
  templateError.value = ''
  templateNotice.value = ''

  try {
    const payload = serializeTemplatePayload()
    const template = currentTemplateId.value
      ? await updateAssessmentForm(currentTemplateId.value, payload)
      : await createAssessmentForm(payload)

    hydrateBuilderTemplate(template)
    await loadVersionHistory(currentTemplateId.value)
    await router.replace({
      query: {
        ...route.query,
        templateId: currentTemplateId.value,
      },
    })
    templateNotice.value = safeText('assessmentFormBuilder.messages.saved', 'Draft saved.')
    return true
  } catch (error) {
    const fallback = safeText('assessmentFormBuilder.messages.saveFailed', 'Unable to save the draft.')
    const detail = error?.response?.status === 422 && isTemporaryIdValidationError(error)
      ? safeText(
          'assessmentFormBuilder.messages.saveValidationFailed',
          'The draft could not be saved because it contains temporary IDs.',
        )
      : resolveTemplateErrorMessage(error, fallback)

    reportTemplateActionError(detail)
    return false
  } finally {
    isTemplateSaving.value = false
  }
}

async function duplicateTemplate() {
  if (!currentTemplateId.value) {
    const saved = await saveDraft()
    if (!saved) {
      return
    }
  }

  isTemplateSaving.value = true
  templateError.value = ''

  try {
    const template = await duplicateAssessmentForm(currentTemplateId.value, {
      duplicateNotes: duplicateNote.value,
      versionNotes: versionNote.value,
      reviewNotes: reviewNote.value,
    })
    hydrateBuilderTemplate(template)
    await loadVersionHistory(currentTemplateId.value)
    await router.replace({
      query: {
        ...route.query,
        templateId: currentTemplateId.value,
      },
    })
    templateNotice.value = safeText('assessmentFormBuilder.messages.duplicated', 'Template duplicated.')
  } catch (error) {
    return reportTemplateActionError(resolveTemplateErrorMessage(error, safeText('assessmentFormBuilder.messages.duplicateFailed', 'Unable to duplicate the template.')))
  } finally {
    isTemplateSaving.value = false
  }
}

async function publishTemplate() {
  if (hasUnsavedChanges.value) {
    const saved = await saveDraft()
    if (!saved) {
      return
    }
  }

  isTemplateSaving.value = true
  templateError.value = ''

  try {
    const template = await publishAssessmentForm(currentTemplateId.value, {
      publishNotes: publishNote.value,
      versionNotes: versionNote.value || publishNote.value,
      reviewNotes: reviewNote.value,
      changeSummary: publishNote.value || 'Publish from Preschool form builder',
    })
    hydrateBuilderTemplate(template)
    await loadVersionHistory(currentTemplateId.value)
    templateNotice.value = safeText('assessmentFormBuilder.messages.published', 'Template published.')
  } catch (error) {
    return reportTemplateActionError(resolveTemplateErrorMessage(error, safeText('assessmentFormBuilder.messages.publishFailed', 'Unable to publish the template.')))
  } finally {
    isTemplateSaving.value = false
  }
}

async function archiveTemplate() {
  if (!currentTemplateId.value) return

  isTemplateSaving.value = true
  templateError.value = ''

  try {
    const template = await archiveAssessmentForm(currentTemplateId.value)
    hydrateBuilderTemplate(template)
    await loadVersionHistory(currentTemplateId.value)
    templateNotice.value = safeText('assessmentFormBuilder.messages.archived', 'Template archived.')
  } catch (error) {
    return reportTemplateActionError(resolveTemplateErrorMessage(error, safeText('assessmentFormBuilder.messages.archiveFailed', 'Unable to archive the template.')))
  } finally {
    isTemplateSaving.value = false
  }
}

async function restoreTemplate() {
  if (!currentTemplateId.value) return

  isTemplateSaving.value = true
  templateError.value = ''

  try {
    const template = await restoreAssessmentForm(currentTemplateId.value, {
      restoreNotes: restoreNote.value,
      versionNotes: versionNote.value || restoreNote.value,
      reviewNotes: reviewNote.value,
    })
    hydrateBuilderTemplate(template)
    await loadVersionHistory(currentTemplateId.value)
    templateNotice.value = safeText('assessmentFormBuilder.messages.restored', 'Template restored.')
  } catch (error) {
    return reportTemplateActionError(resolveTemplateErrorMessage(error, safeText('assessmentFormBuilder.messages.restoreFailed', 'Unable to restore the template.')))
  } finally {
    isTemplateSaving.value = false
  }
}

onMounted(() => {
  loadQuestionTypes()
  loadTemplate(currentTemplateId.value)
})
</script>

<template>
  <MainLayout>
    <section class="assessment-form-builder-page">
      <AssessmentPageHeader
        :title="safeText('assessmentFormBuilder.title', 'Form Builder')"
        :subtitle="safeText('assessmentFormBuilder.subtitle', 'Design assessment forms, scoring rubrics, and reusable question layouts.')"
      />

      <section class="assessment-form-builder-hero">
        <div class="assessment-form-builder-hero__copy">
          <span class="assessment-form-builder-hero__eyebrow">
            {{ safeText('assessmentFormBuilder.summary.eyebrow', 'Form Summary') }}
          </span>
          <h2>{{ safeText('assessmentFormBuilder.summary.title', 'Builder Summary') }}</h2>
          <p>{{ safeText('assessmentFormBuilder.summary.subtitle', 'Live template status and progress at a glance.') }}</p>
        </div>
        <div class="assessment-form-builder-hero__metrics">
          <div
            v-for="stat in workspaceStats"
            :key="stat.label"
            class="assessment-form-builder-hero__metric"
          >
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </section>

      <section class="assessment-form-builder-toolbar assessment-form-builder-panel">
        <div class="assessment-form-builder-toolbar__meta">
          <div class="assessment-form-builder-toolbar__status">
            <span class="assessment-form-builder-toolbar__status-badge" :data-tone="templateStatusTone">
              {{ templateStatusLabel }}
            </span>
            <span v-if="hasUnsavedChanges" class="assessment-form-builder-toolbar__status-changed">
              {{ safeText('assessmentFormBuilder.messages.unsavedChanges', 'Unsaved changes') }}
            </span>
            <span v-else class="assessment-form-builder-toolbar__status-changed assessment-form-builder-toolbar__status-changed--muted">
              {{ safeText('assessmentFormBuilder.messages.savedState', 'Draft saved') }}
            </span>
          </div>
          <p class="assessment-form-builder-toolbar__hint">
            {{ safeText('assessmentFormBuilder.messages.toolbarHint', 'Manage the draft, version history, and publishing workflow from this panel.') }}
          </p>
        </div>

        <div class="assessment-form-builder-toolbar__actions">
          <Button
            :label="safeText('assessmentFormBuilder.actions.saveDraft', 'Save Draft')"
            icon="pi pi-save"
            severity="secondary"
            :loading="isTemplateSaving"
            @click="saveDraft"
          />
          <Button
            :label="safeText('assessmentFormBuilder.actions.duplicate', 'Duplicate')"
            icon="pi pi-copy"
            severity="secondary"
            :loading="isTemplateSaving"
            :disabled="!currentTemplateId"
            @click="duplicateTemplate"
          />
          <Button
            :label="safeText('assessmentFormBuilder.actions.preview', 'Preview')"
            icon="pi pi-eye"
            severity="secondary"
          />
          <Button
            :label="safeText('assessmentFormBuilder.actions.publish', 'Publish')"
            icon="pi pi-send"
            :loading="isTemplateSaving"
            @click="publishTemplate"
          />
          <Button
            v-if="templateStatus === 'archived'"
            :label="safeText('assessmentFormBuilder.actions.restore', 'Restore')"
            icon="pi pi-refresh"
            severity="secondary"
            :loading="isTemplateSaving"
            @click="restoreTemplate"
          />
          <Button
            v-else
            :label="safeText('assessmentFormBuilder.actions.archive', 'Archive')"
            icon="pi pi-box"
            severity="secondary"
            :loading="isTemplateSaving"
            @click="archiveTemplate"
          />
        </div>
      </section>

      <section class="assessment-form-builder-notes">
        <div class="assessment-form-builder-panel assessment-form-builder-notes__card">
          <div class="assessment-form-builder-notes__header">
            <div>
              <h3>{{ safeText('assessmentFormBuilder.notes.publishTitle', 'Publish note') }}</h3>
              <p>{{ safeText('assessmentFormBuilder.notes.publishHint', 'Optional reason that will be saved with the published version.') }}</p>
            </div>
          </div>
          <textarea
            v-model="publishNote"
            rows="2"
            class="assessment-form-builder-notes__textarea"
            :placeholder="safeText('assessmentFormBuilder.notes.publishPlaceholder', 'Add a note before publishing...')"
          />
        </div>

        <div class="assessment-form-builder-panel assessment-form-builder-notes__card">
          <div class="assessment-form-builder-notes__header">
            <div>
              <h3>{{ safeText('assessmentFormBuilder.notes.versionTitle', 'Version note') }}</h3>
              <p>{{ safeText('assessmentFormBuilder.notes.versionHint', 'Stored with the template and version snapshot for traceability.') }}</p>
            </div>
          </div>
          <textarea
            v-model="versionNote"
            rows="2"
            class="assessment-form-builder-notes__textarea"
            :placeholder="safeText('assessmentFormBuilder.notes.versionPlaceholder', 'Add a version note...')"
          />
          <label class="assessment-form-builder-notes__inline-label">
            <span>{{ safeText('assessmentFormBuilder.notes.reviewTitle', 'Review note') }}</span>
            <textarea
              v-model="reviewNote"
              rows="2"
              class="assessment-form-builder-notes__textarea"
              :placeholder="safeText('assessmentFormBuilder.notes.reviewPlaceholder', 'Add a review note...')"
            />
          </label>
        </div>

        <div class="assessment-form-builder-panel assessment-form-builder-notes__card">
          <div class="assessment-form-builder-notes__header">
            <div>
              <h3>{{ safeText('assessmentFormBuilder.notes.duplicateTitle', 'Duplicate reason') }}</h3>
              <p>{{ safeText('assessmentFormBuilder.notes.duplicateHint', 'Optional note saved when creating a draft copy from a version.') }}</p>
            </div>
          </div>
          <textarea
            v-model="duplicateNote"
            rows="2"
            class="assessment-form-builder-notes__textarea"
            :placeholder="safeText('assessmentFormBuilder.notes.duplicatePlaceholder', 'Add a duplication note...')"
          />
          <label class="assessment-form-builder-notes__inline-label">
            <span>{{ safeText('assessmentFormBuilder.notes.restoreTitle', 'Restore reason') }}</span>
            <textarea
              v-model="restoreNote"
              rows="2"
              class="assessment-form-builder-notes__textarea"
              :placeholder="safeText('assessmentFormBuilder.notes.restorePlaceholder', 'Add a restore note...')"
            />
          </label>
        </div>
      </section>

      <div class="assessment-form-builder-grid">
        <aside class="assessment-form-builder-panel assessment-form-builder-panel--sidebar">
          <div class="assessment-form-builder-panel__section-header">
            <HeaderSection
              :title="safeText('assessmentFormBuilder.sidebar.title', 'Build Workspace')"
              :subtitle="safeText('assessmentFormBuilder.sidebar.subtitle', 'Start with sections, question libraries, and logic rules.')"
            />
          </div>
          <div class="assessment-form-builder-panel__section-body">
            <FormBuilderQuestionPalette
              :sections="builderPaletteSections"
              :palette="paletteGroups"
              :selected-question-key="selectedQuestionKey"
              @select-question="handleQuestionSelect"
              @drag-question-start="handlePaletteDragStart"
              @drag-question-end="handleDragEnd"
            />
          </div>
        </aside>

        <main class="assessment-form-builder-panel assessment-form-builder-panel--canvas">
          <div class="assessment-form-builder-panel__section-header">
            <div>
              <h3 class="assessment-form-builder-panel__title">
                {{ safeText('assessmentFormBuilder.canvas.title', 'Sections and Questions') }}
              </h3>
              <p class="assessment-form-builder-panel__subtitle">
                {{ safeText('assessmentFormBuilder.canvas.subtitle', 'Organize the draft by dragging sections, adding questions, and reviewing structure.') }}
              </p>
            </div>
          </div>
          <div class="assessment-form-builder-panel__section-body">
            <div v-if="isTemplateLoading" class="assessment-form-builder-state">
              <i class="pi pi-spin pi-spinner" />
              <span>{{ safeText('assessmentFormBuilder.messages.loading', 'Loading template...') }}</span>
            </div>
            <div v-else-if="templateError" class="assessment-form-builder-state assessment-form-builder-state--error">
              <i class="pi pi-exclamation-triangle" />
              <span>{{ templateError }}</span>
            </div>
            <div v-else-if="templateNotice" class="assessment-form-builder-state assessment-form-builder-state--success">
              <i class="pi pi-check-circle" />
              <span>{{ templateNotice }}</span>
            </div>
            <FormBuilderCanvas
              :sections="builderCanvasSections"
              :section-questions="builderSectionQuestionMap"
              :selected-section-key="selectedSectionKey"
              @select-section="handleSectionSelect"
              @select-question="handleQuestionSelect"
              @add-question="handleAddQuestion"
              @add-section="handleSectionSelect(builderCanvasSections[builderCanvasSections.length - 1])"
              @drag-section-start="handleSectionDragStart"
              @drag-question-start="handleQuestionDragStart"
              @drag-end="handleDragEnd"
              @drop-section="handleSectionDrop"
              @drop-question="handleQuestionDrop"
            />
          </div>
        </main>

        <aside class="assessment-form-builder-panel assessment-form-builder-panel--settings">
          <div class="assessment-form-builder-panel__section-header">
            <div>
              <h3 class="assessment-form-builder-panel__title">
                {{ safeText('assessmentFormBuilder.settings.title', 'Question Settings') }}
              </h3>
              <p class="assessment-form-builder-panel__subtitle">
                {{ safeText('assessmentFormBuilder.settings.subtitle', 'Adjust the selected question, then compare versions below.') }}
              </p>
            </div>
          </div>
          <div class="assessment-form-builder-panel__section-body assessment-form-builder-panel__section-body--stacked">
            <FormBuilderQuestionSettings
              :question="selectedQuestion"
              :section="selectedSection"
              :state="questionState"
              :section-options="builderCanvasSections"
              @update:state="handleQuestionStateUpdate"
              @reset="resetQuestionState"
              @apply="handleSettingsApply"
            />
            <div v-if="versionHistoryError" class="assessment-form-builder-state assessment-form-builder-state--error">
              <i class="pi pi-exclamation-triangle" />
              <span>{{ versionHistoryError }}</span>
            </div>
            <div class="assessment-form-builder-version-card">
              <div class="assessment-form-builder-version-card__header">
                <h3>{{ safeText('assessmentFormBuilder.versionHistory.title', 'Version History') }}</h3>
                <p>{{ safeText('assessmentFormBuilder.versionHistory.subtitle', 'Review past snapshots, duplicate a version, or restore a draft.') }}</p>
              </div>
              <AssessmentFormVersionReview
                :versions="assessmentVersions"
                :selected-version-id="selectedVersionId"
                :comparison="versionComparison"
                :current-template-status="templateStatus"
                :has-unsaved-changes="hasUnsavedChanges"
                :loading="isVersionHistoryLoading"
                @select-version="selectVersion"
                @duplicate-version="duplicateVersionAsDraft"
                @restore-version="restoreVersion"
              />
            </div>
          </div>
        </aside>
      </div>
    </section>
  </MainLayout>
</template>

<style scoped>
.assessment-form-builder-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.assessment-form-builder-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
  gap: 1rem;
  padding: 1.25rem 1.4rem;
  border-radius: 1.5rem;
  border: 1px solid #dbeafe;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 28%),
    linear-gradient(135deg, #f8fbff 0%, #ffffff 55%, #eef6ff 100%);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
}

.assessment-form-builder-hero__copy {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.assessment-form-builder-hero__eyebrow {
  display: inline-flex;
  align-self: flex-start;
  padding: 0.33rem 0.7rem;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.assessment-form-builder-hero__copy h2 {
  margin: 0;
  font-size: 1.55rem;
  line-height: 1.2;
  color: #0f172a;
}

.assessment-form-builder-hero__copy p {
  margin: 0;
  max-width: 62ch;
  color: #475569;
  line-height: 1.55;
}

.assessment-form-builder-hero__metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.assessment-form-builder-hero__metric {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.2rem;
  padding: 1rem 1.05rem;
  border-radius: 1rem;
  border: 1px solid rgba(191, 219, 254, 0.85);
  background: rgba(255, 255, 255, 0.84);
}

.assessment-form-builder-hero__metric strong {
  color: #0f172a;
  font-size: 1.25rem;
  line-height: 1;
}

.assessment-form-builder-hero__metric span {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
}

.assessment-form-builder-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.15rem;
  border-radius: 1.35rem;
  position: sticky;
  top: 0.75rem;
  z-index: 20;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.assessment-form-builder-toolbar__meta {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.assessment-form-builder-toolbar__status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.assessment-form-builder-toolbar__status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #334155;
  background: #e2e8f0;
}

.assessment-form-builder-toolbar__status-badge[data-tone='success'] {
  color: #166534;
  background: #dcfce7;
}

.assessment-form-builder-toolbar__status-badge[data-tone='warning'] {
  color: #92400e;
  background: #fef3c7;
}

.assessment-form-builder-toolbar__status-changed {
  font-size: 0.78rem;
  font-weight: 700;
  color: #2563eb;
}

.assessment-form-builder-toolbar__status-changed--muted {
  color: #64748b;
}

.assessment-form-builder-toolbar__hint {
  margin: 0;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.55;
}

.assessment-form-builder-toolbar__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.65rem;
}

.assessment-form-builder-notes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.assessment-form-builder-notes__card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  border-radius: 1.25rem;
  padding: 1rem 1.05rem;
}

.assessment-form-builder-notes__header {
  display: grid;
  gap: 0.35rem;
}

.assessment-form-builder-notes__header h3,
.assessment-form-builder-version-card__header h3,
.assessment-form-builder-panel__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
}

.assessment-form-builder-notes__header p,
.assessment-form-builder-version-card__header p,
.assessment-form-builder-panel__subtitle {
  margin: 0;
  color: #64748b;
  font-size: 0.86rem;
  line-height: 1.5;
}

.assessment-form-builder-notes__inline-label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
}

.assessment-form-builder-notes__textarea {
  width: 100%;
  min-height: 3.25rem;
  border-radius: 0.85rem;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #0f172a;
  padding: 0.75rem 0.9rem;
  font: inherit;
  resize: vertical;
}

.assessment-form-builder-notes__textarea:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.18);
}

.assessment-form-builder-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.82fr) minmax(0, 1.45fr) minmax(300px, 0.92fr);
  gap: 1rem;
  align-items: start;
}

.assessment-form-builder-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
  border-radius: 1.4rem;
  border: 1px solid #dbeafe;
  background: #ffffff;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.05);
}

.assessment-form-builder-panel__section-header {
  padding: 1rem 1.1rem 0.8rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.92), rgba(255, 255, 255, 0));
}

.assessment-form-builder-panel__section-body {
  padding: 1rem 1.1rem 1.1rem;
}

.assessment-form-builder-panel__section-body--stacked {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assessment-form-builder-version-card {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1rem;
  border-radius: 1rem;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.assessment-form-builder-version-card__header {
  display: grid;
  gap: 0.3rem;
}

.assessment-form-builder-state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid #dbeafe;
  background: #eff6ff;
  color: #1d4ed8;
}

.assessment-form-builder-state--error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.assessment-form-builder-state--success {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}

@media (max-width: 1200px) {
  .assessment-form-builder-hero {
    grid-template-columns: 1fr;
  }

  .assessment-form-builder-hero__metrics {
    grid-template-columns: 1fr;
  }

  .assessment-form-builder-notes {
    grid-template-columns: 1fr;
  }

  .assessment-form-builder-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .assessment-form-builder-toolbar {
    flex-direction: column;
    top: 0.5rem;
  }

  .assessment-form-builder-toolbar__actions {
    justify-content: flex-start;
  }

  .assessment-form-builder-toolbar__actions :deep(.p-button) {
    flex: 1 1 100%;
  }

  .assessment-form-builder-toolbar__actions :deep(.p-button .p-button-label) {
    white-space: normal;
  }
}
</style>
