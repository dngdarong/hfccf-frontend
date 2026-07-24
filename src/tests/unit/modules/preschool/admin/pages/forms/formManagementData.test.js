import { describe, expect, it } from 'vitest'
import {
  FORM_MANAGEMENT_MANAGE_CARD_DEFINITIONS,
  FORM_MANAGEMENT_ROUTE_NAMES,
  groupFormManagementActionCards,
} from '@/modules/preschool/admin/pages/forms/formManagementData'

describe('preschool form management config', () => {
  it('keeps the route names stable for the form management launcher', () => {
    expect(FORM_MANAGEMENT_ROUTE_NAMES.dashboard).toBe('dashboard-preschool-admin-forms')
    expect(FORM_MANAGEMENT_ROUTE_NAMES.manage).toBe('dashboard-preschool-admin-forms-manage')
    expect(FORM_MANAGEMENT_ROUTE_NAMES.build).toBe('dashboard-preschool-admin-forms-build')
    expect(FORM_MANAGEMENT_ROUTE_NAMES.review).toBe('dashboard-preschool-admin-forms-review')
    expect(FORM_MANAGEMENT_ROUTE_NAMES.reports).toBe('preschool-assessment-reports')
    expect(FORM_MANAGEMENT_ROUTE_NAMES.auditLog).toBe('dashboard-preschool-admin-lifecycle-audit')
  })

  it('groups the static manage-page cards without duplicating route logic', () => {
    const grouped = groupFormManagementActionCards()

    expect(grouped.manage.map((card) => card.key)).toEqual(['forms', 'audit-logs'])
    expect(grouped.build.map((card) => card.routeName)).toEqual([
      FORM_MANAGEMENT_ROUTE_NAMES.build,
      FORM_MANAGEMENT_ROUTE_NAMES.build,
      FORM_MANAGEMENT_ROUTE_NAMES.build,
      FORM_MANAGEMENT_ROUTE_NAMES.build,
    ])
    expect(grouped.review.map((card) => card.routeName)).toEqual([
      FORM_MANAGEMENT_ROUTE_NAMES.review,
      FORM_MANAGEMENT_ROUTE_NAMES.reports,
    ])
    expect(grouped.overview.map((card) => card.routeName)).toEqual([
      FORM_MANAGEMENT_ROUTE_NAMES.dashboard,
    ])
    expect(FORM_MANAGEMENT_MANAGE_CARD_DEFINITIONS.every((card) => card.titleKey)).toBe(true)
    expect(FORM_MANAGEMENT_MANAGE_CARD_DEFINITIONS.every((card) => card.descriptionKey)).toBe(true)
  })
})
