import dashboard from './dashboard'
import classes from './classes'
import students from './students'
import payments from './payments'
import health from './health'
import communications from './communications'
import scaffold from './scaffold'
import attendance from './attendance'
import adminDashboard from './admin-dashboard'
import assessment from './assessment'
import progress from './progress'
import reports from './reports'
import schedules from './schedules'
import settings from './settings'
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

export default {
  // Keep Preschool copy split by concern so real pages can resolve stable keys
  // and scaffold-only routes can stay explicit without pretending they are built.
  ...dashboard,
  ...classes,
  ...students,
  ...payments,
  ...health,
  ...communications,
  ...scaffold,
  ...attendance,
  ...adminDashboard,
  ...assessment,
  ...progress,
  ...reports,
  ...schedules,
  ...settings,
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
}
