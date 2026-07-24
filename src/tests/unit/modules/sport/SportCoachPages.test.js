import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import MyTeams from '@/modules/sport/coach/pages/MyTeams.vue'
import MyRequests from '@/modules/sport/coach/pages/MyRequests.vue'
import MatchRequest from '@/modules/sport/coach/pages/MatchRequest.vue'
import CoachTeamAssignments from '@/modules/sport/admin/pages/approval/CoachTeamAssignments.vue'

const {
  loadTeams,
  loadRequests,
  fetchSportCoaches,
  fetchSportTeams,
  fetchCoachOpponentTeams,
  listCoachTeamAssignments,
  createCoachTeamAssignment,
  updateCoachTeamAssignment,
  saveCoachTeamAssignment,
  deactivateCoachTeamAssignment,
} = vi.hoisted(() => ({
  loadTeams: vi.fn(),
  loadRequests: vi.fn(),
  fetchSportCoaches: vi.fn(),
  fetchSportTeams: vi.fn(),
  fetchCoachOpponentTeams: vi.fn(),
  listCoachTeamAssignments: vi.fn(),
  createCoachTeamAssignment: vi.fn(),
  updateCoachTeamAssignment: vi.fn(),
  saveCoachTeamAssignment: vi.fn(),
  deactivateCoachTeamAssignment: vi.fn(),
}))

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

vi.mock('@/modules/sport/coach/composables/useCoachRequests', () => ({
  useCoachRequests: () => ({
    playerRequests: ref([{ id: 'request-1', name: 'Player Request', team: { name: 'Assigned FC' }, approvalStatus: 'pending' }]),
    matchRequests: ref([{ id: 'request-2', homeTeam: 'Assigned FC', awayTeam: 'Opponent FC', approvalStatus: 'pending' }]),
    summary: ref({ playerRequests: 1, matchRequests: 1, total: 2 }),
    loading: ref(false),
    error: ref(''),
    loadRequests,
  }),
}))

vi.mock('@/modules/sport/services/sportApi', () => ({
  fetchSportCoaches,
  fetchSportTeams,
}))

vi.mock('@/modules/sport/services/api/sportCoachTeamsApi', () => ({
  fetchCoachOpponentTeams,
}))

