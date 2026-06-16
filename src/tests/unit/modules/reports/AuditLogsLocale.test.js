import { describe, expect, it } from 'vitest'
import enLocale from '@/i18n/en'
import khLocale from '@/i18n/kh'
import enReports from '@/i18n/en/reports/index.js'
import khReports from '@/i18n/kh/reports/index.js'

// Regression coverage for the Audit Logs page contract.
// The page resolves these keys through t('reports.auditLogs.*'), so this test protects
// against accidental flattening, missing imports, or double nesting in the locale merge.
describe('reports.auditLogs locale wiring', () => {
  it('keeps audit logs nested under reports and exposes EN/KH parity', () => {
    expect(enLocale.reports.auditLogs.title).toBe('Audit Logs')
    expect(enLocale.reports.auditLogs.loading).toBe('Loading audit logs...')
    expect(enLocale.reports.auditLogs.actions.matchEventDeleted).toBe('Match event deleted')
    expect(enLocale.reports.auditLogs.actions.tournamentFinalized).toBe('Tournament finalized')
    expect(enLocale.reports.auditLogs.filters.actor).toBe('Actor')
    expect(enLocale.reports.auditLogs.filters.dateFrom).toBe('From date')
    expect(enLocale.reports.auditLogs.filters.dateTo).toBe('To date')
    expect(enLocale.reports.auditLogs.filters.reset).toBe('Reset filters')
    expect(enLocale.reports.auditLogs.empty).toBe('No audit records found')
    expect(enLocale.reports.auditLogs.emptyDescription).toBe('Audit entries appear here once Sport workflows are recorded.')

    expect(khLocale.reports.auditLogs.title).toBe('កំណត់ត្រាសវនកម្ម')
    expect(typeof khLocale.reports.auditLogs.loading).toBe('string')
    expect(typeof khLocale.reports.auditLogs.actions.matchEventDeleted).toBe('string')
    expect(typeof khLocale.reports.auditLogs.actions.matchResultUpdated).toBe('string')
    expect(typeof khLocale.reports.auditLogs.actions.tournamentCreated).toBe('string')
    expect(typeof khLocale.reports.auditLogs.actions.tournamentUpdated).toBe('string')
    expect(typeof khLocale.reports.auditLogs.actions.tournamentFinalized).toBe('string')
    expect(typeof khLocale.reports.auditLogs.filters.actor).toBe('string')
    expect(typeof khLocale.reports.auditLogs.filters.dateFrom).toBe('string')
    expect(typeof khLocale.reports.auditLogs.filters.dateTo).toBe('string')
    expect(typeof khLocale.reports.auditLogs.filters.reset).toBe('string')

    expect(enLocale.auditLogs).toBeUndefined()
    expect(khLocale.auditLogs).toBeUndefined()
    expect(enReports.auditLogs.title).toBe(enLocale.reports.auditLogs.title)
    expect(khReports.auditLogs.title).toBe(khLocale.reports.auditLogs.title)
  })
})
