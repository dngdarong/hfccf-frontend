import { describe, expect, it } from 'vitest'
import router from '@/router'
import { buildSidebarSections } from '@/components/navigation/sidebarNavigation'
import { canAccessRoute } from '@/services/accessControl'
import mainSidebar from '@/data/sidebar/main.json'
import preschoolSidebar from '@/data/sidebar/preschool.json'
import { makeAdminPreschool, makeSuperAdmin, makeTeacherPreschool } from '@/tests/helpers/factories'

const t = (key) => key
const sidebarConfig = {
  sections: [...mainSidebar.sections, ...preschoolSidebar.sections],
}

function buildFor(user) {
  return buildSidebarSections({ config: sidebarConfig, router, user, t })
}

describe('preschool teacher attendance navigation', () => {
  it('shows attendance in the teacher workspace and resolves to the teacher route', () => {
    const sections = buildFor(makeTeacherPreschool())
    const routeNames = sections.flatMap((section) => section.items.map((item) => item.routeName))
    const teacherAttendanceRoute = router.resolve({ name: 'dashboard-preschool-teacher-attendance' })

    expect(routeNames).toContain('dashboard-preschool-teacher-attendance')
    expect(canAccessRoute(makeTeacherPreschool(), teacherAttendanceRoute)).toBe(true)
    expect(canAccessRoute(makeAdminPreschool(), teacherAttendanceRoute)).toBe(false)
    expect(canAccessRoute(makeSuperAdmin(), teacherAttendanceRoute)).toBe(true)
  })

  it('keeps teacher attendance out of the Preschool admin sidebar', () => {
    const sections = buildFor(makeAdminPreschool())
    const preschoolSection = sections.find((section) => section.id === 'preschool')
    const routeNames = preschoolSection.items.map((item) => item.routeName)

    expect(routeNames).not.toContain('dashboard-preschool-teacher-attendance')
  })

  it('does not expose teacher attendance to super-admin users through the staff sidebar', () => {
    const sections = buildFor(makeSuperAdmin())
    const routeNames = sections.flatMap((section) => section.items.map((item) => item.routeName))

    expect(routeNames).not.toContain('dashboard-preschool-teacher-attendance')
  })
})
