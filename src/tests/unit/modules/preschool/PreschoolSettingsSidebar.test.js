import { describe, expect, it } from 'vitest'
import router from '@/router'
import { buildSidebarSections } from '@/components/navigation/sidebarNavigation'
import mainSidebar from '@/data/sidebar/main.json'
import preschoolSidebar from '@/data/sidebar/preschool.json'
import { makeAdminPreschool, makeSuperAdmin, makeTeacherPreschool } from '@/tests/helpers/factories'

// Keep the sidebar contract covered so the new Preschool settings entry stays
// reachable for admins and hidden from teacher-only workspaces.
const t = (key) => key
const sidebarConfig = {
  sections: [...mainSidebar.sections, ...preschoolSidebar.sections],
}

function buildFor(user) {
  return buildSidebarSections({ config: sidebarConfig, router, user, t })
}

describe('preschool settings sidebar', () => {
  it('shows the settings route for Preschool admins', () => {
    const sections = buildFor(makeAdminPreschool())
    const routeNames = sections.flatMap((section) => section.items.map((item) => item.routeName))

    expect(routeNames).toContain('dashboard-preschool-admin-settings')
    expect(routeNames).toContain('dashboard-preschool-admin-invoices')
  })

  it('shows the settings route in the super-admin Preschool section', () => {
    const sections = buildFor(makeSuperAdmin())
    const preschoolSection = sections.find((section) => section.id === 'preschool')
    const routeNames = preschoolSection.items.map((item) => item.routeName)

    expect(routeNames).toContain('dashboard-preschool-admin-settings')
    expect(routeNames).toContain('dashboard-preschool-admin-invoices')
  })

  it('keeps the settings route out of the teacher workspace', () => {
    const sections = buildFor(makeTeacherPreschool())
    const routeNames = sections.flatMap((section) => section.items.map((item) => item.routeName))

    expect(routeNames).not.toContain('dashboard-preschool-admin-settings')
  })

  it('hides the enrollments route from the Preschool sidebar', () => {
    const preschoolSection = preschoolSidebar.sections.find((section) => section.id === 'preschool')
    const routeNames = preschoolSection.items.map((item) => item.routeName)

    expect(routeNames).not.toContain('dashboard-preschool-admin-enrollments')
  })

  it('hides the forms route from the built Preschool sidebar', () => {
    const sections = buildFor(makeAdminPreschool())
    const routeNames = sections.flatMap((section) => section.items.map((item) => item.routeName))

    expect(routeNames).not.toContain('dashboard-preschool-admin-forms')
  })
})
