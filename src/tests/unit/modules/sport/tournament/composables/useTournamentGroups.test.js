import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createTournamentGroupDrawDraft } from '@/modules/sport/tournament/mocks/tournaments.mock'
import { useTournamentGroups } from '@/modules/sport/tournament/composables/useTournamentGroups'

const apiMocks = vi.hoisted(() => ({
  getTournamentGroups: vi.fn(),
  drawTournamentGroups: vi.fn(),
  finalizeTournamentGroups: vi.fn(),
  drawEngine: {
    settings: {
      groupCount: 2,
      teamsPerGroup: 2,
      qualificationCount: 1,
      seededMode: true,
      autoFixtureGeneration: true,
    },
    mode: { value: 'automatic' },
    groups: { value: [{ id: 'group-01', code: 'A', teamIds: ['team-1'], qualificationSlots: 1 }] },
    previewVisible: { value: false },
    previewGroups: { value: [] },
    previewSummary: { value: null },
    previewWarnings: { value: [] },
    lastGeneratedAt: { value: '2026-05-18T09:00:00.000Z' },
    initialSnapshot: { value: {} },
    teams: { value: [] },
    state: { value: 'registration_closed' },
    groupOptions: { value: [{ label: 'Group A', value: 'A' }, { label: 'Group B', value: 'B' }] },
    resolvedGroups: { value: [{ id: 'group-01', code: 'A', teamIds: ['team-1'], qualificationSlots: 1 }] },
    resolvedPreviewGroups: { value: [] },
    seedTeams: { value: [] },
    unassignedTeams: { value: [] },
    summary: { value: { groupCount: 2, teamsPerGroup: 2, qualificationCount: 1 } },
    issues: { value: [] },
    canEdit: { value: true },
    canFinalize: { value: true },
    updateSettings: vi.fn(),
    rebuildGroups: vi.fn(),
    previewAutomaticDraw: vi.fn(() => {
      apiMocks.drawEngine.previewVisible.value = true
      apiMocks.drawEngine.previewGroups.value = [{ id: 'group-01', code: 'A', teamIds: ['team-1'] }]
      apiMocks.drawEngine.previewSummary.value = { groupCount: 2 }
      apiMocks.drawEngine.previewWarnings.value = []
      return { groups: apiMocks.drawEngine.previewGroups.value }
    }),
    applyPreview: vi.fn(() => true),
    assignTeamToGroup: vi.fn(),
    removeTeamFromGroup: vi.fn(),
    resetDraft: vi.fn(),
    saveDraft: vi.fn(),
    finalizeGroups: vi.fn(),
  },
}))

vi.mock('@/modules/sport/tournament/api/groupApi', () => ({
  getTournamentGroups: apiMocks.getTournamentGroups,
  drawTournamentGroups: apiMocks.drawTournamentGroups,
  finalizeTournamentGroups: apiMocks.finalizeTournamentGroups,
}))

vi.mock('@/modules/sport/tournament/composables/useTournamentGroupDraw', () => ({
  useTournamentGroupDraw: () => apiMocks.drawEngine,
}))

function networkError(message = 'Network unavailable') {
  const error = new Error(message)
  error.isNetworkError = true
  error.code = 'NETWORK_ERROR'
  return error
}

function createTournamentRecord() {
  return {
    id: 'tournament-001',
    state: 'registration_closed',
    groupDraw: createTournamentGroupDrawDraft({
      groupCount: 2,
      teamsPerGroup: 2,
      qualificationCount: 1,
    }),
    teams: [
      { id: 'team-1', name: 'Blue Phoenix' },
      { id: 'team-2', name: 'Golden Lions' },
    ],
    statistics: {},
  }
}

