<script setup>
// Governance cases turn diff, integrity, export, and reconstruction findings
// into owned review work items so administrators can resolve institutional
// risk without mutating immutable Preschool history.
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import HeaderSection from '@/components/navigation/HeaderSection.vue'
import Button from '@/components/buttons/Button.vue'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import { useLanguage } from '@/composables/useLanguage'
import { usePreschoolAcademicLifecycle } from '@/modules/preschool/composables/usePreschoolAcademicLifecycle'
import { fetchPreschoolClasses, fetchPreschoolStudents } from '@/modules/preschool/services/preschoolApi'
import { fetchReportPeriods } from '@/modules/preschool/services/api/preschoolReportsApi'
import {
  addGovernanceCaseEvidence,
  assignGovernanceCase,
  closeGovernanceCase,
  createGovernanceCase,
  escalateGovernanceCase,
  fetchGovernanceCase,
  fetchGovernanceCaseAssignees,
  fetchGovernanceCases,
  reopenGovernanceCase,
  resolveGovernanceCase,
} from '@/modules/preschool/services/api/preschoolGovernanceCasesApi'
import GovernanceCaseAssignmentPanel from '@/modules/preschool/shared/components/governance-cases/GovernanceCaseAssignmentPanel.vue'
import GovernanceCaseDetailPanel from '@/modules/preschool/shared/components/governance-cases/GovernanceCaseDetailPanel.vue'
import GovernanceCaseEvidenceList from '@/modules/preschool/shared/components/governance-cases/GovernanceCaseEvidenceList.vue'
import GovernanceCaseResolutionPanel from '@/modules/preschool/shared/components/governance-cases/GovernanceCaseResolutionPanel.vue'
import GovernanceCaseSummaryCards from '@/modules/preschool/shared/components/governance-cases/GovernanceCaseSummaryCards.vue'
import GovernanceCaseTable from '@/modules/preschool/shared/components/governance-cases/GovernanceCaseTable.vue'
import GovernanceCaseTimeline from '@/modules/preschool/shared/components/governance-cases/GovernanceCaseTimeline.vue'
import {
  DEFAULT_ASSIGNMENT_FORM,
  DEFAULT_CREATE_FORM,
  DEFAULT_EVIDENCE_FORM,
  DEFAULT_FILTERS,
  DEFAULT_RESOLUTION_FORM,
  GOVERNANCE_CASE_SOURCES,
  GOVERNANCE_CASE_SEVERITIES,
  GOVERNANCE_CASE_STATUSES,
  GOVERNANCE_CASE_WORKFLOW_STATUSES,
} from './constants/governanceCasesConstants'
import {
  buildAssignmentPayload,
  buildCreatePayload,
  buildEvidencePayload,
  buildListQuery,
  buildResolutionPayload,
  buildSeverityLabelMap,
  buildSourceLabelMap,
  buildStatusLabelMap,
  initializeAssignmentFormFromRecord,
  initializeResolutionFormFromRecord,
  normalizeAssigneeItem,
  normalizeClassItem,
  normalizeReportPeriodItem,
  normalizeStudentItem,
} from './utils/governanceCasesHelpers'

defineOptions({
  name: 'PreschoolGovernanceCasesPage',
})

const router = useRouter()
const { t } = useLanguage()
const { academicYears, terms, loadAcademicLifecycle } = usePreschoolAcademicLifecycle()

const loading = ref(false)
const detailLoading = ref(false)
const assigneeLoading = ref(false)
const createLoading = ref(false)
const assignmentLoading = ref(false)
const evidenceLoading = ref(false)
const resolutionLoading = ref(false)
const errorMessage = ref('')
const detailError = ref('')

const listPayload = ref({
  items: [],
  pagination: {},
  summary: {},
  options: {},
})

const detailPayload = ref({
  record: null,
  events: [],
  evidence: [],
  timeline: [],
  summary: {},
  options: {},
})

const assigneeOptions = ref([])
const classOptions = ref([])
const studentOptions = ref([])
const reportPeriodOptions = ref([])
const selectedCaseId = ref('')

const filters = ref({ ...DEFAULT_FILTERS })

const createForm = ref({ ...DEFAULT_CREATE_FORM })

const assignmentForm = ref({ ...DEFAULT_ASSIGNMENT_FORM })

const evidenceForm = ref({ ...DEFAULT_EVIDENCE_FORM })

const resolutionForm = ref({ ...DEFAULT_RESOLUTION_FORM })

const selectedRecord = computed(() => detailPayload.value.record || listPayload.value.items.find((item) => String(item.id) === String(selectedCaseId.value)) || null)

const summaryCards = computed(() => listPayload.value.summary || {})

const sourceLabelMap = computed(() => buildSourceLabelMap(t))

const severityLabelMap = computed(() => buildSeverityLabelMap(t))

const statusLabelMap = computed(() => buildStatusLabelMap(t))

