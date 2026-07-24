import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SportAdminReports from '@/modules/sport/admin/pages/reports/SportAdminReports.vue'

const {
  fetchSportDivisions,
  fetchSportTeams,
  fetchSportPlayers,
  fetchSportTournaments,
  fetchSportMatchesReport,
  downloadSportMatchesReportPdf,
  aoaToSheet,
  appendSheet,
  writeFile,
} = vi.hoisted(() => ({
  fetchSportDivisions: vi.fn(),
  fetchSportTeams: vi.fn(),
  fetchSportPlayers: vi.fn(),
  fetchSportTournaments: vi.fn(),
  fetchSportMatchesReport: vi.fn(),
  downloadSportMatchesReportPdf: vi.fn(),
  aoaToSheet: vi.fn((rows) => ({ rows })),
  appendSheet: vi.fn(),
  writeFile: vi.fn(),
}))

vi.mock('@/composables/useLanguage', () => ({
  useLanguage: () => ({ t: (key) => key }),
}))

vi.mock('@/modules/sport/services/sportApi', () => ({
  fetchSportDivisions,
  fetchSportTeams,
  fetchSportPlayers,
  fetchSportMatchesReport,
  downloadSportMatchesReportPdf,
}))

vi.mock('@/modules/sport/services/api/sportTournamentsApi', () => ({ fetchSportTournaments }))

vi.mock('html2pdf.js', () => ({ default: vi.fn() }))

vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({ SheetNames: [], Sheets: {} })),
    aoa_to_sheet: aoaToSheet,
    book_append_sheet: appendSheet,
  },
  writeFile,
}))

const baseStubs = {
  MainLayout: { template: '<div><slot /></div>' },
  HeaderSection: { template: '<div><slot /></div>' },
  Button: { template: '<button><slot /></button>' },
  Select: { template: '<select />' },
  DatePicker: { template: '<input />' },
  Card: { template: '<section><slot name="title" /><slot name="content" /></section>' },
  TabView: { template: '<div><slot /></div>' },
  TabPanel: { template: '<div><slot /></div>' },
  DataTable: { template: '<div><slot /></div>' },
  Column: { template: '<div />' },
}

function mountPage() {
  return mount(SportAdminReports, { global: { stubs: baseStubs } })
}

const canonicalRows = [{
  id: 'qa-match-1',
  homeTeamId: 'qa-home-id',
  awayTeamId: 'qa-away-id',
  tournamentId: 'qa-cup-id',
  homeTeam: 'QA Home',
  awayTeam: 'QA Away',
  tournamentName: 'QA Cup',
  divisionId: 'qa-division-id',
  divisionName: 'QA-U19',
  homeScore: 0,
  awayScore: 2,
  date: '2026-07-05',
  status: 'completed',
}]

beforeEach(() => {
  vi.clearAllMocks()
  fetchSportDivisions.mockResolvedValue({ items: [] })
  fetchSportTeams.mockResolvedValue({ items: [] })
  fetchSportPlayers.mockResolvedValue({ items: [] })
  fetchSportTournaments.mockResolvedValue({ items: [] })
  fetchSportMatchesReport.mockResolvedValue({
    matches: canonicalRows,
    summary: { totalMatches: 1, completedMatches: 1, scheduledMatches: 0, totalTeams: 2 },
  })
  downloadSportMatchesReportPdf.mockResolvedValue({ blob: new Blob(['%PDF-1.4']), filename: 'matches.pdf' })
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:matches')
  globalThis.URL.revokeObjectURL = vi.fn()
  HTMLAnchorElement.prototype.click = vi.fn()
})

describe('SportAdminReports Matches report', () => {
  it('uses canonical API rows for generation and the rendered report', async () => {
    const wrapper = mountPage()
    await flushPromises()
    wrapper.vm.reportType = 'matches'
    wrapper.vm.dateFrom = new Date('2026-07-01T00:00:00Z')
    wrapper.vm.dateTo = new Date('2026-07-31T00:00:00Z')
    wrapper.vm.selectedDivision = 'qa-division-id'
    wrapper.vm.selectedTeam = 'qa-home-id'
    wrapper.vm.selectedTournament = 'qa-cup-id'

    await wrapper.vm.generateReport()
    await flushPromises()

    expect(fetchSportMatchesReport).toHaveBeenCalledWith({
      dateFrom: wrapper.vm.dateFrom,
      dateTo: wrapper.vm.dateTo,
      divisionId: 'qa-division-id',
      teamId: 'qa-home-id',
      tournamentId: 'qa-cup-id',
    })
    expect(wrapper.vm.filteredMatches).toEqual(canonicalRows)
    expect(wrapper.text()).toContain('QA Home')
    expect(wrapper.text()).not.toMatch(/Team A(?:\s|$)/)
    expect(wrapper.text()).not.toMatch(/Team B(?:\s|$)/)
  })

  it('uses the canonical filters for PDF and canonical rows for Excel', async () => {
    const wrapper = mountPage()
    await flushPromises()
    wrapper.vm.reportType = 'matches'
    wrapper.vm.dateFrom = new Date('2026-07-01T00:00:00Z')
    wrapper.vm.dateTo = new Date('2026-07-31T00:00:00Z')
    wrapper.vm.selectedDivision = 'qa-division-id'
    wrapper.vm.selectedTeam = 'qa-home-id'
    wrapper.vm.selectedTournament = 'qa-cup-id'
    await wrapper.vm.generateReport()

    await wrapper.vm.exportReport('pdf')
    expect(downloadSportMatchesReportPdf).toHaveBeenCalledWith(expect.objectContaining({
      dateFrom: wrapper.vm.dateFrom,
      dateTo: wrapper.vm.dateTo,
      divisionId: 'qa-division-id',
      teamId: 'qa-home-id',
      tournamentId: 'qa-cup-id',
    }))

    await wrapper.vm.exportReport('excel')
    const rows = aoaToSheet.mock.calls.at(-1)[0]
    expect(rows[0]).toEqual(['No.', 'Tournament', 'Division', 'Home Team', 'Away Team', 'Score', 'Date', 'Venue', 'Status'])
    expect(rows[1]).toContain('QA Home')
    expect(rows[1]).not.toContain('Team A')
    expect(writeFile).toHaveBeenCalled()
  })
})
