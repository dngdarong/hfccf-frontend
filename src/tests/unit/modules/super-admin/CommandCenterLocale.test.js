import { describe, expect, it } from 'vitest'
import enNav from '@/i18n/en/dashboard/nav'
import khNav from '@/i18n/kh/dashboard/nav'

function expectString(source, path) {
  const value = path.split('.').reduce((carry, key) => carry?.[key], source)
  expect(typeof value).toBe('string')
  expect(value).not.toContain('<')
}

describe('super-admin command center locale parity', () => {
  it('keeps the command center navigation labels aligned in EN and KH', () => {
    expectString(enNav, 'items.executiveOperations')
    expectString(khNav, 'items.executiveOperations')
    expectString(enNav, 'items.workflowApprovals')
    expectString(khNav, 'items.workflowApprovals')
    expectString(enNav, 'items.preschoolAnalytics')
    expectString(khNav, 'items.preschoolAnalytics')
  })
})
