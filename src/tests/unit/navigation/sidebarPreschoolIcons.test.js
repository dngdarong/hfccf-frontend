import { describe, expect, it } from 'vitest'
import mainSidebar from '@/data/sidebar/main.json'
import preschoolSidebar from '@/data/sidebar/preschool.json'
import superAdminSidebar from '@/data/sidebar/super-admin.json'
import {
  IconBooks,
  IconCalendarEvent,
  IconChalkboardTeacher,
  IconClipboardCheck,
  IconClipboardList,
  IconLayoutDashboard,
  IconReceipt2,
  IconReportAnalytics,
  IconSettings as IconSettingsOutline,
  IconShieldCheck,
  IconStethoscope,
} from '@tabler/icons-vue'
import {
  resolvePreschoolSidebarIconComponent,
} from '@/components/navigation/sidebarIcons'

function collectItems(sidebar) {
  return (sidebar.sections || []).flatMap((section) => section.items || [])
}

function componentSignature(component) {
  return String(component)
}

describe('preschool sidebar icons', () => {
  it('resolves a semantic icon component for every Preschool navigation entry', () => {
    const items = [
      ...collectItems(mainSidebar),
      ...collectItems(preschoolSidebar),
      ...collectItems(superAdminSidebar),
    ].filter((item) => `${item.id || ''} ${item.routeName || ''}`.includes('preschool'))

    const exactExpectations = new Map([
      ['preschool-dashboard', IconLayoutDashboard],
      ['dashboard-preschool-admin', IconLayoutDashboard],
      ['dashboard-preschool-teacher-schedule', IconCalendarEvent],
      ['dashboard-preschool-teacher-attendance', IconClipboardCheck],
      ['dashboard-preschool-admin-users', IconChalkboardTeacher],
      ['dashboard-preschool-admin-attendance', IconClipboardCheck],
      ['dashboard-preschool-admin-payment', IconReceipt2],
      ['dashboard-preschool-admin-health', IconStethoscope],
      ['dashboard-preschool-admin-classroom-resources', IconBooks],
      ['dashboard-preschool-admin-reports', IconReportAnalytics],
      ['dashboard-preschool-admin-settings', IconSettingsOutline],
      ['dashboard-preschool-admin-governance-review', IconShieldCheck],
      ['dashboard-super-admin-command-center-preschool-analytics', IconReportAnalytics],
      ['command-center-preschool-analytics', IconReportAnalytics],
      ['preschool-assessment-dashboard', IconClipboardList],
      ['dashboard-preschool-assessments', IconClipboardList],
    ])

    items.forEach((item) => {
      const resolved = resolvePreschoolSidebarIconComponent(item)
      expect(resolved, `expected icon for ${item.id || item.routeName || ''}`).not.toBeNull()

      const expectedComponent = exactExpectations.get(item.id || item.routeName || '')
      if (expectedComponent) {
        expect(componentSignature(resolved)).toBe(componentSignature(expectedComponent))
      }
    })
  })
})
