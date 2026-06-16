// Canonical Preschool assessment API.
//
// This module owns the real HTTP contract for Preschool assessments and
// progress summaries. Legacy student-assessment imports stay available through
// a compatibility wrapper so older call sites can migrate without changing the
// visible workflow.
import http from '@/services/http'
import { buildQueryParams, unwrapApiData, unwrapApiItems, unwrapApiPagination } from '@/services/api'
import { normalizePerPage } from '@/modules/sport/services/api/sportApiUtils'
import {
  normalizeAssessment,
  normalizeAssessmentCategory,
  normalizeProgressSummary,
} from './preschoolAssessmentMappers'

const FORM_QUESTION_TYPE_MAP = {
  shortText: 'short_text',
  longText: 'long_text',
  dropdown: 'dropdown',
  rating: 'rating_scale',
  table: 'dynamic_table',
  signature: 'signature',
}

function normalizeFormOption(option = {}) {
  return {
    id: option.id ?? '',
    label: String(option.label ?? option.option_text ?? '').trim(),
    labelKh: String(option.label_kh ?? '').trim(),
    value: String(option.value ?? '').trim(),
    scoreValue: option.score_value ?? option.scoreValue ?? 0,
    riskTag: String(option.risk_tag ?? option.riskTag ?? '').trim(),
    colorCode: String(option.color_code ?? option.colorCode ?? '').trim(),
    sortOrder: Number(option.sort_order ?? option.sortOrder ?? 0),
    isOther: Boolean(option.is_other ?? option.isOther ?? false),
    settings: option.settings ?? {},
    raw: option,
  }
}

function normalizeFormQuestion(question = {}) {
  return {
    id: question.id ?? '',
    uuid: question.uuid ?? '',
    templateId: question.template_id ?? question.templateId ?? '',
    sectionId: question.section_id ?? question.sectionId ?? '',
    questionTypeId: question.question_type_id ?? question.questionTypeId ?? '',
    questionTypeKey: String(question.question_type_key ?? question.questionTypeKey ?? '').trim(),
    parentQuestionId: question.parent_question_id ?? question.parentQuestionId ?? '',
    code: String(question.code ?? '').trim(),
    label: String(question.label ?? question.question_text ?? '').trim(),
    labelKh: String(question.label_kh ?? '').trim(),
    helpText: String(question.help_text ?? '').trim(),
    helpTextKh: String(question.help_text_kh ?? '').trim(),
    placeholder: String(question.placeholder ?? '').trim(),
    placeholderKh: String(question.placeholder_kh ?? '').trim(),
    sortOrder: Number(question.sort_order ?? question.sortOrder ?? 0),
    isRequired: Boolean(question.is_required ?? question.isRequired ?? false),
    isScored: Boolean(question.is_scored ?? question.isScored ?? false),
    maxScore: question.max_score ?? question.maxScore ?? null,
    scoringWeight: question.scoring_weight ?? question.scoringWeight ?? 1,
    printVisible: Boolean(question.print_visible ?? question.printVisible ?? true),
    validationRules: question.validation_rules ?? question.validationRules ?? {},
    conditionalLogic: question.conditional_logic ?? question.conditionalLogic ?? {},
    calculationFormula: String(question.calculation_formula ?? question.calculationFormula ?? '').trim(),
    settings: question.settings ?? question.config ?? {},
    options: Array.isArray(question.options) ? question.options.map(normalizeFormOption) : [],
    matrixRows: Array.isArray(question.matrix_rows)
      ? question.matrix_rows.map(row => ({
          id: row.id ?? '',
          label: String(row.label ?? '').trim(),
          labelKh: String(row.label_kh ?? '').trim(),
          sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
          raw: row,
        }))
      : [],
    raw: question,
  }
}

function normalizeFormSection(section = {}) {
  return {
    id: section.id ?? '',
    templateId: section.template_id ?? section.templateId ?? '',
    parentId: section.parent_id ?? section.parentId ?? '',
    code: String(section.code ?? '').trim(),
    title: String(section.title ?? '').trim(),
    titleKh: String(section.title_kh ?? '').trim(),
    description: String(section.description ?? '').trim(),
    descriptionKh: String(section.description_kh ?? '').trim(),
    sortOrder: Number(section.sort_order ?? section.sortOrder ?? 0),
    isRepeatable: Boolean(section.is_repeatable ?? section.isRepeatable ?? false),
    maxRepeats: section.max_repeats ?? section.maxRepeats ?? null,
    printVisible: Boolean(section.print_visible ?? section.printVisible ?? true),
    scoringWeight: section.scoring_weight ?? section.scoringWeight ?? 1,
    settings: section.settings ?? {},
    questions: Array.isArray(section.questions) ? section.questions.map(normalizeFormQuestion) : [],
    raw: section,
  }
}