const sourceOptions = computed(() => {
  const items = listPayload.value.options?.sourceOptions
  if (Array.isArray(items) && items.length) {
    return items.map((item) => ({ label: item.label || item.value, value: item.value }))
  }

  return [
    { label: sourceLabelMap.value.governance_diff, value: GOVERNANCE_CASE_SOURCES.GOVERNANCE_DIFF },
    { label: sourceLabelMap.value.integrity_warning, value: GOVERNANCE_CASE_SOURCES.INTEGRITY_WARNING },
    { label: sourceLabelMap.value.export_mismatch, value: GOVERNANCE_CASE_SOURCES.EXPORT_MISMATCH },
    { label: sourceLabelMap.value.lifecycle_anomaly, value: GOVERNANCE_CASE_SOURCES.LIFECYCLE_ANOMALY },
    { label: sourceLabelMap.value.reconstruction_inconsistency, value: GOVERNANCE_CASE_SOURCES.RECONSTRUCTION_INCONSISTENCY },
    { label: sourceLabelMap.value.manual_review, value: GOVERNANCE_CASE_SOURCES.MANUAL_REVIEW },
  ]
})

const severityOptions = computed(() => {
  const items = listPayload.value.options?.severityOptions
  if (Array.isArray(items) && items.length) {
    return items.map((item) => ({ label: item.label || item.value, value: item.value }))
  }

  return [
    { label: severityLabelMap.value.low, value: GOVERNANCE_CASE_SEVERITIES.LOW },
    { label: severityLabelMap.value.medium, value: GOVERNANCE_CASE_SEVERITIES.MEDIUM },
    { label: severityLabelMap.value.high, value: GOVERNANCE_CASE_SEVERITIES.HIGH },
    { label: severityLabelMap.value.critical, value: GOVERNANCE_CASE_SEVERITIES.CRITICAL },
  ]
})

const statusOptions = computed(() => {
  const items = listPayload.value.options?.statusOptions
  if (Array.isArray(items) && items.length) {
    return items.map((item) => ({ label: item.label || item.value, value: item.value }))
  }

  return [
    { label: statusLabelMap.value.open, value: GOVERNANCE_CASE_STATUSES.OPEN },
    { label: statusLabelMap.value.under_review, value: GOVERNANCE_CASE_STATUSES.UNDER_REVIEW },
    { label: statusLabelMap.value.investigating, value: GOVERNANCE_CASE_STATUSES.INVESTIGATING },
    { label: statusLabelMap.value.awaiting_evidence, value: GOVERNANCE_CASE_STATUSES.AWAITING_EVIDENCE },
    { label: statusLabelMap.value.escalated, value: GOVERNANCE_CASE_STATUSES.ESCALATED },
    { label: statusLabelMap.value.resolved, value: GOVERNANCE_CASE_STATUSES.RESOLVED },
    { label: statusLabelMap.value.closed, value: GOVERNANCE_CASE_STATUSES.CLOSED },
  ]
})

const workflowStatusOptions = computed(() => {
  const items = listPayload.value.options?.workflowStatusOptions
  if (Array.isArray(items) && items.length) {
    return items.map((item) => ({ label: item.label || item.value, value: item.value }))
  }

  return statusOptions.value.filter((item) => GOVERNANCE_CASE_WORKFLOW_STATUSES.includes(item.value))
})

const academicYearOptions = computed(() => [
  { label: t('preschoolGovernanceCasesPage.filters.allAcademicYears'), value: '' },
  ...academicYears.value.map((year) => ({
    label: year.label || year.code || `#${year.id}`,
    value: String(year.id || ''),
  })),
])

const termOptions = computed(() => [
  { label: t('preschoolGovernanceCasesPage.filters.allTerms'), value: '' },
  ...terms.value.map((term) => ({
    label: term.label || term.name || term.code || `#${term.id}`,
    value: String(term.id || ''),
  })),
])

const reportPeriodOptionsList = computed(() => [
  { label: t('preschoolGovernanceCasesPage.filters.allReportPeriods'), value: '' },
  ...reportPeriodOptions.value.map((period) => ({
    label: period.label,
    value: String(period.value),
  })),
])

const classOptionsList = computed(() => [
  { label: t('preschoolGovernanceCasesPage.filters.allClasses'), value: '' },
  ...classOptions.value.map((item) => ({
    label: item.label,
    value: String(item.value),
  })),
])

const studentOptionsList = computed(() => [
  { label: t('preschoolGovernanceCasesPage.filters.allStudents'), value: '' },
  ...studentOptions.value.map((item) => ({
    label: item.label,
    value: String(item.value),
  })),
])

const assigneeSelectOptions = computed(() => [
  { label: t('preschoolGovernanceCasesPage.filters.allAssignees'), value: '' },
  ...assigneeOptions.value.map((item) => ({
    label: item.label,
    value: item.value,
  })),
])

const caseTableColumns = computed(() => ({
  case: t('preschoolGovernanceCasesPage.table.columns.case'),
  severity: t('preschoolGovernanceCasesPage.table.columns.severity'),
  status: t('preschoolGovernanceCasesPage.table.columns.status'),
  owner: t('preschoolGovernanceCasesPage.table.columns.owner'),
  dueDate: t('preschoolGovernanceCasesPage.table.columns.dueDate'),
  source: t('preschoolGovernanceCasesPage.table.columns.source'),
  updatedAt: t('preschoolGovernanceCasesPage.table.columns.updatedAt'),
}))

