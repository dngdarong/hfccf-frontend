import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { mountWithPlugins } from '@/tests/helpers/mount'
import enGovernance from '@/i18n/en/governance.js'
import GovernanceDashboard from '@/modules/governance/pages/GovernanceDashboard.vue'
import { fetchGovernanceDashboard } from '@/modules/governance/services/api/governanceApi'

vi.mock('@/modules/governance/services/api/governanceApi', () => ({
  fetchGovernanceDashboard: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function stubs() {
  return {
    MainLayout: { template: '<div><slot /></div>' },
    HeaderSection: { props: ['title', 'subtitle'], template: '<header><h1>{{ title }}</h1><p>{{ subtitle }}</p></header>' },
    GovernanceSummaryCards: { props: ['cards'], template: '<section><div v-for="card in cards" :key="card.id">{{ card.title }} {{ card.value }}</div><slot /></section>' },
    AuditTimeline: { props: ['items'], template: '<section><div v-for="item in items" :key="item.id">{{ item.title || item.eventType }}</div><slot /></section>' },
    SecurityEventsTable: { props: ['items'], template: '<section><div v-for="item in items" :key="item.id">{{ item.eventType }}</div><slot /></section>' },
    RiskHeatMap: { props: ['items'], template: '<section><div v-for="item in items" :key="item.id">{{ item.label }} {{ item.value }}</div><slot /></section>' },
    ConfigurationDiffViewer: { template: '<section>diff</section>' },
    Button: { props: ['label'], template: '<button>{{ label }}<slot /></button>' },
  }
}

describe('GovernanceDashboard', () => {
  it('renders live dashboard values from the API payload', async () => {
    fetchGovernanceDashboard.mockResolvedValueOnce({
      securitySummary: {
        failedLoginsToday: 3,
        passwordResets: 1,
        activeSecurityEvents: 4,
        criticalEvents: 2,
        recentEvents: [{ id: 'sec-1', eventType: 'failed_login', title: 'Failed login', severityLabel: 'High' }],
      },
      auditSummary: {
        auditEventsToday: 12,
        auditEventsThisMonth: 48,
        topModules: [{ id: 'm1', label: 'Preschool' }],
        recentEvents: [{ id: 'audit-1', title: 'Settings updated', module: 'Preschool', severityLabel: 'Info' }],
      },
      riskSummary: {
        atRiskStudents: 7,
        overduePayments: 5,
        openHealthAlerts: 2,
        openGuardianIssues: 1,
      },
      configurationSummary: {
        changesToday: 2,
        changesThisMonth: 9,
        lastConfigurationUpdate: '2026-06-21 09:15',
        recentChanges: [{ id: 'cfg-1', label: 'Attendance Settings' }],
        previousConfiguration: { lateThresholdMinutes: 15 },
        latestConfiguration: { lateThresholdMinutes: 20 },
      },
    })

    const wrapper = mountWithPlugins(GovernanceDashboard, {
      messages: { en: enGovernance },
      global: { stubs: stubs() },
    })

    await flushPromises()

    expect(fetchGovernanceDashboard).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Enterprise Governance Center')
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('12')
    expect(wrapper.text()).toContain('7')
    expect(wrapper.text()).toContain('Settings updated')
    expect(wrapper.text()).toContain('failed_login')
  })
})
