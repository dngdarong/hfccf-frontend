import { beforeEach, describe, expect, it, vi } from 'vitest'

const push = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

import { useFormManagementActions } from '@/modules/preschool/admin/pages/forms/form-management/composables/useFormManagementActions'

beforeEach(() => {
  push.mockReset()
})

describe('useFormManagementActions', () => {
  it('pushes the expected route names', () => {
    const actions = useFormManagementActions()

    actions.goToManageTemplates()
    actions.goToBuildForm()
    actions.goToReviewForms()
    actions.goToReports()
    actions.goToAuditLog()

    expect(push).toHaveBeenNthCalledWith(1, { name: 'dashboard-preschool-admin-forms-manage', query: {} })
    expect(push).toHaveBeenNthCalledWith(2, { name: 'dashboard-preschool-admin-forms-build', query: {} })
    expect(push).toHaveBeenNthCalledWith(3, { name: 'dashboard-preschool-admin-forms-review', query: {} })
    expect(push).toHaveBeenNthCalledWith(4, { name: 'preschool-assessment-reports', query: {} })
    expect(push).toHaveBeenNthCalledWith(5, { name: 'dashboard-preschool-admin-lifecycle-audit', query: {} })
  })
})