function createGroupResponse(overrides = {}) {
  const groups = overrides.groups || [
    {
      id: '101',
      tournamentId: 'tournament-001',
      name: 'Group A',
      code: 'A',
      qualificationSlots: 1,
      status: overrides.locked ? 'finalized' : 'draft',
      finalizedAt: overrides.locked ? '2026-05-18T10:00:00.000Z' : '',
      teamIds: ['team-1'],
      teams: [
        {
          id: '201',
          tournamentId: 'tournament-001',
          groupId: '101',
          teamId: 'team-1',
          status: 'assigned',
          team: {
            id: 'team-1',
            name: 'Blue Phoenix',
          },
        },
      ],
    },
  ]

  return {
    tournamentId: 'tournament-001',
    groupDraw: {
      mode: overrides.mode || 'automatic',
      locked: Boolean(overrides.locked),
      lastGeneratedAt: overrides.lastGeneratedAt || '',
      settings: {
        groupCount: overrides.settings?.groupCount || 2,
        teamsPerGroup: overrides.settings?.teamsPerGroup || 2,
        qualificationCount: overrides.settings?.qualificationCount || 1,
        seededMode: overrides.settings?.seededMode ?? true,
        autoFixtureGeneration: overrides.settings?.autoFixtureGeneration ?? true,
      },
      groups,
    },
    groupStandings: overrides.groupStandings || [],
    standings: overrides.standings || [],
  }
}

function resetDrawEngineState() {
  apiMocks.drawEngine.settings.groupCount = 2
  apiMocks.drawEngine.settings.teamsPerGroup = 2
  apiMocks.drawEngine.settings.qualificationCount = 1
  apiMocks.drawEngine.settings.seededMode = true
  apiMocks.drawEngine.settings.autoFixtureGeneration = true
  apiMocks.drawEngine.mode.value = 'automatic'
  apiMocks.drawEngine.groups.value = [{ id: 'group-01', code: 'A', teamIds: ['team-1'], qualificationSlots: 1 }]
  apiMocks.drawEngine.previewVisible.value = false
  apiMocks.drawEngine.previewGroups.value = []
  apiMocks.drawEngine.previewSummary.value = null
  apiMocks.drawEngine.previewWarnings.value = []
  apiMocks.drawEngine.lastGeneratedAt.value = '2026-05-18T09:00:00.000Z'
  apiMocks.drawEngine.summary.value = { groupCount: 2, teamsPerGroup: 2, qualificationCount: 1 }
  apiMocks.drawEngine.issues.value = []
  apiMocks.drawEngine.canEdit.value = true
  apiMocks.drawEngine.canFinalize.value = true
  apiMocks.drawEngine.previewAutomaticDraw.mockClear()
  apiMocks.drawEngine.applyPreview.mockClear()
  apiMocks.drawEngine.assignTeamToGroup.mockClear()
  apiMocks.drawEngine.removeTeamFromGroup.mockClear()
  apiMocks.drawEngine.resetDraft.mockClear()
  apiMocks.drawEngine.saveDraft.mockClear()
  apiMocks.drawEngine.finalizeGroups.mockClear()
}

beforeEach(() => {
  vi.clearAllMocks()
  resetDrawEngineState()
})