vi.mock('@/modules/sport/admin/composables/useSportApprovals', () => ({
  useSportApprovals: () => ({
    loading: ref(false),
    error: ref(''),
    loadPendingPlayers: vi.fn(),
    loadPendingMatches: vi.fn(),
    listCoachTeamAssignments,
    createCoachTeamAssignment,
    updateCoachTeamAssignment,
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
  fetchSportCoaches.mockResolvedValue({
    items: [{ id: 'coach-1', fullName: 'Alex Coach' }],
    pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
  })
  fetchSportTeams.mockResolvedValue({
    items: [{ id: 'team-1', name: 'Lions FC' }],
    pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
  })
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

  it('does not render a coach attendance row action in my teams', async () => {
    const wrapper = mountWithPlugins(MyTeams, {
      messages: {
        en: {
          sportCoachTeamManagement: {
            myTeams: { title: 'My Teams', subtitle: 'Assigned teams', panelTitle: 'Assigned teams', panelText: 'Only active assignments are shown here.' },
            actions: {
              viewPlayers: 'View players',
              addPlayer: 'Add player',
              requestMatch: 'Request match',
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
          Column: {
            template:
              '<div>' +
              '<slot name="body" :data="{ id: \'team-1\', status: \'active\' }" />' +
              '<slot />' +
              '</div>',
          },
          Button: { props: ['label'], template: '<button>{{ label }}</button>' },
          StatusBadge: { template: '<span><slot /></span>' },
        },
        mocks: {
          $primevue: { config: {} },
        },
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('View players')
    expect(wrapper.text()).toContain('Add player')
    expect(wrapper.text()).toContain('Request match')
    expect(wrapper.text()).not.toContain('Player Attendance')
  })

  it('renders the my requests page with coach-safe data', async () => {
    const wrapper = mountWithPlugins(MyRequests, {
      messages: {
        en: {
          sportCoachTeamManagement: {
            common: {
              player: 'Player',
              team: 'Team',
              homeTeam: 'Home team',
              awayTeam: 'Away team',
              status: 'Status',
            },
            requests: {
              title: 'My Requests',
              subtitle: 'Track pending player and match requests you created.',
              playersTitle: 'Player requests',
              matchesTitle: 'Match requests',
              emptyPlayers: 'No player requests have been submitted yet.',
              emptyMatches: 'No match requests have been submitted yet.',
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
          DataTable: { props: ['value'], template: '<div><slot />{{ value?.[0]?.name || "" }}</div>' },
          Column: { template: '<div><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          StatusBadge: { template: '<span><slot /></span>' },
        },
        mocks: {
          $primevue: { config: {} },
        },
      },
    })

    await flushPromises()
    expect(wrapper.text()).toContain('Player requests')
    expect(loadRequests).toHaveBeenCalled()
  })

  it('renders the match request page using coach opponent lookups', async () => {
    fetchCoachOpponentTeams.mockResolvedValueOnce({
      items: [{ id: 'team-2', name: 'Opponent FC' }],
      pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
    })

    mountWithPlugins(MatchRequest, {
      messages: {
        en: {
          sportCoachTeamManagement: {
            common: {
              selectTeam: 'Select a team',
              selectOpponent: 'Select an opponent',
              matchType: 'Match type',
              trainingMatch: 'Training match',
              friendlyMatch: 'Friendly match',
              scheduledAt: 'Scheduled time',
              notes: 'Notes',
              venue: 'Venue',
              loadError: 'Unable to load data right now.',
            },
            matchRequest: {
              title: 'Training / Friendly Match Request',
              subtitle: 'Request a training or friendly match for one of your assigned teams.',
              panelTitle: 'New match request',
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
          Button: { template: '<button><slot /></button>' },
          Select: { template: '<div />' },
          InputText: { template: '<div />' },
          Textarea: { template: '<div />' },
        },
        mocks: {
          $primevue: { config: {} },
        },
      },
    })

    await flushPromises()
    expect(fetchCoachOpponentTeams).toHaveBeenCalled()
  })

  it('renders the coach match schedule field as datetime-local', async () => {
    fetchCoachOpponentTeams.mockResolvedValueOnce({
      items: [{ id: 'team-2', name: 'Opponent FC' }],
      pagination: { page: 1, perPage: 10, total: 1, totalPages: 1 },
    })

    const wrapper = mountWithPlugins(MatchRequest, {
      messages: {
        en: {
          sportCoachTeamManagement: {
            common: {
              selectTeam: 'Select a team',
              selectOpponent: 'Select an opponent',
              matchType: 'Match type',
              trainingMatch: 'Training match',
              friendlyMatch: 'Friendly match',
              scheduledAt: 'Scheduled time',
              notes: 'Notes',
              venue: 'Venue',
              loadError: 'Unable to load data right now.',
            },
            matchRequest: {
              title: 'Training / Friendly Match Request',
              subtitle: 'Request a training or friendly match for one of your assigned teams.',
              panelTitle: 'New match request',
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
          Button: { template: '<button><slot /></button>' },
          Select: { template: '<div />' },
          InputText: { inheritAttrs: true, template: '<input v-bind="$attrs" />' },
          Textarea: { inheritAttrs: true, template: '<textarea v-bind="$attrs"></textarea>' },
        },
        mocks: {
          $primevue: { config: {} },
        },
      },
    })

    await flushPromises()
    expect(wrapper.find('input[type="datetime-local"]').exists()).toBe(true)
  })

  it('renders the coach assignments page shell', async () => {
    listCoachTeamAssignments.mockResolvedValueOnce({
      items: [
        {
          id: 'assignment-1',
          status: 'active',
          coach: {
            firstName: 'Alex',
            lastName: 'Coach',
            username: 'Alex Coach',
            email: 'alex.coach@hfccf.org',
          },
          team: {
            name: 'Lions FC',
          },
        },
      ],
      pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
    })
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
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          Select: { template: '<div />' },
          StatusBadge: { template: '<span><slot /></span>' },
        },
        mocks: {
          $primevue: { config: {} },
        },
      },
    })
    await flushPromises()
    expect(wrapper.text()).toContain('Current assignments')
    expect(saveCoachTeamAssignment).toBeDefined()
    expect(deactivateCoachTeamAssignment).toBeDefined()
  })

  it('opens the existing inline edit form from the rendered Edit button', async () => {
    listCoachTeamAssignments.mockResolvedValueOnce({
      items: [
        {
          id: 'assignment-1',
          status: 'active',
          coachUserId: 'coach-1',
          teamId: 'team-1',
          coach: { id: 'coach-1', firstName: 'Alex', lastName: 'Coach' },
          team: { id: 'team-1', name: 'Lions FC' },
        },
      ],
      pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
    })

    const wrapper = mountWithPlugins(CoachTeamAssignments, {
      messages: {
        en: {
          common: { edit: 'Edit' },
          sportCoachTeamManagement: {
            assignments: {
              title: 'Coach Team Assignments',
              subtitle: 'Assign teams to coaches.',
              formTitle: 'New assignment',
              listTitle: 'Current assignments',
            },
            common: {
              active: 'Active',
              inactive: 'Inactive',
              coach: 'Coach',
              team: 'Team',
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
          HeaderSection: { template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
          Button: { props: ['label'], template: '<button @click="$emit(\'click\')">{{ label }}</button>' },
          Select: { template: '<div />' },
          StatusBadge: { template: '<span><slot /></span>' },
        },
        mocks: {
          $primevue: { config: {} },
        },
      },
    })

    await flushPromises()
    const editButton = wrapper.findAll('button').find((button) => button.text() === 'Edit')

    expect(editButton).toBeDefined()
    await editButton.trigger('click')

    expect(wrapper.vm.editingAssignmentId).toBe('assignment-1')
    expect(wrapper.vm.form.coachUserId).toBe('coach-1')
    expect(wrapper.vm.form.teamId).toBe('team-1')
    expect(wrapper.text()).toContain('Edit assignment')
  })

  it('hydrates numeric team option ids and supports cancelling edit mode', async () => {
    listCoachTeamAssignments.mockResolvedValueOnce({
      items: [{
        id: 9,
        status: 'inactive',
        coachUserId: 'coach-1',
        teamId: 42,
        coach: { id: 'coach-1', firstName: 'Alex', lastName: 'Coach' },
        team: { id: 42, name: 'Lions FC' },
      }],
      pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
    })
    fetchSportTeams.mockResolvedValueOnce({ items: [{ id: 42, name: 'Lions FC' }] })

    const wrapper = mountWithPlugins(CoachTeamAssignments, {
      messages: {
        en: {
          common: { edit: 'Edit' },
          sportCoachTeamManagement: {
            assignments: {
              title: 'Coach Team Assignments',
              subtitle: 'Assign teams to coaches.',
              formTitle: 'New assignment',
              listTitle: 'Current assignments',
            },
            common: { active: 'Active', inactive: 'Inactive', coach: 'Coach', team: 'Team' },
            actions: { updateAssignment: 'Update assignment', cancel: 'Cancel' },
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
          HeaderSection: { template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
          Button: { props: ['label'], template: '<button @click="$emit(\'click\')">{{ label }}</button>' },
          Select: { template: '<div />' },
          StatusBadge: { template: '<span><slot /></span>' },
        },
        mocks: { $primevue: { config: {} } },
      },
    })

    await flushPromises()
    wrapper.vm.startEdit(wrapper.vm.assignments[0])
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.teams[0].id).toBe('42')
    expect(wrapper.vm.form.teamId).toBe('42')
    expect(wrapper.text()).toContain('Update assignment')

    wrapper.vm.cancelEdit()
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.editingAssignmentId).toBe('')
    expect(wrapper.vm.form.teamId).toBe('')
    expect(wrapper.text()).toContain('New assignment')

    wrapper.vm.form.coachUserId = 'coach-1'
    wrapper.vm.form.teamId = '42'
    createCoachTeamAssignment.mockResolvedValueOnce({ assignment: { id: 10 } })
    await wrapper.vm.submit()

    expect(createCoachTeamAssignment).toHaveBeenCalledWith({
      coach_user_id: 'coach-1',
      team_id: '42',
      status: 'active',
    })
    expect(updateCoachTeamAssignment).not.toHaveBeenCalled()
  })

  it('patches an existing assignment when editing and can reactivate it', async () => {
    listCoachTeamAssignments.mockResolvedValueOnce({
      items: [
        {
          id: 'assignment-1',
          status: 'inactive',
          coachUserId: 'coach-1',
          teamId: 'team-1',
          coach: {
            id: 'coach-1',
            firstName: 'Alex',
            lastName: 'Coach',
          },
          team: {
            id: 'team-1',
            name: 'Lions FC',
          },
        },
      ],
      pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
    })

    const wrapper = mountWithPlugins(CoachTeamAssignments, {
      messages: {
        en: {
          common: { edit: 'Edit' },
          sportCoachTeamManagement: {
            assignments: {
              title: 'Coach Team Assignments',
              subtitle: 'Assign teams to coaches.',
              formTitle: 'New assignment',
              listTitle: 'Current assignments',
            },
            common: {
              active: 'Active',
              inactive: 'Inactive',
              coach: 'Coach',
              team: 'Team',
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
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          Select: { template: '<div />' },
          StatusBadge: { template: '<span><slot /></span>' },
        },
        mocks: {
          $primevue: { config: {} },
        },
      },
    })

    await flushPromises()
    wrapper.vm.startEdit({
      id: 'assignment-1',
      status: 'inactive',
      coach: { id: 'coach-1', firstName: 'Alex', lastName: 'Coach' },
      team: { id: 'team-1', name: 'Lions FC' },
    })
    wrapper.vm.form.status = 'active'

    updateCoachTeamAssignment.mockResolvedValueOnce({ assignment: { id: 'assignment-1' } })

    await wrapper.vm.submit()
    await flushPromises()

    expect(updateCoachTeamAssignment).toHaveBeenCalledWith('assignment-1', {
      coach_user_id: 'coach-1',
      team_id: 'team-1',
      status: 'active',
    })
  })

  it('blocks creating a duplicate active assignment', async () => {
    listCoachTeamAssignments.mockResolvedValueOnce({
      items: [
        {
          id: 'assignment-1',
          status: 'active',
          coachUserId: 'coach-1',
          teamId: 'team-1',
          coach: { id: 'coach-1', firstName: 'Alex', lastName: 'Coach' },
          team: { id: 'team-1', name: 'Lions FC' },
        },
      ],
      pagination: { page: 1, perPage: 100, total: 1, totalPages: 1 },
    })

    const wrapper = mountWithPlugins(CoachTeamAssignments, {
      messages: {
        en: {
          common: { edit: 'Edit' },
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
          Button: { template: '<button @click="$emit(\'click\')"><slot /></button>' },
          Select: { template: '<div />' },
          StatusBadge: { template: '<span><slot /></span>' },
        },
        mocks: {
          $primevue: { config: {} },
        },
      },
    })

    await flushPromises()
    wrapper.vm.form.coachUserId = 'coach-1'
    wrapper.vm.form.teamId = 'team-1'
    wrapper.vm.form.status = 'active'

    await wrapper.vm.submit()
    await flushPromises()

    expect(saveCoachTeamAssignment).not.toHaveBeenCalled()
    expect(wrapper.vm.error).toBe('An active assignment already exists for this coach and team.')
  })
})
