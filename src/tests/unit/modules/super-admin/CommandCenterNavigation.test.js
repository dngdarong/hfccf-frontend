import { describe, expect, it } from 'vitest'
import router from '@/router'
import { canAccessRoute } from '@/services/accessControl'
import { buildSidebarSections } from '@/components/navigation/sidebarNavigation'
import mainSidebar from '@/data/sidebar/main.json'
import preschoolSidebar from '@/data/sidebar/preschool.json'
import superAdminSidebar from '@/data/sidebar/super-admin.json'
import { superAdminRoutes } from '@/modules/super-admin/routes'
import { makeAdminPreschool, makeSuperAdmin, makeTeacherPreschool } from '@/tests/helpers/factories'

const t = (key) => key
const sidebarConfig = {
  sections: [...mainSidebar.sections, ...superAdminSidebar.sections, ...preschoolSidebar.sections],
}

function buildFor(user) {
  return buildSidebarSections({ config: sidebarConfig, router, user, t })
}

describe('super-admin command center navigation', () => {
  it('registers command center routes and exposes them only to super admins', () => {
    expect(
      superAdminRoutes.some(
        (route) => route.name === 'dashboard-super-admin-command-center-executive-operations'
          && route.path === '/module/super-admin/command-center/executive-operations',
      ),
    ).toBe(true)

    expect(
      superAdminRoutes.some(
        (route) => route.name === 'dashboard-super-admin-command-center-workflow-approvals'
          && route.path === '/module/super-admin/command-center/workflow-approvals',
      ),
    ).toBe(true)

    expect(
      superAdminRoutes.some(
        (route) => route.name === 'dashboard-super-admin-command-center-preschool-analytics'
          && route.path === '/module/super-admin/command-center/preschool-analytics',
      ),
    ).toBe(true)

    const superAdminSections = buildFor(makeSuperAdmin())
    const commandCenterSection = superAdminSections.find((section) => section.id === 'command-center')
    const commandCenterRouteNames = commandCenterSection.items.map((item) => item.routeName)

    expect(commandCenterRouteNames).toContain('dashboard-super-admin-command-center-executive-operations')
    expect(commandCenterRouteNames).toContain('dashboard-super-admin-command-center-workflow-approvals')
    expect(commandCenterRouteNames).toContain('dashboard-super-admin-command-center-preschool-analytics')
    expect(commandCenterRouteNames).toContain('dashboard-super-admin-users-manage')

    const preschoolSection = superAdminSections.find((section) => section.id === 'preschool')
    const preschoolRouteNames = preschoolSection.items.map((item) => item.routeName)
    expect(preschoolRouteNames).not.toContain('dashboard-preschool-admin-operations')
    expect(preschoolRouteNames).not.toContain('dashboard-preschool-admin-workflows')
    expect(preschoolRouteNames).not.toContain('dashboard-preschool-admin-analytics')

    const adminSections = buildFor(makeAdminPreschool())
    expect(adminSections.map((section) => section.id)).not.toContain('command-center')
    expect(adminSections.flatMap((section) => section.items.map((item) => item.routeName))).not.toContain('dashboard-super-admin-command-center-preschool-analytics')

    const teacherSections = buildFor(makeTeacherPreschool())
    expect(teacherSections.map((section) => section.id)).not.toContain('command-center')
    expect(teacherSections.flatMap((section) => section.items.map((item) => item.routeName))).not.toContain('dashboard-super-admin-command-center-preschool-analytics')

    const executiveRoute = router.resolve({ name: 'dashboard-super-admin-command-center-executive-operations' })
    const workflowRoute = router.resolve({ name: 'dashboard-super-admin-command-center-workflow-approvals' })
    const preschoolAnalyticsRoute = router.resolve({ name: 'dashboard-super-admin-command-center-preschool-analytics' })

    expect(canAccessRoute(makeSuperAdmin(), executiveRoute)).toBe(true)
    expect(canAccessRoute(makeSuperAdmin(), workflowRoute)).toBe(true)
    expect(canAccessRoute(makeSuperAdmin(), preschoolAnalyticsRoute)).toBe(true)
    expect(canAccessRoute(makeAdminPreschool(), executiveRoute)).toBe(false)
    expect(canAccessRoute(makeAdminPreschool(), workflowRoute)).toBe(false)
    expect(canAccessRoute(makeAdminPreschool(), preschoolAnalyticsRoute)).toBe(false)
    expect(canAccessRoute(makeTeacherPreschool(), executiveRoute)).toBe(false)
    expect(canAccessRoute(makeTeacherPreschool(), workflowRoute)).toBe(false)
    expect(canAccessRoute(makeTeacherPreschool(), preschoolAnalyticsRoute)).toBe(false)
  })
})