describe('useTournamentGroups', () => {
  it('loads backend groups and normalizes the synced snapshot', async () => {
    apiMocks.getTournamentGroups.mockResolvedValueOnce(createGroupResponse({ locked: true }))

    const tournament = ref(createTournamentRecord())
    const loadTournament = vi.fn().mockResolvedValue(tournament.value)
    const groups = useTournamentGroups(tournament, {
      loadTournament,
      transitionTournament: vi.fn(),
    })

    const record = await groups.loadGroups()

    expect(apiMocks.getTournamentGroups).toHaveBeenCalledWith(
      'tournament-001',
      expect.objectContaining({
        fallbackTournament: tournament.value,
      }),
    )
    expect(record).toMatchObject({
      id: 'tournament-001',
      groupDraw: expect.objectContaining({
        locked: true,
        groups: [expect.objectContaining({
          id: '101',
          code: 'A',
          status: 'finalized',
          teamIds: ['team-1'],
        })],
      }),
    })
    expect(groups.hasLoadedGroups.value).toBe(true)
    expect(groups.error.value).toBe('')
  })

  it('persists the current draft through the backend before reloading the tournament', async () => {
    apiMocks.drawTournamentGroups.mockResolvedValueOnce(createGroupResponse({
      groups: [
        {
          id: 101,
          name: 'Group A',
          code: 'A',
          qualificationSlots: 1,
          status: 'draft',
          teams: [
            {
              id: 201,
              teamId: 'team-1',
              team: {
                id: 'team-1',
                name: 'Blue Phoenix',
              },
            },
          ],
        },
      ],
    }))

    const tournament = ref(createTournamentRecord())
    const refreshedTournament = {
      ...createTournamentRecord(),
      name: 'Backend Cup',
    }
    const loadTournament = vi.fn().mockResolvedValue(refreshedTournament)
    const groups = useTournamentGroups(tournament, {
      loadTournament,
      transitionTournament: vi.fn(),
    })

    apiMocks.drawEngine.groups.value = [
      {
        id: 'group-01',
        code: 'A',
        teamIds: ['team-1'],
        qualificationSlots: 1,
      },
    ]

    const record = await groups.saveDraft()

    expect(apiMocks.drawTournamentGroups).toHaveBeenCalledWith(
      'tournament-001',
      expect.objectContaining({
        group_count: 2,
        qualification_slots: 1,
        reset: true,
        assignments: {
          'team-1': 'A',
        },
      }),
      expect.objectContaining({
        fallbackTournament: tournament.value,
      }),
    )
    expect(loadTournament).toHaveBeenCalledWith('tournament-001')
    expect(record).toMatchObject({
      name: 'Backend Cup',
      groupDraw: expect.objectContaining({
        locked: false,
        groups: [expect.objectContaining({ code: 'A' })],
      }),
    })
  })

  it('finalizes groups through the backend draw and finalize endpoints', async () => {
    apiMocks.drawTournamentGroups.mockResolvedValueOnce(createGroupResponse())
    apiMocks.finalizeTournamentGroups.mockResolvedValueOnce(createGroupResponse({
      locked: true,
      groups: [
        {
          id: 101,
          name: 'Group A',
          code: 'A',
          qualificationSlots: 1,
          status: 'finalized',
          teams: [],
        },
      ],
    }))

    const tournament = ref(createTournamentRecord())
    const loadTournament = vi.fn()
      .mockResolvedValueOnce(createTournamentRecord())
      .mockResolvedValueOnce({
        ...createTournamentRecord(),
        state: 'group_draw_completed',
        status: 'group_draw_completed',
      })

    const groups = useTournamentGroups(tournament, {
      loadTournament,
      transitionTournament: vi.fn(),
    })

    const record = await groups.finalizeGroups()

    expect(apiMocks.drawTournamentGroups).toHaveBeenCalledTimes(1)
    expect(apiMocks.finalizeTournamentGroups).toHaveBeenCalledWith(
      'tournament-001',
      expect.objectContaining({
        fallbackTournament: expect.any(Object),
      }),
    )
    expect(loadTournament).toHaveBeenCalledTimes(2)
    expect(record).toMatchObject({
      state: 'group_draw_completed',
      groupDraw: expect.objectContaining({
        locked: true,
      }),
    })
  })

  it('falls back to the local snapshot when the API is unavailable', async () => {
    apiMocks.getTournamentGroups.mockRejectedValueOnce(networkError())

    const tournament = ref(createTournamentRecord())
    const groups = useTournamentGroups(tournament, {
      loadTournament: vi.fn(),
      transitionTournament: vi.fn(),
    })

    const record = await groups.loadGroups()

    expect(apiMocks.getTournamentGroups).toHaveBeenCalledTimes(1)
    expect(record?.groupDraw?.groups).toHaveLength(2)
    expect(groups.hasLoadedGroups.value).toBe(true)
    expect(groups.error.value).toBe('')
  })
})