const detailLabels = computed(() => ({
  caseLabel: t('preschoolGovernanceCasesPage.detail.caseLabel'),
  riskScore: t('preschoolGovernanceCasesPage.detail.riskScore'),
  severity: t('preschoolGovernanceCasesPage.detail.severity'),
  source: t('preschoolGovernanceCasesPage.detail.source'),
  owner: t('preschoolGovernanceCasesPage.detail.owner'),
  reviewer: t('preschoolGovernanceCasesPage.detail.reviewer'),
  escalationOfficer: t('preschoolGovernanceCasesPage.detail.escalationOfficer'),
  dueDate: t('preschoolGovernanceCasesPage.detail.dueDate'),
  academicContext: t('preschoolGovernanceCasesPage.detail.academicContext'),
  assignmentContext: t('preschoolGovernanceCasesPage.detail.assignmentContext'),
  statusSummary: t('preschoolGovernanceCasesPage.detail.statusSummary'),
  createdBy: t('preschoolGovernanceCasesPage.detail.createdBy'),
  updatedAt: t('preschoolGovernanceCasesPage.detail.updatedAt'),
  summary: t('preschoolGovernanceCasesPage.detail.summary'),
  latestNote: t('preschoolGovernanceCasesPage.detail.latestNote'),
  eventsCount: t('preschoolGovernanceCasesPage.detail.eventsCount'),
  evidenceCount: t('preschoolGovernanceCasesPage.detail.evidenceCount'),
  timelineCount: t('preschoolGovernanceCasesPage.detail.timelineCount'),
  createdAt: t('preschoolGovernanceCasesPage.detail.createdAt'),
  resolutionTimeline: t('preschoolGovernanceCasesPage.detail.resolutionTimeline'),
  resolvedAt: t('preschoolGovernanceCasesPage.detail.resolvedAt'),
  closedAt: t('preschoolGovernanceCasesPage.detail.closedAt'),
  sourceContext: t('preschoolGovernanceCasesPage.detail.sourceContext'),
  noSummary: t('preschoolGovernanceCasesPage.detail.noSummary'),
  noNotes: t('preschoolGovernanceCasesPage.detail.noNotes'),
  noSourceContext: t('preschoolGovernanceCasesPage.detail.noSourceContext'),
}))

const timelineLabels = computed(() => ({
  actor: t('preschoolGovernanceCasesPage.timeline.actor'),
  status: t('preschoolGovernanceCasesPage.timeline.status'),
  context: t('preschoolGovernanceCasesPage.timeline.context'),
  eventType: t('preschoolGovernanceCasesPage.timeline.eventType'),
  noDescription: t('preschoolGovernanceCasesPage.timeline.noDescription'),
  recordedAt: t('preschoolGovernanceCasesPage.timeline.recordedAt'),
}))

const evidenceLabels = computed(() => ({
  title: t('preschoolGovernanceCasesPage.evidence.title'),
  subtitle: t('preschoolGovernanceCasesPage.evidence.subtitle'),
  reference: t('preschoolGovernanceCasesPage.evidence.reference'),
  creator: t('preschoolGovernanceCasesPage.evidence.creator'),
  evidenceType: t('preschoolGovernanceCasesPage.evidence.evidenceType'),
  evidenceReference: t('preschoolGovernanceCasesPage.evidence.evidenceReference'),
  evidenceLabel: t('preschoolGovernanceCasesPage.evidence.evidenceLabel'),
  evidenceDescription: t('preschoolGovernanceCasesPage.evidence.evidenceDescription'),
  metadata: t('preschoolGovernanceCasesPage.evidence.metadata'),
  addEvidence: t('preschoolGovernanceCasesPage.evidence.addEvidence'),
  evidenceTypePlaceholder: t('preschoolGovernanceCasesPage.evidence.placeholders.evidenceType'),
  evidenceReferencePlaceholder: t('preschoolGovernanceCasesPage.evidence.placeholders.evidenceReference'),
  evidenceLabelPlaceholder: t('preschoolGovernanceCasesPage.evidence.placeholders.evidenceLabel'),
  evidenceDescriptionPlaceholder: t('preschoolGovernanceCasesPage.evidence.placeholders.evidenceDescription'),
  metadataPlaceholder: t('preschoolGovernanceCasesPage.evidence.placeholders.metadata'),
  noDescription: t('preschoolGovernanceCasesPage.evidence.noDescription'),
}))

const assignmentLabels = computed(() => ({
  title: t('preschoolGovernanceCasesPage.assignment.title'),
  subtitle: t('preschoolGovernanceCasesPage.assignment.subtitle'),
  owner: t('preschoolGovernanceCasesPage.assignment.owner'),
  reviewer: t('preschoolGovernanceCasesPage.assignment.reviewer'),
  escalationOfficer: t('preschoolGovernanceCasesPage.assignment.escalationOfficer'),
  status: t('preschoolGovernanceCasesPage.assignment.status'),
  dueDate: t('preschoolGovernanceCasesPage.assignment.dueDate'),
  note: t('preschoolGovernanceCasesPage.assignment.note'),
  notePlaceholder: t('preschoolGovernanceCasesPage.assignment.notePlaceholder'),
  save: t('preschoolGovernanceCasesPage.assignment.save'),
  currentOwner: t('preschoolGovernanceCasesPage.assignment.currentOwner'),
  escalate: t('preschoolGovernanceCasesPage.resolution.escalate'),
  escalationReason: t('preschoolGovernanceCasesPage.resolution.escalationReason'),
  escalationReasonPlaceholder: t('preschoolGovernanceCasesPage.resolution.escalationReasonPlaceholder'),
}))