function normalizeFormVersion(version = {}) {
  const normalizeUser = (value) => {
    if (value && typeof value === 'object') {
      return {
        id: value.id ?? '',
        name: String(value.name ?? '').trim(),
      }
    }

    return value ? { id: value, name: '' } : null
  }

  return {
    id: version.id ?? '',
    templateId: version.template_id ?? version.templateId ?? '',
    versionNumber: Number(version.version_number ?? version.versionNumber ?? 0),
    label: String(version.label ?? '').trim(),
    changeSummary: String(version.change_summary ?? version.changeSummary ?? '').trim(),
    publishNotes: String(version.publish_notes ?? version.publishNotes ?? version.change_summary ?? '').trim(),
    versionNotes: String(version.version_notes ?? version.versionNotes ?? '').trim(),
    reviewNotes: String(version.review_notes ?? version.reviewNotes ?? '').trim(),
    status: String(version.status ?? '').trim(),
    createdBy: normalizeUser(version.created_by ?? version.createdBy ?? null),
    updatedBy: normalizeUser(version.updated_by ?? version.updatedBy ?? null),
    publishedBy: normalizeUser(version.published_by ?? version.publishedBy ?? null),
    publishedAt: version.published_at || version.publishedAt || '',
    archivedBy: normalizeUser(version.archived_by ?? version.archivedBy ?? null),
    archivedAt: version.archived_at || version.archivedAt || '',
    reviewedBy: normalizeUser(version.reviewed_by ?? version.reviewedBy ?? null),
    reviewedAt: version.reviewed_at || version.reviewedAt || '',
    duplicatedFromTemplateId: version.duplicated_from_template_id ?? version.duplicatedFromTemplateId ?? null,
    duplicatedFromVersion: version.duplicated_from_version ?? version.duplicatedFromVersion ?? null,
    restoredFromTemplateId: version.restored_from_template_id ?? version.restoredFromTemplateId ?? null,
    restoredFromVersion: version.restored_from_version ?? version.restoredFromVersion ?? null,
    sectionsCount: Number(version.sections_count ?? version.sectionsCount ?? 0),
    questionsCount: Number(version.questions_count ?? version.questionsCount ?? 0),
    isCurrent: Boolean(version.is_current ?? version.isCurrent ?? false),
    createdAt: version.created_at || version.createdAt || '',
    updatedAt: version.updated_at || version.updatedAt || version.published_at || version.publishedAt || '',
    snapshot: version.snapshot ?? null,
    raw: version,
  }
}

function normalizeFormTemplate(row = {}) {
  const versions = Array.isArray(row.versions) ? row.versions.map(normalizeFormVersion) : []
  const sections = Array.isArray(row.sections) ? row.sections.map(normalizeFormSection) : []

  return {
    id: row.id ?? '',
    uuid: row.uuid ?? '',
    code: String(row.code ?? '').trim(),
    name: String(row.name ?? '').trim(),
    nameKh: String(row.name_kh ?? '').trim(),
    description: String(row.description ?? '').trim(),
    descriptionKh: String(row.description_kh ?? '').trim(),
    category: String(row.category ?? '').trim(),
    module: String(row.module ?? 'preschool').trim(),
    status: String(row.status ?? 'draft').trim(),
    isLocked: Boolean(row.is_locked ?? row.isLocked ?? false),
    isDraft: Boolean(row.is_draft ?? row.isDraft ?? row.status === 'draft'),
    isPublished: Boolean(row.is_published ?? row.isPublished ?? row.status === 'published'),
    isArchived: Boolean(row.is_archived ?? row.isArchived ?? row.status === 'archived'),
    currentVersion: Number(row.current_version ?? row.currentVersion ?? versions.find(version => version.isCurrent)?.versionNumber ?? 0),
    publishNotes: String(row.publish_notes ?? row.publishNotes ?? row.version_notes ?? '').trim(),
    versionNotes: String(row.version_notes ?? row.versionNotes ?? '').trim(),
    reviewNotes: String(row.review_notes ?? row.reviewNotes ?? '').trim(),
    reviewedBy: row.reviewed_by ?? row.reviewedBy ?? null,
    reviewedAt: row.reviewed_at || row.reviewedAt || '',
    duplicatedFromTemplateId: row.duplicated_from_template_id ?? row.duplicatedFromTemplateId ?? null,
    duplicatedFromVersion: row.duplicated_from_version ?? row.duplicatedFromVersion ?? null,
    restoredFromTemplateId: row.restored_from_template_id ?? row.restoredFromTemplateId ?? null,
    restoredFromVersion: row.restored_from_version ?? row.restoredFromVersion ?? null,
    publishedAt: row.published_at || row.publishedAt || '',
    publishedBy: row.published_by ?? row.publishedBy ?? null,
    archivedAt: row.archived_at || row.archivedAt || '',
    archivedBy: row.archived_by ?? row.archivedBy ?? null,
    settings: row.settings ?? {},
    sections,
    versions,
    raw: row,
  }
}

function normalizeFormTemplateListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeFormTemplate),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function buildFormQuestionOptionsPayload(options = '') {
  return String(options || '')
    .split(',')
    .map(option => option.trim())
    .filter(Boolean)
    .map((label, index) => ({
      label,
      value: label.toLowerCase().replace(/\s+/g, '_'),
      sort_order: index + 1,
      score_value: index + 1,
    }))
}

function buildFormTemplatePayload(template = {}, sections = []) {
  return {
    name: template.name,
    name_kh: template.nameKh ?? template.name_kh ?? null,
    description: template.description ?? null,
    description_kh: template.descriptionKh ?? template.description_kh ?? null,
    category: template.category ?? 'preschool_assessment',
    settings: template.settings ?? {},
    publish_notes: template.publishNotes ?? template.publish_notes ?? '',
    version_notes: template.versionNotes ?? template.version_notes ?? '',
    review_notes: template.reviewNotes ?? template.review_notes ?? '',
    duplicated_from_template_id: template.duplicatedFromTemplateId ?? template.duplicated_from_template_id ?? null,
    duplicated_from_version: template.duplicatedFromVersion ?? template.duplicated_from_version ?? null,
    restored_from_template_id: template.restoredFromTemplateId ?? template.restored_from_template_id ?? null,
    restored_from_version: template.restoredFromVersion ?? template.restored_from_version ?? null,
    sections: sections.map((section, sectionIndex) => ({
      id: section.id || undefined,
      code: section.code || undefined,
      title: section.title,
      title_kh: section.titleKh ?? section.title_kh ?? null,
      description: section.description ?? null,
      description_kh: section.descriptionKh ?? section.description_kh ?? null,
      sort_order: section.sortOrder ?? section.sort_order ?? sectionIndex + 1,
      is_repeatable: Boolean(section.isRepeatable ?? section.is_repeatable ?? false),
      max_repeats: section.maxRepeats ?? section.max_repeats ?? null,
      print_visible: Boolean(section.printVisible ?? section.print_visible ?? true),
      scoring_weight: section.scoringWeight ?? section.scoring_weight ?? 1,
      settings: section.settings ?? {},
      questions: (section.questions || []).map((question, questionIndex) => {
        const mappedType = FORM_QUESTION_TYPE_MAP[question.answerType] || question.questionTypeKey || 'short_text'

        return {
          id: question.id || undefined,
          uuid: question.uuid || undefined,
          code: question.code || undefined,
          question_type_key: mappedType,
          label: question.label || question.title || '',
          label_kh: question.labelKh ?? question.label_kh ?? null,
          help_text: question.helpText ?? question.help_text ?? '',
          help_text_kh: question.helpTextKh ?? question.help_text_kh ?? null,
          placeholder: question.placeholder ?? null,
          placeholder_kh: question.placeholderKh ?? question.placeholder_kh ?? null,
          sort_order: question.sortOrder ?? question.sort_order ?? questionIndex + 1,
          is_required: Boolean(question.required ?? question.isRequired ?? false),
          is_scored: Boolean(question.isScored ?? question.is_scored ?? Number(question.score ?? 0) > 0),
          max_score: question.maxScore ?? question.max_score ?? question.score ?? null,
          scoring_weight: question.scoringWeight ?? question.scoring_weight ?? 1,
          print_visible: Boolean(question.printVisible ?? question.print_visible ?? true),
          validation_rules: {
            mode: question.validationMode ?? 'basic',
            required: Boolean(question.required ?? question.isRequired ?? false),
          },
          conditional_logic: question.conditionalLogic ?? question.conditional_logic ?? {},
          calculation_formula: question.calculationFormula ?? question.calculation_formula ?? null,
          settings: {
            answerType: question.answerType || mappedType,
            validationMode: question.validationMode || 'basic',
            score: question.score ?? question.maxScore ?? null,
            options: question.options || '',
          },
          options: buildFormQuestionOptionsPayload(question.options),
        }
      }),
    })),
  }
}

