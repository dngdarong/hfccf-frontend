import HomeIcon from '@/assets/icons/Home.vue'
import CalendarIcon from '@/assets/icons/Calendar.vue'
import AttendanceIcon from '@/assets/icons/Attendance.vue'
import ClassIcon from '@/assets/icons/Class.vue'
import EnrollmentsIcon from '@/assets/icons/Enrollments.vue'
import FormsIcon from '@/assets/icons/Forms.vue'
import GovernanceIcon from '@/assets/icons/Governance.vue'
import HealthIcon from '@/assets/icons/Health.vue'
import InventoryIcon from '@/assets/icons/Inventory.vue'
import PaymentsIcon from '@/assets/icons/Payments.vue'
import PerformanceIcon from '@/assets/icons/Performance.vue'
import NotificationIcon from '@/assets/icons/Notification.vue'
import UsersIcon from '@/assets/icons/Users.vue'
import ReportsIcon from '@/assets/icons/Reports.vue'
import SettingsIcon from '@/assets/icons/Settings.vue'
import TournamentsIcon from '@/assets/icons/Tournaments.vue'
import BallIcon from '@/assets/icons/Ball.vue'
import TeamIcon from '@/assets/icons/Team.vue'
import PlayersIcon from '@/assets/icons/Players.vue'
import {
  IconBooks,
  IconCalendarEvent,
  IconChalkboard,
  IconChalkboardTeacher,
  IconClipboardText,
  IconCalendarTime,
  IconClipboardCheck,
  IconClipboardList,
  IconFileCheck,
  IconFileDescription,
  IconHomeBolt,
  IconLayoutDashboard,
  IconReceipt2,
  IconReportAnalytics,
  IconScoreboard,
  IconShirtSport,
  IconShieldCheck,
  IconSettings as IconSettingsOutline,
  IconPackage,
  IconStethoscope,
  IconTimelineEvent,
  IconTrophy,
  IconUserCheck,
  IconUserCog,
  IconUsers,
  IconUsersGroup,
  IconUsersPlus,
} from '@tabler/icons-vue'

export const sidebarIconByName = {
  home: HomeIcon,
  calendar: CalendarIcon,
  attendance: AttendanceIcon,
  ball: BallIcon,
  class: ClassIcon,
  enrollments: EnrollmentsIcon,
  forms: FormsIcon,
  governance: GovernanceIcon,
  health: HealthIcon,
  inventory: InventoryIcon,
  payments: PaymentsIcon,
  performance: PerformanceIcon,
  notification: NotificationIcon,
  info: UsersIcon,
  users: UsersIcon,
  reports: ReportsIcon,
  settings: SettingsIcon,
  tournaments: TournamentsIcon,
  team: TeamIcon,
  players: PlayersIcon,
  invoice: IconFileDescription,
  'sport-dashboard': IconLayoutDashboard,
  'sport-attendance': IconClipboardCheck,
  'sport-coach': IconUserCog,
  'sport-team': IconUsersGroup,
  'sport-player': IconShirtSport,
  'sport-assignment': IconUsersPlus,
  'sport-match': IconScoreboard,
  'sport-tournament': IconTrophy,
  'sport-player-approval': IconUserCheck,
  'sport-match-approval': IconFileCheck,
  'sport-lifecycle': IconTimelineEvent,
  'sport-equipment': IconPackage,
  'sport-coach-dashboard': IconHomeBolt,
  'sport-coach-training': IconCalendarTime,
  'sport-coach-teams': IconUsersGroup,
  'sport-coach-roster': IconClipboardList,
  'sport-coach-requests': IconFileDescription,
}

