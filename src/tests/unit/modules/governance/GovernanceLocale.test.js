import { describe, expect, it } from 'vitest'
import enGovernance from '@/i18n/en/governance.js'
import khGovernance from '@/i18n/kh/governance.js'

function expectString(source, path) {
  const value = path.split('.').reduce((carry, key) => carry?.[key], source)
  expect(typeof value).toBe('string')
  expect(value).not.toContain('<')
  expect(value).not.toMatch(/[\u00c2\u00c3\u00e1\u017e\uFFFD]/u)
}

describe('governance locale parity', () => {
  it('keeps the governance labels aligned in EN and KH', () => {
    const keys = [
      'governance.pageTitle',
      'governance.pageSubtitle',
      'governance.dashboard.pageTitle',
      'governance.dashboard.summaryTitle',
      'governance.dashboard.cards.security.title',
      'governance.dashboard.cards.audit.title',
      'governance.dashboard.cards.risk.title',
      'governance.dashboard.cards.configuration.title',
      'governance.audit.pageTitle',
      'governance.audit.timelineTitle',
      'governance.security.pageTitle',
      'governance.security.fields.user',
      'governance.configuration.pageTitle',
      'governance.risk.pageTitle',
      'governance.risk.atRiskStudentsTitle',
      'governance.investigations.pageTitle',
      'governance.filters.dateFrom',
      'governance.filters.eventType',
      'governance.exportActions.csv',
      'governance.statuses.open',
      'governance.statuses.resolved',
      'governance.labels.before',
      'governance.labels.after',
    ]

    keys.forEach((key) => {
      expectString(enGovernance, key)
      expectString(khGovernance, key)
    })
  })
})