const resolutionLabels = computed(() => ({
  title: t('preschoolGovernanceCasesPage.resolution.title'),
  subtitle: t('preschoolGovernanceCasesPage.resolution.subtitle'),
  resolutionNote: t('preschoolGovernanceCasesPage.resolution.resolutionNote'),
  resolutionNotePlaceholder: t('preschoolGovernanceCasesPage.resolution.resolutionNotePlaceholder'),
  closureNote: t('preschoolGovernanceCasesPage.resolution.closureNote'),
  closureNotePlaceholder: t('preschoolGovernanceCasesPage.resolution.closureNotePlaceholder'),
  reopenReason: t('preschoolGovernanceCasesPage.resolution.reopenReason'),
  reopenReasonPlaceholder: t('preschoolGovernanceCasesPage.resolution.reopenReasonPlaceholder'),
  escalationReason: t('preschoolGovernanceCasesPage.resolution.escalationReason'),
  escalationReasonPlaceholder: t('preschoolGovernanceCasesPage.resolution.escalationReasonPlaceholder'),
  resolve: t('preschoolGovernanceCasesPage.resolution.resolve'),
  close: t('preschoolGovernanceCasesPage.resolution.close'),
  reopen: t('preschoolGovernanceCasesPage.resolution.reopen'),
}))

const createLabels = computed(() => ({
  title: t('preschoolGovernanceCasesPage.create.title'),
  subtitle: t('preschoolGovernanceCasesPage.create.subtitle'),
  caseTitle: t('preschoolGovernanceCasesPage.create.caseTitle'),
  summary: t('preschoolGovernanceCasesPage.create.summary'),
  sourceType: t('preschoolGovernanceCasesPage.create.sourceType'),
  sourceReference: t('preschoolGovernanceCasesPage.create.sourceReference'),
  severity: t('preschoolGovernanceCasesPage.create.severity'),
  riskScore: t('preschoolGovernanceCasesPage.create.riskScore'),
  status: t('preschoolGovernanceCasesPage.create.status'),
  urgent: t('preschoolGovernanceCasesPage.create.urgent'),
  urgentReason: t('preschoolGovernanceCasesPage.create.urgentReason'),
  owner: t('preschoolGovernanceCasesPage.create.owner'),
  reviewer: t('preschoolGovernanceCasesPage.create.reviewer'),
  escalationOfficer: t('preschoolGovernanceCasesPage.create.escalationOfficer'),
  dueDate: t('preschoolGovernanceCasesPage.create.dueDate'),
  academicYear: t('preschoolGovernanceCasesPage.create.academicYear'),
  term: t('preschoolGovernanceCasesPage.create.term'),
  reportPeriod: t('preschoolGovernanceCasesPage.create.reportPeriod'),
  class: t('preschoolGovernanceCasesPage.create.class'),
  student: t('preschoolGovernanceCasesPage.create.student'),
  latestNote: t('preschoolGovernanceCasesPage.create.latestNote'),
  createCase: t('preschoolGovernanceCasesPage.create.createCase'),
  reset: t('preschoolGovernanceCasesPage.create.reset'),
  sourceContext: t('preschoolGovernanceCasesPage.create.sourceContext'),
  placeholders: {
    title: t('preschoolGovernanceCasesPage.create.placeholders.title'),
    sourceReference: t('preschoolGovernanceCasesPage.create.placeholders.sourceReference'),
    urgentReason: t('preschoolGovernanceCasesPage.create.placeholders.urgentReason'),
  },
}))

