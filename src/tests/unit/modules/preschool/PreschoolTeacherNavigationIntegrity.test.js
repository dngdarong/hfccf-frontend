import { describe, expect, it } from 'vitest'
import router from '@/router'
import { buildSidebarSections } from '@/components/navigation/sidebarNavigation'
import mainSidebar from '@/data/sidebar/main.json'
import preschoolSidebar from '@/data/sidebar/preschool.json'
import { makeAdminPreschool, makeTeacherPreschool } from '@/tests/helpers/factories'

const t = (key) => key
const sidebarConfig = {
  sections: [...mainSidebar.sections, ...preschoolSidebar.sections],
}

function buildFor(user) {
  return buildSidebarSections({ config: sidebarConfig, router, user, t })
}

describe('preschool teacher navigation integrity', () => {
  it('keeps teacher-visible sidebar routes registered and removes dead teacher links', () => {
    const sections = buildFor(makeTeacherPreschool())
    const routeNames = sections.flatMap((section) => section.items.map((item) => item.routeName))

    expect(routeNames).toContain('dashboard-preschool-teacher')
    expect(routeNames).toContain('dashboard-preschool-teacher-students')
    expect(routeNames).toContain('dashboard-preschool-teacher-schedule')
    expect(routeNames).toContain('dashboard-preschool-teacher-attendance')
    expect(routeNames).toContain('dashboard-preschool-teacher-report')
    expect(routeNames).toContain('dashboard-preschool-teacher-healthy')
    expect(routeNames).not.toContain('dashboard-preschool-teacher-emergency-contacts')
    expect(routeNames).not.toContain('dashboard-preschool-assessments')
    expect(routeNames).not.toContain('dashboard-preschool-admin-settings')

    routeNames.forEach((routeName) => {
      expect(router.hasRoute(routeName)).toBe(true)
    })
  })

  it('keeps admin-only Preschool navigation out of the teacher workspace', () => {
    const sections = buildFor(makeTeacherPreschool())
    const routeNames = sections.flatMap((section) => section.items.map((item) => item.routeName))

    expect(routeNames).not.toContain('dashboard-preschool-admin-classroom-resources')
    expect(routeNames).not.toContain('dashboard-preschool-admin-settings')
    expect(routeNames).not.toContain('dashboard-preschool-admin-assignments')
    expect(routeNames).not.toContain('dashboard-preschool-admin-payment')
    expect(routeNames).not.toContain('dashboard-preschool-admin-invoices')
  })

  it('keeps teacher routes out of the Preschool admin sidebar', () => {
    const sections = buildFor(makeAdminPreschool())
    const routeNames = sections.flatMap((section) => section.items.map((item) => item.routeName))

    expect(routeNames).not.toContain('dashboard-preschool-teacher')
    expect(routeNames).not.toContain('dashboard-preschool-teacher-attendance')
    expect(routeNames).not.toContain('dashboard-preschool-teacher-emergency-contacts')
  })
})
