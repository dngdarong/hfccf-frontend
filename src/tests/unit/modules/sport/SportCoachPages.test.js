import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import MyTeams from '@/modules/sport/coach/pages/MyTeams.vue'
import CoachTeamAssignments from '@/modules/sport/admin/pages/approval/CoachTeamAssignments.vue'

const loadTeams = vi.fn()
const listCoachTeamAssignments = vi.fn()
const saveCoachTeamAssignment = vi.fn()
const deactivateCoachTeamAssignment = vi.fn()

vi.mock('@/modules/sport/coach/composables/useCoachTeams', () => ({
  useCoachTeams: () => ({
    items: ref([{ id: 'team-1', name: 'Assigned FC', division: 'A', playersCount: 12, status: 'active' }]),
    loading: ref(false),
    error: ref(''),
    hasTeams: ref(true),
    selectedTeam: ref(null),
    loadTeams,
    loadTeam: vi.fn(),
  }),
}))

vi.mock('@/modules/sport/admin/composables/useSportApprovals', () => ({
  useSportApprovals: () => ({
    loading: ref(false),
    error: ref(''),
    loadPendingPlayers: vi.fn(),
    loadPendingMatches: vi.fn(),
    listCoachTeamAssignments,
    saveCoachTeamAssignment,
    deactivateCoachTeamAssignment,
    approvePendingPlayer: vi.fn(),
    rejectPendingPlayer: vi.fn(),
    approvePendingMatch: vi.fn(),
    rejectPendingMatch: vi.fn(),
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
  if (typeof window !== 'undefined' && !window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
  }
})

describe('sport coach pages', () => {
  it('renders the my teams page with assigned teams actions', async () => {
    const wrapper = mountWithPlugins(MyTeams, {
      messages: {
        en: {
          sportCoachTeamManagement: {
            myTeams: { title: 'My Teams', subtitle: 'Assigned teams', panelTitle: 'Assigned teams', panelText: 'Only active assignments are shown here.' },
          },
        },
      },
      routes: [
        { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
        { path: '/profile-settings', name: 'profile-settings', component: { template: '<div />' } },
      ],
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          MainLayout: { template: '<div><slot /></div>' },
          HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
          Card: { template: '<div><slot name="title" /><slot name="content" /><slot /></div>' },
          DataTable: { template: '<div><slot /></div>' },
          Column: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          StatusBadge: { template: '<span><slot /></span>' },
        },
        mocks: {
          $primevue: { config: {} },
        },
      },
    })
    expect(wrapper.text()).toContain('Assigned teams')
    expect(loadTeams).toHaveBeenCalled()
  })

  it('renders the coach assignments page shell', async () => {
    listCoachTeamAssignments.mockResolvedValueOnce({ items: [] })
    const wrapper = mountWithPlugins(CoachTeamAssignments, {
      messages: {
        en: {
          sportCoachTeamManagement: {
            assignments: {
              title: 'Coach Team Assignments',
              subtitle: 'Assign teams to coaches.',
              formTitle: 'New assignment',
              listTitle: 'Current assignments',
            },
          },
        },
      },
      routes: [
        { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
        { path: '/profile-settings', name: 'profile-settings', component: { template: '<div />' } },
      ],
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          MainLayout: { template: '<div><slot /></div>' },
          HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
          Card: { template: '<div><slot name="title" /><slot name="content" /><slot /></div>' },
          DataTable: { template: '<div><slot /></div>' },
          Column: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Select: { template: '<div />' },
          StatusBadge: { template: '<span><slot /></span>' },
        },
        mocks: {
          $primevue: { config: {} },
        },
      },
    })
    expect(wrapper.text()).toContain('Current assignments')
    expect(saveCoachTeamAssignment).toBeDefined()
    expect(deactivateCoachTeamAssignment).toBeDefined()
  })
})