const preschoolSidebarIconMap = new Map([
  ['preschool-dashboard', IconLayoutDashboard],
  ['dashboard-preschool-admin', IconLayoutDashboard],
  ['dashboard-preschool-teacher-classes', IconChalkboard],
  ['dashboard-preschool-teacher-students', IconUsers],
  ['dashboard-preschool-teacher-schedule', IconCalendarEvent],
  ['dashboard-preschool-teacher-attendance', IconClipboardCheck],
  ['dashboard-preschool-admin-settings', IconSettingsOutline],
  ['preschool-settings', IconSettingsOutline],
  ['dashboard-preschool-admin-users', IconChalkboardTeacher],
  ['preschool-teachers', IconChalkboardTeacher],
  ['dashboard-preschool-admin-students', IconUsers],
  ['preschool-students', IconUsers],
  ['dashboard-preschool-admin-guardians', IconUsers],
  ['preschool-guardians', IconUsers],
  ['dashboard-preschool-admin-student-guardians', IconUsers],
  ['preschool-student-guardians', IconUsers],
  ['dashboard-preschool-admin-classes', IconChalkboard],
  ['preschool-classes', IconChalkboard],
  ['dashboard-preschool-admin-schedules', IconCalendarEvent],
  ['preschool-schedules', IconCalendarEvent],
  ['dashboard-preschool-admin-attendance', IconClipboardCheck],
  ['preschool-attendance', IconClipboardCheck],
  ['dashboard-preschool-admin-payment', IconReceipt2],
  ['preschool-payments', IconReceipt2],
  ['dashboard-preschool-admin-invoices', IconFileDescription],
  ['preschool-invoices', IconFileDescription],
  ['dashboard-preschool-admin-health', IconStethoscope],
  ['preschool-health-records', IconStethoscope],
  ['dashboard-preschool-admin-classroom-resources', IconBooks],
  ['preschool-classroom-resources', IconBooks],
  ['dashboard-preschool-admin-reports', IconReportAnalytics],
  ['preschool-reports', IconReportAnalytics],
  ['dashboard-preschool-admin-assignments', IconClipboardText],
  ['preschool-assignments', IconClipboardText],
  ['dashboard-preschool-admin-lifecycle-audit', IconTimelineEvent],
  ['preschool-lifecycle-audit', IconTimelineEvent],
  ['dashboard-preschool-admin-report-snapshots', IconReportAnalytics],
  ['preschool-report-snapshots', IconReportAnalytics],
  ['dashboard-preschool-admin-export-governance', IconFileDescription],
  ['preschool-export-governance', IconFileDescription],
  ['dashboard-preschool-admin-governance-review', IconShieldCheck],
  ['preschool-governance-review', IconShieldCheck],
  ['dashboard-preschool-admin-reconstruction', IconFileDescription],
  ['preschool-institutional-reconstruction', IconFileDescription],
  ['dashboard-preschool-admin-governance-diff', IconClipboardList],
  ['preschool-governance-diff', IconClipboardList],
  ['dashboard-preschool-admin-governance-cases', IconClipboardList],
  ['preschool-governance-cases', IconClipboardList],
  ['dashboard-preschool-admin-guardian-integrity', IconShieldCheck],
  ['preschool-guardian-integrity', IconShieldCheck],
  ['dashboard-preschool-teacher-report', IconReportAnalytics],
  ['preschool-teacher-report', IconReportAnalytics],
  ['dashboard-preschool-teacher-healthy', IconStethoscope],
  ['preschool-teacher-healthy', IconStethoscope],
  ['dashboard-preschool-teacher-classroomresources', IconBooks],
  ['preschool-teacher-classroomresources', IconBooks],
  ['dashboard-super-admin-command-center-preschool-analytics', IconReportAnalytics],
  ['command-center-preschool-analytics', IconReportAnalytics],
])

function normalizePreschoolSidebarKey(item) {
  return String(item?.routeName || item?.route_name || item?.id || item?.key || '').toLowerCase()
}

export function resolvePreschoolSidebarIconComponent(item) {
  const key = normalizePreschoolSidebarKey(item)
  if (preschoolSidebarIconMap.has(key)) {
    return preschoolSidebarIconMap.get(key)
  }

  const haystack = `${String(item?.id || '')} ${String(item?.routeName || '')} ${String(item?.labelKey || '')}`.toLowerCase()

  if (haystack.includes('teacher')) return IconChalkboardTeacher
  if (haystack.includes('student') || haystack.includes('guardian') || haystack.includes('users')) return IconUsers
  if (haystack.includes('schedule')) return IconCalendarEvent
  if (haystack.includes('attendance')) return IconClipboardCheck
  if (haystack.includes('assessment') || haystack.includes('report') || haystack.includes('analytics')) return IconReportAnalytics
  if (haystack.includes('settings')) return IconSettingsOutline
  if (haystack.includes('governance') || haystack.includes('integrity')) return IconShieldCheck
  if (haystack.includes('lifecycle') || haystack.includes('timeline') || haystack.includes('audit')) return IconTimelineEvent
  if (haystack.includes('payment')) return IconReceipt2
  if (haystack.includes('health')) return IconStethoscope
  if (haystack.includes('resource')) return IconBooks
  if (haystack.includes('class')) return IconChalkboard
  if (haystack.includes('assignment') || haystack.includes('form')) return IconClipboardText
  if (haystack.includes('dashboard') || haystack.includes('overview')) return IconLayoutDashboard

  return null
}

export function resolveSidebarNavigationIconComponent(item) {
  return resolveSidebarIconComponent(item?.icon) || resolvePreschoolSidebarIconComponent(item)
}

export function resolveSidebarIconComponent(iconKey) {
  return sidebarIconByName[iconKey] || null
}
