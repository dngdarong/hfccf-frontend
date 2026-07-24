import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import TeamPlayers from '@/modules/sport/coach/pages/TeamPlayers.vue'
import TeamRoster from '@/modules/sport/coach/pages/TeamRoster.vue'
import PlayerLifecycleManagement from '@/modules/sport/admin/pages/approval/PlayerLifecycleManagement.vue'

const loadRoster = vi.fn()
const loadTeams = vi.fn()
const addPlayer = vi.fn()
const loadPlayers = vi.fn()
const loadHistory = vi.fn()
const updateStatus = vi.fn()
const markInjury = vi.fn()
const markSuspension = vi.fn()
const release = vi.fn()
const archive = vi.fn()

vi.mock('@/modules/sport/coach/composables/useTeamRoster', () => ({
  useTeamRoster: () => ({
    team: ref({ id: 'team-1', name: 'Assigned FC' }),
    players: ref([{ id: 'player-1', name: 'Player One', jerseyNumber: 7, primaryPosition: 'Forward', approvalStatus: 'approved', rosterStatus: 'active' }]),
    memberships: ref([{ id: 'membership-1', status: 'active' }]),
    candidates: ref([{ id: 'candidate-1', name: 'Candidate One', approvalStatus: 'approved' }]),
    loading: ref(false),
    error: ref(''),
    loadRoster,
    loadCandidates: vi.fn(),
    addPlayer,
    loadHistory,
    updateMembership: vi.fn(),
    removeMembership: vi.fn(),
    activePlayers: ref([]),
  }),
}))

vi.mock('@/modules/sport/coach/composables/useCoachTeams', () => ({
  useCoachTeams: () => ({
    items: ref([{ id: 'team-1', name: 'Assigned FC' }]),
    selectedTeam: ref(null),
    loading: ref(false),
    error: ref(''),
    hasTeams: ref(true),
    loadTeams,
    loadTeam: vi.fn(),
  }),
}))

