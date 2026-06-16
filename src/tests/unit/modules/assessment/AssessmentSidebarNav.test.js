import { describe, expect, it } from 'vitest'
import router from '@/router'
import { buildSidebarSections } from '@/components/navigation/sidebarNavigation'
import preschoolSidebar from '@/data/sidebar/preschool.json'
import { makeAdminPreschool, makeTeacherPreschool } from '../../../helpers/factories'

const t = (key) => key

function getSections(user) {
  return buildSidebarSections({ config: preschoolSidebar, router, user, t })
}

describe('assessment sidebar navigation', () => {
  it('preschool admin sees the assessment section', () => {
    const sections = getSections(makeAdminPreschool())
    const assessmentSection = sections.find((s) => s.id === 'assessment')
    expect(assessmentSection).toBeDefined()
  })

  it('assessment section has dashboard, forms, submissions, wizard, reports, audit-logs', () => {
    const sections = getSections(makeAdminPreschool())
    const assessmentSection = sections.find((s) => s.id === 'assessment')
    const itemIds = assessmentSection?.items.map((i) => i.id) ?? []
    expect(itemIds).toContain('assessment-dashboard')
    expect(itemIds).toContain('assessment-forms')
    expect(itemIds).toContain('assessment-submissions')
    expect(itemIds).toContain('assessment-wizard')
    expect(itemIds).toContain('assessment-reports')
    expect(itemIds).toContain('assessment-audit-logs')
  })

  it('assessment section routes have no dynamic parameters', () => {
    const sections = getSections(makeAdminPreschool())
    const assessmentSection = sections.find((s) => s.id === 'assessment')
    const paths = assessmentSection?.items.map((i) => i.routePath) ?? []
    expect(paths.every((p) => !p.includes(':'))).toBe(true)
  })

  it('teacher does not see assessment admin-only items via the preschool sidebar', () => {
    const sections = getSections(makeTeacherPreschool())
    // Teacher scope is 'staff', assessment section requires 'admin' — should be absent
    const assessmentSection = sections.find((s) => s.id === 'assessment')
    expect(assessmentSection).toBeUndefined()
  })

  it('preschool admin does not see removed guardian nav items', () => {
    const sections = getSections(makeAdminPreschool())
    const allItemIds = sections.flatMap((s) => s.items.map((i) => i.id))
    expect(allItemIds).not.toContain('preschool-guardians')
    expect(allItemIds).not.toContain('preschool-guardian-integrity')
    expect(allItemIds).not.toContain('preschool-student-guardians')
    expect(allItemIds).not.toContain('preschool-emergency-contacts')
  })
})