const filterLabels = computed(() => ({
  title: t('preschoolGovernanceCasesPage.filters.title'),
  subtitle: t('preschoolGovernanceCasesPage.filters.subtitle'),
  academicYear: t('preschoolGovernanceCasesPage.filters.academicYear'),
  term: t('preschoolGovernanceCasesPage.filters.term'),
  reportPeriod: t('preschoolGovernanceCasesPage.filters.reportPeriod'),
  class: t('preschoolGovernanceCasesPage.filters.class'),
  student: t('preschoolGovernanceCasesPage.filters.student'),
  owner: t('preschoolGovernanceCasesPage.filters.owner'),
  reviewer: t('preschoolGovernanceCasesPage.filters.reviewer'),
  escalationOfficer: t('preschoolGovernanceCasesPage.filters.escalationOfficer'),
  status: t('preschoolGovernanceCasesPage.filters.status'),
  severity: t('preschoolGovernanceCasesPage.filters.severity'),
  sourceType: t('preschoolGovernanceCasesPage.filters.sourceType'),
  sourceReference: t('preschoolGovernanceCasesPage.filters.sourceReference'),
  urgent: t('preschoolGovernanceCasesPage.filters.urgent'),
  dueFrom: t('preschoolGovernanceCasesPage.filters.dueFrom'),
  dueTo: t('preschoolGovernanceCasesPage.filters.dueTo'),
  createdFrom: t('preschoolGovernanceCasesPage.filters.createdFrom'),
  createdTo: t('preschoolGovernanceCasesPage.filters.createdTo'),
  updatedFrom: t('preschoolGovernanceCasesPage.filters.updatedFrom'),
  updatedTo: t('preschoolGovernanceCasesPage.filters.updatedTo'),
  search: t('preschoolGovernanceCasesPage.filters.search'),
  allAcademicYears: t('preschoolGovernanceCasesPage.filters.allAcademicYears'),
  allTerms: t('preschoolGovernanceCasesPage.filters.allTerms'),
  allReportPeriods: t('preschoolGovernanceCasesPage.filters.allReportPeriods'),
  allClasses: t('preschoolGovernanceCasesPage.filters.allClasses'),
  allStudents: t('preschoolGovernanceCasesPage.filters.allStudents'),
  allAssignees: t('preschoolGovernanceCasesPage.filters.allAssignees'),
  allStatuses: t('preschoolGovernanceCasesPage.filters.allStatuses'),
  allSeverities: t('preschoolGovernanceCasesPage.filters.allSeverities'),
  allSourceTypes: t('preschoolGovernanceCasesPage.filters.allSourceTypes'),
  allUrgentStates: t('preschoolGovernanceCasesPage.filters.allUrgentStates'),
  searchPlaceholder: t('preschoolGovernanceCasesPage.filters.searchPlaceholder'),
  sourceReferencePlaceholder: t('preschoolGovernanceCasesPage.filters.sourceReferencePlaceholder'),
}))


async function loadLookupOptions() {
  assigneeLoading.value = true

  try {
    const [classesResponse, studentsResponse, reportPeriodsResponse, assigneesResponse] = await Promise.all([
      fetchPreschoolClasses({ page: 1, perPage: 100 }),
      fetchPreschoolStudents({ page: 1, perPage: 100 }),
      fetchReportPeriods(),
      fetchGovernanceCaseAssignees(),
    ])

    classOptions.value = (classesResponse.items || []).map(normalizeClassItem)
    studentOptions.value = (studentsResponse.items || []).map(normalizeStudentItem)
    reportPeriodOptions.value = (reportPeriodsResponse || []).map(normalizeReportPeriodItem)

    assigneeOptions.value = (assigneesResponse.items || []).map(normalizeAssigneeItem)
  } catch {
    classOptions.value = []
    studentOptions.value = []
    reportPeriodOptions.value = []
    assigneeOptions.value = []
  } finally {
    assigneeLoading.value = false
  }
}

async function loadCases(selectFirst = false) {
  loading.value = true
  errorMessage.value = ''

  try {
    listPayload.value = await fetchGovernanceCases(buildListQuery(filters.value))

    const firstItem = listPayload.value.items[0] || null
    const selectedExists = listPayload.value.items.some((item) => String(item.id) === String(selectedCaseId.value))

    if ((selectFirst || !selectedCaseId.value || !selectedExists) && firstItem) {
      await loadCaseDetail(firstItem.id)
    }
  } catch (error) {
    listPayload.value = {
      items: [],
      pagination: {},
      summary: {},
      options: {},
    }
    errorMessage.value = error?.message || t('preschoolGovernanceCasesPage.errors.loadCases')
  } finally {
    loading.value = false
  }
}

async function loadCaseDetail(caseId) {
  if (!caseId) {
    selectedCaseId.value = ''
    detailPayload.value = {
      record: null,
      events: [],
      evidence: [],
      timeline: [],
      summary: {},
      options: {},
    }
    return
  }

  detailLoading.value = true
  detailError.value = ''

  try {
    detailPayload.value = await fetchGovernanceCase(caseId)
    selectedCaseId.value = String(detailPayload.value.record?.id || caseId)

    assignmentForm.value = initializeAssignmentFormFromRecord(detailPayload.value.record)
    resolutionForm.value = initializeResolutionFormFromRecord(detailPayload.value.record)
    evidenceForm.value = { ...DEFAULT_EVIDENCE_FORM }
  } catch (error) {
    detailPayload.value = {
      record: null,
      events: [],
      evidence: [],
      timeline: [],
      summary: {},
      options: {},
    }
    detailError.value = error?.message || t('preschoolGovernanceCasesPage.errors.loadDetail')
  } finally {
    detailLoading.value = false
  }
}

function selectCase(record) {
  if (!record?.id) return
  return loadCaseDetail(record.id)
}

async function refreshAll() {
  await Promise.all([
    loadCases(Boolean(selectedCaseId.value)),
    loadLookupOptions(),
  ])
}

function resetFilters() {
  filters.value = { ...DEFAULT_FILTERS }
  return loadCases(true)
}

