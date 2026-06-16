import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { mountWithPlugins } from '@/tests/helpers/mount'
import MatchSquadSelection from '@/modules/sport/coach/pages/MatchSquadSelection.vue'
import MatchSquadReview from '@/modules/sport/admin/pages/approval/MatchSquadReview.vue'

const loadTeams = vi.fn().mockResolvedValue({ items: [] })
const loadMatch = vi.fn().mockResolvedValue({ match: null })
const loadMatchSquads = vi.fn().mockResolvedValue({ squads: [] })
const loadTeamSquad = vi.fn().mockResolvedValue({
  squad: {
    id: 'squad-1',
    notes: '',
    players: [],
  },
  players: [],
})
const loadEligibility = vi.fn().mockResolvedValue({ items: [] })
const saveSquad = vi.fn()
const submitSquad = vi.fn()
const approveSquad = vi.fn()
const lockSquad = vi.fn()

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()

  return {
    ...actual,
    useRoute: () => ({
      params: { matchId: 'match-1' },
      query: {},
    }),
  }
})

vi.mock('@/modules/sport/coach/composables/useCoachTeams', () => ({
  useCoachTeams: () => ({
    items: ref([
      { id: 'team-11', name: 'Assigned FC' },
      { id: 'team-12', name: 'Rival FC' },
    ]),
    selectedTeam: ref(null),
    loading: ref(false),
    error: ref(''),
    hasTeams: ref(true),
    loadTeams,
    loadTeam: vi.fn(),
  }),
}))

vi.mock('@/modules/sport/match-squads/composables/useMatchSquad', () => ({
  useMatchSquad: () => ({
    match: ref({
      id: 'match-1',
      homeTeam: 'Assigned FC',
      awayTeam: 'Rival FC',
      homeTeamData: { id: 'team-11', name: 'Assigned FC' },
      awayTeamData: { id: 'team-12', name: 'Rival FC' },
    }),
    squads: ref([
      { id: 'squad-1', team: { id: 'team-11', name: 'Assigned FC' }, status: 'draft', playersCount: 2, players: [] },
    ]),
    squad: ref({
      id: 'squad-1',
      status: 'draft',
      team: { id: 'team-11', name: 'Assigned FC' },
      players: [
        { playerId: 'player-1', playerNameSnapshot: 'Player One', role: 'starter', eligibilityStatus: 'eligible', isEligible: true },
      ],
    }),
    loading: ref(false),
    error: ref(''),
    loadMatch,
    loadMatchSquads,
    loadTeamSquad,
    saveSquad,
    submitSquad,
    approveSquad,
    lockSquad,
    updateSquad: vi.fn(),
  }),
}))

vi.mock('@/modules/sport/match-squads/composables/useMatchEligibility', () => ({
  useMatchEligibility: () => ({
    players: ref([
      { playerId: 'player-1', playerName: 'Player One', eligibilityStatus: 'eligible', isEligible: true, role: 'starter' },
      { playerId: 'player-2', playerName: 'Player Two', eligibilityStatus: 'injured', isEligible: false, role: 'unavailable' },
    ]),
    eligiblePlayers: ref([]),
    unavailablePlayers: ref([]),
    loading: ref(false),
    error: ref(''),
    loadEligibility,
  }),
}))

