import { beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({
    t: (key) => key,
  }),
}))

import { useDashboardActions } from '@/modules/preschool/admin/pages/dashboard/composables/useDashboardActions'

beforeEach(() => {
  push.mockReset()
})

describe('useDashboardActions', () => {
  it('keeps the preschool dashboard shortcuts free of the enrollments page', () => {
    const actions = useDashboardActions()

    expect(actions.shortcutActions.value).toHaveLength(3)
    expect(actions.shortcutActions.value.map((item) => item.label)).toEqual([
      'preschoolDashboardPage.operations.shortcuts.schedule',
      'preschoolDashboardPage.operations.shortcuts.reports',
      'preschoolDashboardPage.operations.shortcuts.settings',
    ])
    expect(actions.shortcutActions.value.map((item) => item.label)).not.toContain(
      'preschoolDashboardPage.operations.shortcuts.enrollments',
    )
  })
})
