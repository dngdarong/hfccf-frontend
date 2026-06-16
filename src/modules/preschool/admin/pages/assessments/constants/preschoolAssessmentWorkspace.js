export const PRESCHOOL_ASSESSMENT_ROUTE_NAMES = {
  dashboard: 'preschool-assessment-dashboard',
  list: 'preschool-assessment-list',
  reports: 'preschool-assessment-reports',
  settings: 'preschool-assessment-settings',
}

export const PRESCHOOL_ASSESSMENT_PAGE_FLOW = [
  {
    key: 'overview',
    titleKey: 'assessmentDashboard.workflow.overview.title',
    descriptionKey: 'assessmentDashboard.workflow.overview.description',
    title: 'Overview',
    description: 'Review the current assessment state, key totals, and risk signals.',
    routeName: PRESCHOOL_ASSESSMENT_ROUTE_NAMES.dashboard,
  },
  {
    key: 'capture',
    titleKey: 'assessmentDashboard.workflow.capture.title',
    descriptionKey: 'assessmentDashboard.workflow.capture.description',
    title: 'Capture',
    description: 'Create and edit student assessments for the selected Preschool context.',
    routeName: PRESCHOOL_ASSESSMENT_ROUTE_NAMES.list,
  },
  {
    key: 'review',
    titleKey: 'assessmentDashboard.workflow.review.title',
    descriptionKey: 'assessmentDashboard.workflow.review.description',
    title: 'Review',
    description: 'Finalize, archive, and inspect assessment history before reporting.',
    routeName: PRESCHOOL_ASSESSMENT_ROUTE_NAMES.reports,
  },
  {
    key: 'configure',
    titleKey: 'assessmentDashboard.workflow.configure.title',
    descriptionKey: 'assessmentDashboard.workflow.configure.description',
    title: 'Configure',
    description: 'Manage scoring rules, thresholds, periods, and module preferences.',
    routeName: PRESCHOOL_ASSESSMENT_ROUTE_NAMES.settings,
  },
]

export const PRESCHOOL_ASSESSMENT_NAV_CARDS = [
  {
    groupKey: 'assessmentDashboard.workspace.groups.hub',
    group: 'Assessment Hub',
    titleKey: 'assessmentDashboard.workspace.cards.dashboard.title',
    descriptionKey: 'assessmentDashboard.workspace.cards.dashboard.description',
    title: 'Dashboard',
    description: 'Summary metrics, recent activity, and quick actions.',
    routeName: PRESCHOOL_ASSESSMENT_ROUTE_NAMES.dashboard,
    iconClass: 'pi pi-chart-bar',
  },
  {
    groupKey: 'assessmentDashboard.workspace.groups.hub',
    group: 'Assessment Hub',
    titleKey: 'assessmentDashboard.workspace.cards.list.title',
    descriptionKey: 'assessmentDashboard.workspace.cards.list.description',
    title: 'Assessment List',
    description: 'Create, edit, finalize, and archive student assessments.',
    routeName: PRESCHOOL_ASSESSMENT_ROUTE_NAMES.list,
    iconClass: 'pi pi-list-check',
  },
  {
    groupKey: 'assessmentDashboard.workspace.groups.analysis',
    group: 'Analysis',
    titleKey: 'assessmentDashboard.workspace.cards.reports.title',
    descriptionKey: 'assessmentDashboard.workspace.cards.reports.description',
    title: 'Reports',
    description: 'Track trends, risk levels, and performance insights.',
    routeName: PRESCHOOL_ASSESSMENT_ROUTE_NAMES.reports,
    iconClass: 'pi pi-chart-line',
  },
  {
    groupKey: 'assessmentDashboard.workspace.groups.configuration',
    group: 'Configuration',
    titleKey: 'assessmentDashboard.workspace.cards.settings.title',
    descriptionKey: 'assessmentDashboard.workspace.cards.settings.description',
    title: 'Settings',
    description: 'Maintain thresholds, ratings, and operational defaults.',
    routeName: PRESCHOOL_ASSESSMENT_ROUTE_NAMES.settings,
    iconClass: 'pi pi-cog',
  },
]

export const PRESCHOOL_ASSESSMENT_RATING_OPTIONS = [
  { label: 'Excellent', labelKey: 'assessmentSettings.ratingScale.excellent', value: 'Excellent', scoreMin: 80, scoreMax: 100, riskLevel: 'excellent' },
  { label: 'Good', labelKey: 'assessmentSettings.ratingScale.good', value: 'Good', scoreMin: 70, scoreMax: 79, riskLevel: 'good' },
  { label: 'Fair', labelKey: 'assessmentSettings.ratingScale.fair', value: 'Fair', scoreMin: 60, scoreMax: 69, riskLevel: 'fair' },
  { label: 'Needs Improvement', labelKey: 'assessmentSettings.ratingScale.needsImprovement', value: 'Needs Improvement', scoreMin: 0, scoreMax: 59, riskLevel: 'at-risk' },
]

export const PRESCHOOL_ASSESSMENT_STATUS_OPTIONS = [
  { label: 'All Statuses', labelKey: 'assessmentList.filters.status.all', value: 'all' },
  { label: 'Draft', labelKey: 'assessmentList.filters.status.draft', value: 'draft' },
  { label: 'Finalized', labelKey: 'assessmentList.filters.status.finalized', value: 'finalized' },
]

export const PRESCHOOL_ASSESSMENT_PERIOD_OPTIONS = [
  { label: 'All Periods', labelKey: 'assessmentList.filters.period.all', value: null },
  { label: 'Q1', labelKey: 'assessmentList.filters.period.q1', value: 'Q1' },
  { label: 'Q2', labelKey: 'assessmentList.filters.period.q2', value: 'Q2' },
  { label: 'Q3', labelKey: 'assessmentList.filters.period.q3', value: 'Q3' },
  { label: 'Q4', labelKey: 'assessmentList.filters.period.q4', value: 'Q4' },
  { label: 'Midterm', labelKey: 'assessmentList.filters.period.midterm', value: 'Midterm' },
  { label: 'Final', labelKey: 'assessmentList.filters.period.final', value: 'Final' },
]

export const PRESCHOOL_ASSESSMENT_DEFAULT_FILTERS = {
  studentId: null,
  classId: null,
  categoryId: null,
  periodLabel: null,
  status: 'all',
  searchQuery: '',
  dateFrom: null,
  dateTo: null,
}

export const PRESCHOOL_ASSESSMENT_DEFAULT_FORM = {
  classId: null,
  categoryId: null,
  periodLabel: null,
  assessmentDate: null,
  score: null,
  rating: null,
  observation: '',
  teacherComment: '',
}