vi.mock('@/modules/sport/match-squads/composables/useMatchSquadSelection', () => ({
  useMatchSquadSelection: () => ({
    players: ref([
      { playerId: 'player-1', playerName: 'Player One', role: 'starter', eligibilityStatus: 'eligible', isEligible: true },
      { playerId: 'player-2', playerName: 'Player Two', role: 'unavailable', eligibilityStatus: 'injured', isEligible: false },
    ]),
    starters: ref([{ playerId: 'player-1', playerName: 'Player One', role: 'starter' }]),
    substitutes: ref([]),
    reserves: ref([]),
    unavailable: ref([{ playerId: 'player-2', playerName: 'Player Two', role: 'unavailable' }]),
    payload: ref([
      { player_id: 'player-1', role: 'starter' },
      { player_id: 'player-2', role: 'unavailable' },
    ]),
    syncFromEligibility: vi.fn(),
    setRole: vi.fn(),
    canSubmit: ref(true),
  }),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('match squad pages', () => {
  it('renders the coach squad selection page', async () => {
    const wrapper = mountWithPlugins(MatchSquadSelection, {
      messages: {
        en: {
          sportMatchSquad: {
            coach: {
              title: 'Match Squad Selection',
              subtitle: 'Select eligible players.',
              panelTitle: 'Coach squad selection',
              summary: '{players} players • {starters} starters • {substitutes} substitutes',
              noTeamSelected: 'No team selected',
              matchFallback: 'Selected match',
            },
            common: {
              selectTeam: 'Select team',
              match: 'Match',
              team: 'Team',
              player: 'Player',
              eligibility: 'Eligibility',
              role: 'Role',
              reason: 'Reason',
              notes: 'Notes',
              selectRole: 'Select role',
              noPosition: 'No position set',
            },
            actions: { saveDraft: 'Save draft', submitSquad: 'Submit squad' },
            statuses: { draft: 'Draft', submitted: 'Submitted', approved: 'Approved', locked: 'Locked' },
            roles: { starter: 'Starter', substitute: 'Substitute', reserve: 'Reserve', unavailable: 'Unavailable' },
            eligibility: { eligible: 'Eligible', injured: 'Injured' },
            sections: {
              starters: 'Starters',
              substitutes: 'Substitutes',
              reserves: 'Reserves',
              unavailable: 'Unavailable players',
              emptyStarters: 'No starters selected.',
              emptySubstitutes: 'No substitutes selected.',
              emptyReserves: 'No reserves selected.',
              emptyUnavailable: 'No unavailable players.',
            },
            emptyPlayers: 'No players available.',
            emptySection: 'No players in this section.',
          },
        },
      },
      global: {
        stubs: {
          MainLayout: { template: '<div><slot /></div>' },
          HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
          Card: { template: '<div><slot name="title" /><slot name="content" /><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Select: { template: '<div />' },
          Textarea: { template: '<textarea />' },
          MatchSquadPlayerPicker: { template: '<div class="picker" />' },
          MatchLineupCard: { template: '<div class="lineup" />' },
          MatchSquadStatusBadge: { template: '<span class="status" />' },
        },
      },
    })

    await nextTick()
    await flushPromises()

    expect(wrapper.text()).toContain('Match Squad Selection')
    expect(loadTeams).toHaveBeenCalled()
    expect(loadMatch).toHaveBeenCalledWith('match-1')
    expect(loadEligibility).toHaveBeenCalled()
    expect(loadTeamSquad).toHaveBeenCalled()
  })

  it('renders the admin squad review page', async () => {
    const wrapper = mountWithPlugins(MatchSquadReview, {
      messages: {
        en: {
          sportMatchSquad: {
            admin: {
              title: 'Match Squad Review',
              subtitle: 'Review submitted squads.',
              panelTitle: 'Squad review',
              summary: '{squads} squads • selected team: {team}',
              matchFallback: 'Selected match',
            },
            common: {
              selectTeam: 'Select team',
              match: 'Match',
              team: 'Team',
            },
            statuses: { draft: 'Draft', submitted: 'Submitted', approved: 'Approved', locked: 'Locked' },
            review: {
              title: 'Squad snapshot',
              team: 'Team',
              players: 'Players',
              status: 'Status',
              submittedAt: 'Submitted at',
              lockedAt: 'Locked at',
              noTeam: 'No team selected',
            },
            sections: {
              starters: 'Starters',
              substitutes: 'Substitutes',
              reserves: 'Reserves',
              unavailable: 'Unavailable players',
              emptyStarters: 'No starters selected.',
              emptySubstitutes: 'No substitutes selected.',
              emptyReserves: 'No reserves selected.',
              emptyUnavailable: 'No unavailable players.',
            },
          },
        },
      },
      global: {
        stubs: {
          MainLayout: { template: '<div><slot /></div>' },
          HeaderSection: { props: ['title', 'subtitle'], template: '<div><h1>{{ title }}</h1><p>{{ subtitle }}</p></div>' },
          Card: { template: '<div><slot name="title" /><slot name="content" /><slot /></div>' },
          Button: { template: '<button><slot /></button>' },
          Select: { template: '<div />' },
          DataTable: { props: ['value'], template: '<div class="table">{{ value?.length || 0 }}</div>' },
          Column: { template: '<div><slot /></div>' },
          StatusBadge: { template: '<span><slot /></span>' },
          MatchSquadReviewPanel: { template: '<div class="review-panel" />' },
          MatchLineupCard: { template: '<div class="lineup" />' },
          MatchSquadStatusBadge: { template: '<span class="status" />' },
        },
      },
    })

    await nextTick()
    await flushPromises()

    expect(wrapper.text()).toContain('Match Squad Review')
    expect(loadMatch).toHaveBeenCalledWith('match-1')
    expect(loadMatchSquads).toHaveBeenCalledWith('match-1')
    expect(loadTeamSquad).toHaveBeenCalled()
  })
})
