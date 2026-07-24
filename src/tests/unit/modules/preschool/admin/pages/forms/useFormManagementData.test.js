import { describe, expect, it, vi } from 'vitest'

let currentLocale = {}

function readPath(source, path) {
  return path.split('.').reduce((carry, key) => carry?.[key], source)
}

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    t: (key) => readPath(currentLocale, key),
    te: (key) => readPath(currentLocale, key) !== undefined,
  }),
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

import { useFormManagementData } from '@/modules/preschool/admin/pages/forms/form-management/composables/useFormManagementData'
import enPreschool from '@/i18n/en/preschool'
import khPreschool from '@/i18n/kh/preschool'

describe('useFormManagementData', () => {
  it('returns localized launcher data with stable section shapes', () => {
    currentLocale = enPreschool
    const data = useFormManagementData()

    expect(data.hero.value.title).toBe(enPreschool.preschoolScaffold.formManagement.title)
    expect(data.hero.value.quickLinks.map((link) => link.label)).toEqual([
      enPreschool.preschoolScaffold.formManagement.cards.newForm.title,
      enPreschool.preschoolScaffold.formManagement.cards.forms.title,
      enPreschool.preschoolScaffold.formManagement.pages.review.title,
    ])
    expect(data.overviewMetrics.value).toHaveLength(5)
    expect(data.quickActions.value).toHaveLength(3)
    expect(data.workflowSteps.value).toHaveLength(4)
    expect(data.resourceLinks.value).toHaveLength(2)

    expect(data.resourceLinks.value.map((link) => link.to.name)).toEqual([
      'preschool-assessment-reports',
      'dashboard-preschool-admin-lifecycle-audit',
    ])
  })

  it('keeps the translated labels available in Khmer', () => {
    currentLocale = khPreschool
    const data = useFormManagementData()

    expect(data.hero.value.eyebrow).toBe(khPreschool.preschoolScaffold.formManagement.eyebrow)
    expect(data.sectionHeaders.value.workflow.title).toBe(
      khPreschool.preschoolScaffold.formManagement.pages.workflow.title,
    )
    expect(data.quickActions.value[0].title).toBe(khPreschool.preschoolScaffold.formManagement.pages.manage.title)
  })
})