export {
  normalizeAssessment,
  normalizeAssessmentCategory,
  normalizeProgressSummary,
  normalizeFormTemplate,
  normalizeFormSection,
  normalizeFormQuestion,
  normalizeFormOption,
  normalizeFormVersion,
  buildFormTemplatePayload,
}

function normalizeAssessmentListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeAssessment),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

function normalizeCategoryListResponse(response) {
  const items = unwrapApiItems(response)

  return items.map(normalizeAssessmentCategory)
}

export async function fetchAssessmentCategories(options = {}) {
  const response = await http.get('/preschool/assessment-categories', {
    signal: options.signal,
  })

  return normalizeCategoryListResponse(response)
}

export async function fetchStudentAssessments(studentId, params = {}, options = {}) {
  // Clamp page size here so Preschool list views never exceed the backend
  // limit and start returning validation errors on larger teacher/admin queries.
  const perPage = normalizePerPage(params.perPage ?? params.per_page, 10, 100)

  const response = await http.get(`/preschool/students/${encodeURIComponent(studentId)}/assessments`, {
    params: buildQueryParams({
      page: params.page ?? 1,
      per_page: perPage,
      status: params.status || '',
      category_id: params.categoryId || '',
      period_label: params.periodLabel || '',
      search: params.search || '',
      sort_by: params.sortBy || 'assessment_date',
      sort_direction: params.sortDirection || 'desc',
      class_id: params.classId || '',
    }),
    signal: options.signal,
  })

  return normalizeAssessmentListResponse(response, params.page ?? 1, perPage)
}

export async function createStudentAssessment(studentId, payload = {}) {
  const response = await http.post(`/preschool/students/${encodeURIComponent(studentId)}/assessments`, payload)
  const data = unwrapApiData(response) || {}

  return normalizeAssessment(data.assessment || data)
}

export async function fetchAssessment(assessmentId, options = {}) {
  const response = await http.get(`/preschool/assessments/${encodeURIComponent(assessmentId)}`, {
    signal: options.signal,
  })
  const data = unwrapApiData(response) || {}

  return normalizeAssessment(data.assessment || data)
}

export async function updateStudentAssessment(assessmentId, payload = {}) {
  const response = await http.put(`/preschool/assessments/${encodeURIComponent(assessmentId)}`, payload)
  const data = unwrapApiData(response) || {}

  return normalizeAssessment(data.assessment || data)
}

export async function finalizeStudentAssessment(assessmentId) {
  const response = await http.post(`/preschool/assessments/${encodeURIComponent(assessmentId)}/finalize`)
  const data = unwrapApiData(response) || {}

  return normalizeAssessment(data.assessment || data)
}

export async function archiveStudentAssessment(assessmentId) {
  const response = await http.post(`/preschool/assessments/${encodeURIComponent(assessmentId)}/archive`)
  const data = unwrapApiData(response) || {}

  return normalizeAssessment(data.assessment || data)
}

export function prepareAssessmentData(data) {
  return {
    class_id: data.classId,
    category_id: data.categoryId,
    period_label: data.periodLabel,
    assessment_date: data.assessmentDate,
    score: data.score,
    rating: data.rating,
    observation: data.observation,
    teacher_comment: data.teacherComment,
  }
}

export async function fetchProgressSummary(studentId, options = {}) {
  const response = await http.get(`/preschool/students/${encodeURIComponent(studentId)}/progress-summary`, {
    signal: options.signal,
  })

  return normalizeProgressSummary(unwrapApiData(response) || {})
}