vi.mock('@/modules/sport/admin/composables/usePlayerLifecycle', () => ({
  usePlayerLifecycle: () => ({
    items: ref([{ id: 'player-1', name: 'Player One', team: { name: 'Assigned FC' }, approvalStatus: 'approved', rosterStatus: 'active' }]),
    history: ref({ player: { id: 'player-1', name: 'Player One' }, memberships: [] }),
    loading: ref(false),
    error: ref(''),
    loadPlayers,
    loadHistory,
    updateStatus,
    markInjury,
    markSuspension,
    release,
    archive,
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('player lifecycle pages', () => {
  it('renders the team players roster page', async () => {
    const wrapper = mountWithPlugins(TeamPlayers, {
      messages: {
        en: {
          sportCoachTeamManagement: {
            common: {
              player: 'Player',
              jersey: 'Jersey',
              position: 'Position',
              approval: 'Approval',
            },
            teamPlayers: {
              title: 'Team Players',
              subtitle: 'Assigned roster',
              panelTitle: 'Roster',
              emptyTeam: 'No team selected',
            },
            actions: { addPlayer: 'Add player' },
          },
        },
      },
        global: {
          stubs: {
            MainLayout: { template: '<div><slot /></div>' },
            HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
            Card: { template: '<div><slot name="title" /><slot name="content" /><slot /></div>' },
          DataTable: {
            props: ['value'],
            template: '<div><slot />{{ value?.[0]?.name || "" }}</div>',
          },
          Column: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          StatusBadge: { template: '<span><slot /></span>' },
        },
      },
    })

    await nextTick()
    await flushPromises()
    expect(wrapper.text()).toContain('Assigned FC')
    expect(wrapper.text()).toContain('Player One')
    expect(loadRoster).not.toHaveBeenCalled()
  })

  it('renders the team roster management page and loads team data', async () => {
    const wrapper = mountWithPlugins(TeamRoster, {
      messages: {
        en: {
          sportPlayerLifecycle: {
            coachRoster: {
              title: 'Team Roster',
              subtitle: 'Manage assigned players.',
              panelTitle: 'Current roster',
              summary: '{players} players • {memberships} membership records',
            },
            common: {
              selectTeam: 'Select team',
              selectPlayer: 'Select player',
              player: 'Player',
              team: 'Team',
              jersey: 'Jersey',
              position: 'Position',
              approval: 'Approval',
              rosterStatus: 'Roster status',
              membershipStatus: 'Membership status',
              notes: 'Notes',
              actions: 'Actions',
            },
            statuses: {
              active: 'Active',
              injured: 'Injured',
              suspended: 'Suspended',
              inactive: 'Inactive',
              released: 'Released',
            },
            actions: {
              addToRoster: 'Add to roster',
              history: 'History',
              injured: 'Mark injured',
              suspended: 'Suspend',
              released: 'Release',
            },
            history: { title: 'Membership history', player: 'Player', joinedAt: 'Joined at', leftAt: 'Left at' },
            statusNotes: { coachChange: 'Coach roster update.' },
          },
        },
      },
        global: {
          stubs: {
            MainLayout: { template: '<div><slot /></div>' },
            HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
            Card: { template: '<div><slot name="title" /><slot name="content" /><slot /></div>' },
          DataTable: {
            props: ['value'],
            template: '<div><slot />{{ value?.[0]?.name || "" }}</div>',
          },
          Column: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          StatusBadge: { template: '<span><slot /></span>' },
          Select: { template: '<div />' },
          Textarea: { template: '<textarea />' },
          Dialog: { template: '<div><slot /></div>' },
        },
      },
    })

    await nextTick()
    await flushPromises()
    expect(wrapper.text()).toContain('Assigned FC')
    expect(wrapper.text()).toContain('Player One')
    expect(loadTeams).toHaveBeenCalled()
    expect(loadHistory).not.toHaveBeenCalled()
  })

  it('renders the lifecycle management page and loads players', async () => {
    const wrapper = mountWithPlugins(PlayerLifecycleManagement, {
      messages: {
        en: {
          sportPlayerLifecycle: {
            adminLifecycle: { title: 'Player Lifecycle Management', subtitle: 'Review players.', panelTitle: 'Lifecycle review' },
            common: {
              player: 'Player',
              team: 'Team',
              approval: 'Approval',
              rosterStatus: 'Roster status',
              actions: 'Actions',
              membershipStatus: 'Membership status',
            },
            filters: { allStatuses: 'All statuses', allApprovals: 'All approvals', status: 'Status', approval: 'Approval' },
            statuses: {
              active: 'Active',
              injured: 'Injured',
              suspended: 'Suspended',
              inactive: 'Inactive',
              released: 'Released',
              graduated: 'Graduated',
              archived: 'Archived',
            },
            approvals: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' },
            actions: { history: 'History', active: 'Activate', injured: 'Mark injured', suspended: 'Suspend', released: 'Release', archive: 'Archive' },
            history: { title: 'Membership history', player: 'Player', joinedAt: 'Joined at', leftAt: 'Left at' },
            statusNotes: { adminChange: 'Admin lifecycle update.' },
          },
        },
      },
        global: {
          stubs: {
            MainLayout: { template: '<div><slot /></div>' },
            HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
            Card: { template: '<div><slot name="title" /><slot name="content" /><slot /></div>' },
          DataTable: {
            props: ['value'],
            template: '<div><slot />{{ value?.[0]?.name || "" }}</div>',
          },
          Column: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          StatusBadge: { template: '<span><slot /></span>' },
          Select: { template: '<div />' },
          Dialog: { template: '<div><slot /></div>' },
        },
      },
    })

    await nextTick()
    await flushPromises()
    expect(wrapper.text()).toContain('Player One')
    expect(loadPlayers).toHaveBeenCalled()
    expect(updateStatus).toBeDefined()
    expect(markInjury).toBeDefined()
    expect(markSuspension).toBeDefined()
    expect(release).toBeDefined()
    expect(archive).toBeDefined()
  })
})
