import { describe, expect, it } from 'vitest'
import router from '@/router'
import { canAccessRoute } from '@/services/accessControl'
import { buildSidebarSections } from '@/components/navigation/sidebarNavigation'
import mainSidebar from '@/data/sidebar/main.json'
import preschoolSidebar from '@/data/sidebar/preschool.json'
import { preschoolRoutes } from '@/modules/preschool/routes'
import { makeAdminPreschool, makeSuperAdmin, makeTeacherPreschool } from '@/tests/helpers/factories'

const t = (key) => key
const sidebarConfig = {
  sections: [...mainSidebar.sections, ...preschoolSidebar.sections],
}

function buildFor(user) {
  return buildSidebarSections({ config: sidebarConfig, router, user, t })
}

describe('preschool analytics navigation', () => {
  it('keeps the legacy route while removing the Preschool sidebar entry', () => {
    expect(preschoolRoutes.some((route) => route.name === 'dashboard-preschool-admin-analytics' && route.path === '/preschool/analytics')).toBe(true)

    const adminSections = buildFor(makeAdminPreschool())
    const adminRouteNames = adminSections.flatMap((section) => section.items.map((item) => item.routeName))
    expect(adminRouteNames).not.toContain('dashboard-preschool-admin-analytics')

    const teacherSections = buildFor(makeTeacherPreschool())
    const teacherRouteNames = teacherSections.flatMap((section) => section.items.map((item) => item.routeName))
    expect(teacherRouteNames).not.toContain('dashboard-preschool-admin-analytics')

    const legacyRoute = router.resolve({ name: 'dashboard-preschool-admin-analytics' })

    expect(canAccessRoute(makeAdminPreschool(), legacyRoute)).toBe(true)
    expect(canAccessRoute(makeTeacherPreschool(), legacyRoute)).toBe(false)
    expect(canAccessRoute(makeSuperAdmin(), legacyRoute)).toBe(true)
  })
})
