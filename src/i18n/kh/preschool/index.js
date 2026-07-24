import dashboard from './dashboard'
import dashboardCleanup from './dashboard.cleanup'
import classes from './classes'
import students from './students'
import payments from './payments'
import health from './health'
import communications from './communications'
import scaffold from './scaffold'
import attendance from './attendance'
import adminDashboard from './admin-dashboard'
import progress from './progress'
import reports from './reports'
import analytics from './analytics'
import operations from './operations'
import schedules from './schedules'
import settings from './settings'
import settingsBackbone from './settings.backbone'
import lifecycle from './lifecycle'
import lifecycleAudit from './lifecycle-audit'
import lifecycleAnalytics from './lifecycle-analytics'
import classroomResources from './classroom-resources'
import assignments from './assignments'
import reportSnapshots from './report-snapshots'
import snapshotArchive from './snapshot-archive'
import exportGovernance from './export-governance'
import governance from './governance'
import governanceDiff from './governance-diff'
import governanceCases from './governance-cases'
import enrollment from './enrollment'
import reviewWorkflow from './review-workflow'
import notifications from './notifications'
import workflows from './workflows'
import gradeEntry from './grade-entry'
import teacher from './teacher'

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function mergeDeep(base, overrides) {
  if (Array.isArray(base) && Array.isArray(overrides)) {
    return overrides.map((item) => (isPlainObject(item) ? mergeDeep({}, item) : item))
  }

  if (!isPlainObject(base) || !isPlainObject(overrides)) {
    return overrides === undefined ? base : overrides
  }

  const output = { ...base }

  for (const [key, value] of Object.entries(overrides)) {
    output[key] = mergeDeep(base[key], value)
  }

  return output
}

export default {
  // Keep Preschool copy split by concern so real pages can resolve stable keys
  // and scaffold-only routes can stay explicit without pretending they are built.
  ...dashboard,
  preschoolDashboardPage: {
    ...dashboard.preschoolDashboardPage,
    ...dashboardCleanup.preschoolDashboardPage,
  },
  preschoolDashboardActivity: {
    ...dashboard.preschoolDashboardActivity,
    ...dashboardCleanup.preschoolDashboardActivity,
  },
  preschoolDashboardSpotlight: {
    ...dashboard.preschoolDashboardSpotlight,
    ...dashboardCleanup.preschoolDashboardSpotlight,
  },
  ...classes,
  ...students,
  ...payments,
  ...health,
  ...communications,
  ...scaffold,
  ...attendance,
  ...adminDashboard,
  ...progress,
  ...reports,
  ...analytics,
  ...operations,
  ...schedules,
  ...settings,
  preschoolSettingsPage: mergeDeep(settings.preschoolSettingsPage, settingsBackbone.preschoolSettingsPage),
  ...lifecycle,
  ...lifecycleAudit,
  ...lifecycleAnalytics,
  ...classroomResources,
  ...assignments,
  ...reportSnapshots,
  ...snapshotArchive,
  ...exportGovernance,
  ...governance,
  ...governanceDiff,
  ...governanceCases,
  ...enrollment,
  ...reviewWorkflow,
  ...notifications,
  ...workflows,
  ...gradeEntry,
  ...teacher,
}