export async function fetchAssessmentForms(params = {}, options = {}) {
  const response = await http.get('/assessment/forms', {
    params: buildQueryParams({
      page: params.page ?? 1,
      per_page: normalizePerPage(params.perPage ?? params.per_page, 10, 100),
      search: params.search || '',
      module: params.module || 'preschool',
      status: params.status || '',
      sort_by: params.sortBy || 'created_at',
      sort_direction: params.sortDirection || 'desc',
    }),
    signal: options.signal,
  })

  const perPage = normalizePerPage(params.perPage ?? params.per_page, 10, 100)

  return normalizeFormTemplateListResponse(response, params.page ?? 1, perPage)
}

export async function fetchAssessmentForm(formId, options = {}) {
  const response = await http.get(`/assessment/forms/${encodeURIComponent(formId)}`, {
    signal: options.signal,
  })

  return normalizeFormTemplate(unwrapApiData(response) || {})
}

export async function createAssessmentForm(payload = {}) {
  const response = await http.post('/assessment/forms', payload)
  return normalizeFormTemplate(unwrapApiData(response) || {})
}

export async function updateAssessmentForm(formId, payload = {}) {
  const response = await http.put(`/assessment/forms/${encodeURIComponent(formId)}`, payload)

  return normalizeFormTemplate(unwrapApiData(response) || {})
}

export async function duplicateAssessmentForm(formId, payload = {}) {
  const response = await http.post(`/assessment/forms/${encodeURIComponent(formId)}/duplicate`, {
    duplicate_notes: payload.duplicateNotes || payload.duplicate_notes || '',
    version_notes: payload.versionNotes || payload.version_notes || '',
    review_notes: payload.reviewNotes || payload.review_notes || '',
  })
  return normalizeFormTemplate(unwrapApiData(response) || {})
}

export async function publishAssessmentForm(formId, payload = {}) {
  const response = await http.post(`/assessment/forms/${encodeURIComponent(formId)}/publish`, {
    change_summary: payload.changeSummary || payload.change_summary || '',
    publish_notes: payload.publishNotes || payload.publish_notes || '',
    version_notes: payload.versionNotes || payload.version_notes || '',
    review_notes: payload.reviewNotes || payload.review_notes || '',
  })

  return normalizeFormTemplate(unwrapApiData(response) || {})
}

export async function archiveAssessmentForm(formId) {
  const response = await http.post(`/assessment/forms/${encodeURIComponent(formId)}/archive`)
  return normalizeFormTemplate(unwrapApiData(response) || {})
}

export async function restoreAssessmentForm(formId, payload = {}) {
  const response = await http.post(`/assessment/forms/${encodeURIComponent(formId)}/restore`, {
    restore_notes: payload.restoreNotes || payload.restore_notes || '',
    version_notes: payload.versionNotes || payload.version_notes || '',
    review_notes: payload.reviewNotes || payload.review_notes || '',
  })
  return normalizeFormTemplate(unwrapApiData(response) || {})
}

export async function fetchAssessmentFormVersions(formId, options = {}) {
  const response = await http.get(`/assessment/forms/${encodeURIComponent(formId)}/versions`, {
    signal: options.signal,
  })

  const items = unwrapApiItems(response) || unwrapApiData(response) || []

  return Array.isArray(items) ? items.map(normalizeFormVersion) : []
}

export async function fetchAssessmentQuestionTypes(options = {}) {
  const response = await http.get('/assessment/question-types', {
    signal: options.signal,
  })

  return unwrapApiItems(response).map(type => ({
    id: type.id ?? '',
    key: String(type.key ?? '').trim(),
    label: String(type.label ?? '').trim(),
    labelKh: String(type.label_kh ?? '').trim(),
    renderer: String(type.renderer ?? '').trim(),
    hasOptions: Boolean(type.has_options ?? false),
    hasScoring: Boolean(type.has_scoring ?? false),
    hasMatrix: Boolean(type.has_matrix ?? false),
    isFile: Boolean(type.is_file ?? false),
    settingsSchema: type.settings_schema ?? null,
    isActive: Boolean(type.is_active ?? false),
    sortOrder: Number(type.sort_order ?? 0),
    raw: type,
  }))
}

// ---------------------------------------------------------------------------
// Compatibility aliases
// ---------------------------------------------------------------------------
//
// The older assessment store/composable stack expects the shorter legacy
// helper names. Keep them here so the canonical module can satisfy both the
// new code path and compatibility imports during the cleanup phase.
export const normalizeCategory = normalizeAssessmentCategory
export const updateAssessment = updateStudentAssessment
export const finalizeAssessment = finalizeStudentAssessment
export const archiveAssessment = archiveStudentAssessment
