import { describe, expect, it } from 'vitest'
import { formatLifecycleDate } from '@/modules/preschool/admin/pages/settings/utils/preschoolSettingsHelpers'

describe('preschoolSettingsHelpers', () => {
  it('formats date-only values without timezone shifts', () => {
    expect(formatLifecycleDate(new Date(2025, 0, 1))).toBe('2025-01-01')
    expect(formatLifecycleDate(new Date(2025, 11, 31))).toBe('2025-12-31')
  })
})
