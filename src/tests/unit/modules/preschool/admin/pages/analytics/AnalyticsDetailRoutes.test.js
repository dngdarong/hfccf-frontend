import { describe, expect, test } from 'vitest'
import * as enAnalyticsModule from '@/i18n/en/preschool/analytics'
import * as khAnalyticsModule from '@/i18n/kh/preschool/analytics'
import * as detailConfigsModule from '@/modules/preschool/admin/pages/analytics/detail/configs'

const detailConfigs =
  detailConfigsModule.preschoolAnalyticsDetailConfigs ??
  detailConfigsModule.default ??
  detailConfigsModule

const expectedLocaleKeys = [
  'viewDetails',
  'drillDown',
  'backToAnalytics',
  'filteredBy',
  'appliedFilters',
  'clearFilters',
  'compareMode',
  'comparisonUnavailable',
  'savedFilters',
  'today',
  'thisWeek',
  'thisMonth',
  'currentAcademicYear',
  'attendanceDetail',
  'sessionDetail',
  'alertDetail',
  'studentDetail',
  'teacherDetail',
  'guardianContactDetail',
  'openDetail',
  'noDrillDownAvailable',
  'trend',
  'breakdown',
  'dataset',
  'noDetailData',
  'noTrendData',
  'noBreakdownData',
  'noDatasetRows',
  'byClass',
  'byTeacher',
  'byStudent',
  'byStatus',
  'bySeverity',
  'byMethod',
  'byReason',
]

function getLocaleValue(localeModule, key) {
  return (
    localeModule?.[key] ??
    localeModule?.preschoolAnalyticsPage?.[key] ??
    localeModule?.default?.[key] ??
    localeModule?.default?.preschoolAnalyticsPage?.[key]
  )
}

describe('preschool analytics drill-down configs', () => {
  test('exports drill-down configs for each detail page', () => {
    for (const key of [
      'attendance',
      'sessions',
      'alerts',
      'students',
      'teachers',
      'guardianContacts',
    ]) {
      expect(detailConfigs[key]).toBeDefined()
      expect(detailConfigs[key].backRouteName).toBe('dashboard-preschool-admin-analytics')
    }
  })
})

describe('preschool analytics drill-down locales', () => {
  test.each(expectedLocaleKeys)('keeps EN/KH parity for %s', (key) => {
    expect(getLocaleValue(enAnalyticsModule, key)).toBeDefined()
    expect(getLocaleValue(khAnalyticsModule, key)).toBeDefined()
  })
})
