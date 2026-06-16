import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import AuditLogsPage from '@/modules/reports/pages/AuditLogs.vue'

const loadAuditLogs = vi.fn()
const resetFilters = vi.fn()

vi.mock('@/modules/reports/composables/useAuditLogs', () => ({
  useAuditLogs: () => ({
    items: ref([
      {
        id: 'audit-1',
        domain: 'sport',
        action: 'player_approved',
        entityLabel: 'Audit Player',
        entityType: 'sport_player',
        entityId: '1',
        actor: { name: 'Coach User' },
        createdAt: '2026-05-19T10:00:00Z',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla',
        oldValues: { approvalStatus: 'pending' },
        newValues: { approvalStatus: 'approved' },
        metadata: { reason: 'Approved by admin' },
      },
    ]),
    loading: ref(false),
    error: ref(''),
    pagination: reactive({ page: 1, perPage: 20, total: 1, lastPage: 1 }),
    filters: reactive({ domain: '', action: '', actorUserId: '', search: '', dateFrom: '', dateTo: '' }),
    loadAuditLogs,
    resetFilters,
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('audit logs page', () => {
  it('renders audit logs and loads data on mount', async () => {
    const wrapper = mountWithPlugins(AuditLogsPage, {
      messages: {
        en: {
          reports: {
            auditLogs: {
              title: 'Audit Logs',
              subtitle: 'Review sport activity.',
              loading: 'Loading audit logs...',
              empty: 'No audit records found',
              emptyDescription: 'Audit entries appear here once Sport workflows are recorded.',
              searchPlaceholder: 'Search entity, actor, or action',
              filters: {
                domain: 'Domain',
                action: 'Action',
                actor: 'Actor',
                dateFrom: 'From date',
                dateTo: 'To date',
                reset: 'Reset filters',
                allDomains: 'All domains',
                allActions: 'All actions',
              },
              fields: {
                domain: 'Domain',
                action: 'Action',
                actor: 'Actor',
                entity: 'Entity',
                time: 'Time',
                metadata: 'Metadata',
                oldValues: 'Previous values',
                newValues: 'New values',
                ipAddress: 'IP address',
                userAgent: 'User agent',
              },
              domains: {
                global: 'Global',
                sport: 'Sport',
              },
              actions: {
                playerApproved: 'Player approved',
              },
            },
          },
        },
      },
      global: {
        stubs: {
          MainLayout: { template: '<div><slot /></div>' },
          HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
          Card: { template: '<div><slot name="title" /><slot name="content" /><slot /></div>' },
          Pagination: { template: '<div class="pagination-stub" />' },
          SearchInputField: { template: '<input />' },
          Select: { template: '<select />' },
          InputText: { template: '<input />' },
          Button: { template: '<button><slot /></button>' },
        },
      },
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Audit Logs')
    expect(wrapper.text()).toContain('Audit Player')
    expect(loadAuditLogs).toHaveBeenCalled()
  })

  it('invokes reset filters from the toolbar', async () => {
    const wrapper = mountWithPlugins(AuditLogsPage, {
      messages: {
        en: {
          reports: {
            auditLogs: {
              title: 'Audit Logs',
              subtitle: 'Review sport activity.',
              loading: 'Loading audit logs...',
              empty: 'No audit records found',
              emptyDescription: 'Audit entries appear here once Sport workflows are recorded.',
              searchPlaceholder: 'Search entity, actor, or action',
              filters: {
                domain: 'Domain',
                action: 'Action',
                actor: 'Actor',
                dateFrom: 'From date',
                dateTo: 'To date',
                reset: 'Reset filters',
                allDomains: 'All domains',
                allActions: 'All actions',
              },
              fields: {
                domain: 'Domain',
                action: 'Action',
                actor: 'Actor',
                entity: 'Entity',
                time: 'Time',
                metadata: 'Metadata',
                oldValues: 'Previous values',
                newValues: 'New values',
                ipAddress: 'IP address',
                userAgent: 'User agent',
              },
              domains: {
                global: 'Global',
                sport: 'Sport',
              },
              actions: {
                playerApproved: 'Player approved',
              },
            },
          },
        },
      },
      global: {
        stubs: {
          MainLayout: { template: '<div><slot /></div>' },
          HeaderSection: { template: '<div />' },
          Card: { template: '<div><slot name="content" /></div>' },
          Pagination: { template: '<div />' },
          SearchInputField: { template: '<input />' },
          Select: { template: '<select />' },
          InputText: { template: '<input />' },
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
        },
      },
    })

    await wrapper.find('button').trigger('click')
    expect(resetFilters).toHaveBeenCalled()
  })
})