async function submitCreateCase() {
  createLoading.value = true
  errorMessage.value = ''

  try {
    const payload = buildCreatePayload(createForm.value)
    const response = await createGovernanceCase(payload)
    detailPayload.value = response
    selectedCaseId.value = String(response.record?.id || '')
    await loadCases(false)
    await loadCaseDetail(selectedCaseId.value)
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolGovernanceCasesPage.errors.createCase')
  } finally {
    createLoading.value = false
  }
}

async function submitAssignment() {
  if (!selectedRecord.value?.id) return

  assignmentLoading.value = true
  errorMessage.value = ''

  try {
    const payload = buildAssignmentPayload(assignmentForm.value)
    detailPayload.value = await assignGovernanceCase(selectedRecord.value.id, payload)
    await loadCases(false)
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolGovernanceCasesPage.errors.assignCase')
  } finally {
    assignmentLoading.value = false
  }
}

async function submitEvidence() {
  if (!selectedRecord.value?.id) return

  evidenceLoading.value = true
  errorMessage.value = ''

  try {
    const payload = buildEvidencePayload(evidenceForm.value)
    detailPayload.value = await addGovernanceCaseEvidence(selectedRecord.value.id, payload)
    evidenceForm.value = { ...DEFAULT_EVIDENCE_FORM }
    await loadCases(false)
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolGovernanceCasesPage.errors.addEvidence')
  } finally {
    evidenceLoading.value = false
  }
}

async function submitResolution(action) {
  if (!selectedRecord.value?.id) return

  resolutionLoading.value = true
  errorMessage.value = ''

  try {
    const payload = buildResolutionPayload(resolutionForm.value, action, assignmentForm.value)
    if (action === 'resolve') {
      detailPayload.value = await resolveGovernanceCase(selectedRecord.value.id, payload)
    } else if (action === 'close') {
      detailPayload.value = await closeGovernanceCase(selectedRecord.value.id, payload)
    } else if (action === 'escalate') {
      detailPayload.value = await escalateGovernanceCase(selectedRecord.value.id, payload)
    } else if (action === 'reopen') {
      detailPayload.value = await reopenGovernanceCase(selectedRecord.value.id, payload)
    }

    await loadCases(false)
  } catch (error) {
    errorMessage.value = error?.message || t('preschoolGovernanceCasesPage.errors.resolution')
  } finally {
    resolutionLoading.value = false
  }
}

function goToGovernanceReview() {
  router.push({ name: 'dashboard-preschool-admin-governance-review' })
}

function goToGovernanceDiffAnalysis() {
  router.push({ name: 'dashboard-preschool-admin-governance-diff' })
}

function goToReconstruction() {
  router.push({ name: 'dashboard-preschool-admin-reconstruction' })
}

function goToExportGovernance() {
  router.push({ name: 'dashboard-preschool-admin-export-governance' })
}

function goToSnapshotArchive() {
  router.push({ name: 'dashboard-preschool-admin-report-snapshots' })
}

onMounted(async () => {
  await loadAcademicLifecycle()
  await loadLookupOptions()
  await loadCases(true)
})
</script>

