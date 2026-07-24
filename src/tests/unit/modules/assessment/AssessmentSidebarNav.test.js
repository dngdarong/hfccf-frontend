import { describe, expect, it } from 'vitest'
import router from '@/router'
import { buildSidebarSections } from '@/components/navigation/sidebarNavigation'
import preschoolSidebar from '@/data/sidebar/preschool.json'
import { makeAdminPreschool, makeTeacherPreschool } from '../../../helpers/factories'

const t = (key) => key

function getSections(user) {
  return buildSidebarSections({ config: preschoolSidebar, router, user, t })
}

describe('preschool assessment sidebar navigation', () => {
  it('preschool admin no longer sees the assessment item in the preschool section', () => {
    const sections = getSections(makeAdminPreschool())
    const preschoolSection = sections.find((s) => s.id === 'preschool')
    expect(preschoolSection).toBeDefined()
    expect(preschoolSection?.items.some((item) => item.id === 'preschool-assessments')).toBe(false)
  })

  it('assessment item is absent from the preschool section', () => {
    const sections = getSections(makeAdminPreschool())
    const preschoolSection = sections.find((s) => s.id === 'preschool')
    const assessmentItem = preschoolSection?.items.find((item) => item.id === 'preschool-assessments')

    expect(assessmentItem).toBeUndefined()
  })

  it('assessment item route no longer appears in the preschool sidebar', () => {
    const sections = getSections(makeAdminPreschool())
    const preschoolSection = sections.find((s) => s.id === 'preschool')
    const assessmentItem = preschoolSection?.items.find((item) => item.id === 'preschool-assessments')
    expect(assessmentItem).toBeUndefined()
  })

  it('teacher does not see assessment admin-only items via the preschool sidebar', () => {
    const sections = getSections(makeTeacherPreschool())
    const preschoolSection = sections.find((s) => s.id === 'preschool')
    expect(preschoolSection).toBeUndefined()
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
