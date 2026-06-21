import { describe, expect, it } from 'vitest'
import { FORM_MANAGEMENT_ACTION_CARDS, groupFormManagementActionCards } from '@/modules/preschool/admin/pages/forms/formManagementData'
import { preschoolRoutes } from '@/modules/preschool/routes'

describe('preschool form management route targets', () => {
  it('points new form actions to the active preschool build route', () => {
    const buildCards = groupFormManagementActionCards().build
    const newFormCard = FORM_MANAGEMENT_ACTION_CARDS.find((card) => card.key === 'new-form')
    const submissionsCard = FORM_MANAGEMENT_ACTION_CARDS.find((card) => card.key === 'submissions')
    const reportsCard = FORM_MANAGEMENT_ACTION_CARDS.find((card) => card.key === 'reports')
    const buildRoute = preschoolRoutes.find((route) => route.name === 'dashboard-preschool-admin-forms-build')
    const reviewRoute = preschoolRoutes.find((route) => route.name === 'dashboard-preschool-admin-forms-review')

    expect(newFormCard?.to?.name).toBe('dashboard-preschool-admin-forms-build')
    expect(buildCards.every((card) => card.to?.name === 'dashboard-preschool-admin-forms-build')).toBe(true)
    expect(submissionsCard?.to?.name).toBe('dashboard-preschool-admin-forms-review')
    expect(reportsCard?.to?.name).toBe('preschool-assessment-reports')
    expect(buildRoute).toBeTruthy()
    expect(buildRoute?.redirect).toBeUndefined()
    expect(typeof buildRoute?.component).toBe('function')
    expect(reviewRoute).toBeTruthy()
    expect(reviewRoute?.redirect).toBeUndefined()
    expect(typeof reviewRoute?.component).toBe('function')
  })
})