<template>
  <MainLayout>
    <section class="space-y-4">
      <HeaderSection
        :title="t('preschoolGovernanceCasesPage.title')"
        :subtitle="t('preschoolGovernanceCasesPage.subtitle')"
      />

      <div class="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToGovernanceReview">
          {{ t('preschoolGovernanceCasesPage.actions.openGovernanceReview') }}
        </Button>
        <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToGovernanceDiffAnalysis">
          {{ t('preschoolGovernanceCasesPage.actions.openGovernanceDiff') }}
        </Button>
        <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToReconstruction">
          {{ t('preschoolGovernanceCasesPage.actions.openReconstruction') }}
        </Button>
        <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToExportGovernance">
          {{ t('preschoolGovernanceCasesPage.actions.openExportGovernance') }}
        </Button>
        <Button type="button" variant="ghost" size="md" rounded="xl" @click="goToSnapshotArchive">
          {{ t('preschoolGovernanceCasesPage.actions.openSnapshotArchive') }}
        </Button>
        <Button type="button" variant="secondary" size="md" rounded="xl" :loading="loading || detailLoading || assigneeLoading" @click="refreshAll">
          {{ t('preschoolGovernanceCasesPage.actions.refresh') }}
        </Button>
      </div>

      <div v-if="errorMessage" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage }}
      </div>
      <div v-if="detailError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ detailError }}
      </div>

      <GovernanceCaseSummaryCards
        :summary="summaryCards"
        :title-map="{
          openCases: t('preschoolGovernanceCasesPage.summary.openCases'),
          underReviewCases: t('preschoolGovernanceCasesPage.summary.underReviewCases'),
          escalatedCases: t('preschoolGovernanceCasesPage.summary.escalatedCases'),
          criticalCases: t('preschoolGovernanceCasesPage.summary.criticalCases'),
          overdueCases: t('preschoolGovernanceCasesPage.summary.overdueCases'),
          resolvedCases: t('preschoolGovernanceCasesPage.summary.resolvedCases'),
        }"
      />

      <div class="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
        <div class="space-y-4">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="space-y-1">
              <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolGovernanceCasesPage.create.title') }}</h3>
              <p class="text-sm text-slate-500">{{ t('preschoolGovernanceCasesPage.create.subtitle') }}</p>
            </div>

            <div class="mt-4 grid gap-3 md:grid-cols-2">
              <label class="space-y-2 text-sm md:col-span-2">
                <span class="font-medium text-slate-700">{{ createLabels.caseTitle }}</span>
                <InputText
                  v-model="createForm.title"
                  class="w-full"
                  :placeholder="createLabels.placeholders.title"
                />
              </label>

              <label class="space-y-2 text-sm md:col-span-2">
                <span class="font-medium text-slate-700">{{ createLabels.summary }}</span>
                <Textarea
                  v-model="createForm.summary"
                  class="w-full"
                  rows="3"
                  :auto-resize="true"
                  :placeholder="t('preschoolGovernanceCasesPage.create.placeholders.summary')"
                />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.sourceType }}</span>
                <Select v-model="createForm.sourceType" :options="sourceOptions" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.sourceReference }}</span>
                <InputText v-model="createForm.sourceReference" class="w-full" :placeholder="createLabels.placeholders.sourceReference" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.severity }}</span>
                <Select v-model="createForm.severity" :options="severityOptions" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.riskScore }}</span>
                <InputText v-model="createForm.riskScore" type="number" min="0" max="100" class="w-full" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.status }}</span>
                <Select v-model="createForm.status" :options="statusOptions" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.urgent }}</span>
                <Select
                  v-model="createForm.isUrgent"
                  :options="[
                    { label: t('preschoolGovernanceCasesPage.boolean.true'), value: true },
                    { label: t('preschoolGovernanceCasesPage.boolean.false'), value: false },
                  ]"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                />
              </label>

              <label class="space-y-2 text-sm md:col-span-2">
                <span class="font-medium text-slate-700">{{ createLabels.urgentReason }}</span>
                <Textarea
                  v-model="createForm.urgentReason"
                  class="w-full"
                  rows="2"
                  :auto-resize="true"
                  :placeholder="createLabels.placeholders.urgentReason"
                />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.academicYear }}</span>
                <Select v-model="createForm.academicYearId" :options="academicYearOptions" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.term }}</span>
                <Select v-model="createForm.termId" :options="termOptions" option-label="label" option-value="value" class="w-full" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.reportPeriod }}</span>
                <Select v-model="createForm.reportPeriodId" :options="reportPeriodOptionsList" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.class }}</span>
                <Select v-model="createForm.classId" :options="classOptionsList" option-label="label" option-value="value" class="w-full" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.student }}</span>
                <Select v-model="createForm.studentId" :options="studentOptionsList" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.dueDate }}</span>
                <InputText v-model="createForm.dueDate" type="date" class="w-full" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.owner }}</span>
                <Select v-model="createForm.ownerUserId" :options="assigneeSelectOptions" option-label="label" option-value="value" class="w-full" :loading="assigneeLoading" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.reviewer }}</span>
                <Select v-model="createForm.reviewerUserId" :options="assigneeSelectOptions" option-label="label" option-value="value" class="w-full" :loading="assigneeLoading" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ createLabels.escalationOfficer }}</span>
                <Select v-model="createForm.escalationOfficerUserId" :options="assigneeSelectOptions" option-label="label" option-value="value" class="w-full" :loading="assigneeLoading" />
              </label>
              <label class="space-y-2 text-sm md:col-span-2">
                <span class="font-medium text-slate-700">{{ createLabels.latestNote }}</span>
                <Textarea
                  v-model="createForm.latestNote"
                  class="w-full"
                  rows="2"
                  :auto-resize="true"
                  :placeholder="t('preschoolGovernanceCasesPage.create.placeholders.latestNote')"
                />
              </label>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-end gap-2">
              <Button type="button" variant="secondary" size="md" rounded="xl" @click="resetFilters">
                {{ createLabels.reset }}
              </Button>
              <Button type="button" variant="primary" size="md" rounded="xl" :loading="createLoading" @click="submitCreateCase">
                {{ createLabels.createCase }}
              </Button>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="space-y-1">
              <h3 class="text-sm font-semibold text-slate-900">{{ filterLabels.title }}</h3>
              <p class="text-sm text-slate-500">{{ filterLabels.subtitle }}</p>
            </div>

            <div class="mt-4 grid gap-3 md:grid-cols-2">
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.academicYear }}</span>
                <Select v-model="filters.academicYearId" :options="academicYearOptions" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.term }}</span>
                <Select v-model="filters.termId" :options="termOptions" option-label="label" option-value="value" class="w-full" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.reportPeriod }}</span>
                <Select v-model="filters.reportPeriodId" :options="reportPeriodOptionsList" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.class }}</span>
                <Select v-model="filters.classId" :options="classOptionsList" option-label="label" option-value="value" class="w-full" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.student }}</span>
                <Select v-model="filters.studentId" :options="studentOptionsList" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.owner }}</span>
                <Select v-model="filters.ownerUserId" :options="assigneeSelectOptions" option-label="label" option-value="value" class="w-full" :loading="assigneeLoading" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.reviewer }}</span>
                <Select v-model="filters.reviewerUserId" :options="assigneeSelectOptions" option-label="label" option-value="value" class="w-full" :loading="assigneeLoading" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.escalationOfficer }}</span>
                <Select v-model="filters.escalationOfficerUserId" :options="assigneeSelectOptions" option-label="label" option-value="value" class="w-full" :loading="assigneeLoading" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.status }}</span>
                <Select v-model="filters.status" :options="statusOptions" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.severity }}</span>
                <Select v-model="filters.severity" :options="severityOptions" option-label="label" option-value="value" class="w-full" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.sourceType }}</span>
                <Select v-model="filters.sourceType" :options="sourceOptions" option-label="label" option-value="value" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.sourceReference }}</span>
                <InputText v-model="filters.sourceReference" class="w-full" :placeholder="filterLabels.sourceReferencePlaceholder" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.urgent }}</span>
                <Select
                  v-model="filters.isUrgent"
                  :options="[
                    { label: filterLabels.allUrgentStates, value: '' },
                    { label: t('preschoolGovernanceCasesPage.boolean.true'), value: true },
                    { label: t('preschoolGovernanceCasesPage.boolean.false'), value: false },
                  ]"
                  option-label="label"
                  option-value="value"
                  class="w-full"
                />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.search }}</span>
                <InputText v-model="filters.search" class="w-full" :placeholder="filterLabels.searchPlaceholder" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.dueFrom }}</span>
                <InputText v-model="filters.dueFrom" type="date" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.dueTo }}</span>
                <InputText v-model="filters.dueTo" type="date" class="w-full" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.createdFrom }}</span>
                <InputText v-model="filters.createdFrom" type="date" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.createdTo }}</span>
                <InputText v-model="filters.createdTo" type="date" class="w-full" />
              </label>

              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.updatedFrom }}</span>
                <InputText v-model="filters.updatedFrom" type="date" class="w-full" />
              </label>
              <label class="space-y-2 text-sm">
                <span class="font-medium text-slate-700">{{ filterLabels.updatedTo }}</span>
                <InputText v-model="filters.updatedTo" type="date" class="w-full" />
              </label>
            </div>

            <div class="mt-4 flex flex-wrap items-center justify-end gap-2">
              <Button type="button" variant="secondary" size="md" rounded="xl" @click="resetFilters">
                {{ t('preschoolGovernanceCasesPage.actions.clearFilters') }}
              </Button>
              <Button type="button" variant="primary" size="md" rounded="xl" :loading="loading" @click="loadCases(true)">
                {{ t('preschoolGovernanceCasesPage.actions.applyFilters') }}
              </Button>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-slate-900">{{ t('preschoolGovernanceCasesPage.table.title') }}</h3>
              <p class="text-xs text-slate-500">{{ listPayload.pagination?.total ?? 0 }} {{ t('preschoolGovernanceCasesPage.table.records') }}</p>
            </div>
            <GovernanceCaseTable
              :items="listPayload.items"
              :selected-case-id="selectedCaseId"
              :columns="caseTableColumns"
              :empty-label="t('preschoolGovernanceCasesPage.table.empty')"
              :source-label-map="sourceLabelMap"
              :status-label-map="statusLabelMap"
              :severity-label-map="severityLabelMap"
              @select-case="selectCase"
            />
          </div>
        </div>

        <div class="space-y-4">
          <GovernanceCaseDetailPanel
            :record="selectedRecord || {}"
            :detail="detailPayload"
            :labels="detailLabels"
            :source-label-map="sourceLabelMap"
            :status-label-map="statusLabelMap"
            :severity-label-map="severityLabelMap"
          />

          <GovernanceCaseAssignmentPanel
            v-model="assignmentForm"
            :record="selectedRecord || {}"
            :assignee-options="assigneeSelectOptions"
            :status-options="workflowStatusOptions"
            :labels="assignmentLabels"
            :loading="assignmentLoading"
            :disabled="!selectedRecord"
            @assign="submitAssignment"
          />

          <GovernanceCaseEvidenceList
            v-model="evidenceForm"
            :items="detailPayload.evidence"
            :labels="evidenceLabels"
            :loading="evidenceLoading"
            :disabled="!selectedRecord"
            :empty-label="t('preschoolGovernanceCasesPage.evidence.empty')"
            @add-evidence="submitEvidence"
          />

          <GovernanceCaseResolutionPanel
            v-model="resolutionForm"
            :record="selectedRecord || {}"
            :labels="resolutionLabels"
            :loading="resolutionLoading"
            :disabled="!selectedRecord"
            @escalate="submitResolution('escalate')"
            @resolve="submitResolution('resolve')"
            @close="submitResolution('close')"
            @reopen="submitResolution('reopen')"
          />

          <GovernanceCaseTimeline
            :title="t('preschoolGovernanceCasesPage.timeline.title')"
            :subtitle="t('preschoolGovernanceCasesPage.timeline.subtitle')"
            :items="detailPayload.timeline"
            :labels="timelineLabels"
            :empty-label="t('preschoolGovernanceCasesPage.timeline.empty')"
          />
        </div>
      </div>
    </section>
  </MainLayout>
</template>
