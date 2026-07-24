import { describe, expect, it } from 'vitest'
import { formatOperationsDateTime } from '@/modules/preschool/admin/pages/operations/composables/useOperationsDateTime'

describe('formatOperationsDateTime', () => {
  it('formats timestamps without leaking the raw ISO string', () => {
    const rawTimestamp = '2026-07-02T10:00:00Z'

    const enLabel = formatOperationsDateTime(rawTimestamp, 'EN')
    const khLabel = formatOperationsDateTime(rawTimestamp, 'KH')

    expect(enLabel).not.toBe(rawTimestamp)
    expect(khLabel).not.toBe(rawTimestamp)
    expect(enLabel).not.toBe('—')
    expect(khLabel).not.toBe('—')
  })

  it('handles empty and invalid timestamps gracefully', () => {
    expect(formatOperationsDateTime('')).toBe('—')
    expect(formatOperationsDateTime(null)).toBe('—')
    expect(formatOperationsDateTime(undefined)).toBe('—')
    expect(formatOperationsDateTime('not-a-date')).toBe('—')
  })
})
