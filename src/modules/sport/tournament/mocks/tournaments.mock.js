import {
  TOURNAMENT_REGISTRATION_STATUSES,
  TOURNAMENT_RULE_DEFAULTS,
  TOURNAMENT_SPORT_TYPES,
  TOURNAMENT_STATES,
  TOURNAMENT_VISIBILITY_OPTIONS,
} from '../constants/tournamentStates'
import { createRoundRobinFixtures } from '../composables/useTournamentRoundRobin'
import {
  createKnockoutBracket,
  rebuildKnockoutProgression,
  updateKnockoutMatchResult,
} from '../composables/useTournamentBracket'
import {
  createKnockoutSettingsSnapshot,
  selectTournamentQualifiers,
} from '../services/generateQualification'
import { calculateTournamentStandings } from '../services/calculateStandings'

function deepClone(value) {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value)
    } catch {
      return JSON.parse(JSON.stringify(value))
    }
  }

  return JSON.parse(JSON.stringify(value))
}

function currentSeasonLabel() {
  return '2025 / 2026'
}

function createTeam(id, name, status = 'active', extras = {}) {
  return {
    id,
    name,
    status,
    ...extras,
  }
}

function createTeamSeries(prefix, names, seededRanks = []) {
  return names.map((name, index) => {
    const seedRank = seededRanks.includes(index + 1) ? seededRanks.indexOf(index + 1) + 1 : null

    return createTeam(`${prefix}-${String(index + 1).padStart(3, '0')}`, name, 'active', {
      seeded: seedRank !== null,
      seedRank,
    })
  })
}

function buildFixtureScore(index, homeTeamId, awayTeamId) {
  const homeGoals = (index % 4) + 1
  const awayGoals = index % 3

  return {
    score: {
      home: homeGoals,
      away: homeGoals === awayGoals ? awayGoals + 1 : awayGoals,
    },
    events: [
      {
        id: `event-${String(index + 1).padStart(2, '0')}-1`,
        minute: 12 + (index % 20),
        type: 'goal',
        teamId: homeTeamId,
        teamName: '',
        playerName: 'Mock striker',
      },
      {
        id: `event-${String(index + 1).padStart(2, '0')}-2`,
        minute: 58 + (index % 18),
        type: index % 3 === 0 ? 'yellow_card' : index % 3 === 1 ? 'red_card' : 'penalty',
        teamId: awayTeamId,
        teamName: '',
        playerName: 'Mock defender',
      },
    ],
  }
}

function createTournamentFixturesForGroups({ groups = [], teams = [], rules = {}, venue = '', baseDate = '', completedCount = 0, liveCount = 0 }) {
  const fixtures = []
  const teamMap = new Map((Array.isArray(teams) ? teams : []).map((team) => [String(team.id || '').trim(), team]))
  const roundRobinMode = rules.homeAwayEnabled ? 'double' : 'single'

  groups.forEach((group, groupIndex) => {
    const groupTeams = (Array.isArray(group?.teamIds) ? group.teamIds : [])
      .map((teamId) => teamMap.get(String(teamId || '').trim()))
      .filter(Boolean)

    const generated = createRoundRobinFixtures({
      group: {
        ...group,
        groupIndex,
      },
      teams: groupTeams,
      roundRobinMode,
      homeAwayEnabled: Boolean(rules.homeAwayEnabled),
      matchdaySpacingDays: 7,
      baseDate,
      venue,
    }).fixtures

    fixtures.push(...generated)
  })

  return fixtures.map((fixture, index) => {
    const completed = index < completedCount
    const live = index >= completedCount && index < completedCount + liveCount
    const result = buildFixtureScore(index, fixture.homeTeamId, fixture.awayTeamId)

    return {
      ...fixture,
      status: completed ? 'completed' : live ? 'live' : 'scheduled',
      score: completed || live ? result.score : { home: null, away: null },
      events: completed || live ? result.events.map((event) => ({
        ...event,
        teamName: event.teamId === fixture.homeTeamId ? fixture.homeTeamName : fixture.awayTeamName,
      })) : [],
      completedAt: completed ? `2026-04-${String((index % 24) + 1).padStart(2, '0')}T18:00:00.000Z` : '',
    }
  })
}

function buildStandingsFromFixtures(tournament) {
  return calculateTournamentStandings({
    tournament,
  }).groups
}

function createTournamentKnockoutDraft(settings = {}) {
  return {
    settings: createKnockoutSettingsSnapshot(settings),
    qualifiers: [],
    bracket: null,
    champion: null,
    generatedAt: '',
    updatedAt: '',
  }
}

function buildCompletedKnockoutBracket(tournament, settings = {}) {
  const qualification = selectTournamentQualifiers({
    tournament,
    settings,
  })

  if (!qualification.bracketSize || !qualification.qualifiers.length) {
    return null
  }

  const baseBracket = createKnockoutBracket({
    tournamentId: tournament.id,
    qualifiers: qualification.qualifiers,
    settings,
  }).bracket

  if (!baseBracket) {
    return null
  }

  let bracket = baseBracket
  const semifinalRound = bracket.rounds.find((round) => round.key === 'semifinal')

  if (semifinalRound?.matches?.[0]) {
    bracket = updateKnockoutMatchResult(bracket, semifinalRound.matches[0].id, {
      status: 'completed',
      homeScore: 2,
      awayScore: 1,
    }, settings).bracket
  }

  if (semifinalRound?.matches?.[1]) {
    bracket = updateKnockoutMatchResult(bracket, semifinalRound.matches[1].id, {
      status: 'completed',
      homeScore: 1,
      awayScore: 0,
    }, settings).bracket
  }

  const finalRound = bracket.rounds.find((round) => round.key === 'final')
  if (finalRound?.matches?.[0]) {
    bracket = updateKnockoutMatchResult(bracket, finalRound.matches[0].id, {
      status: 'completed',
      homeScore: 1,
      awayScore: 3,
    }, settings).bracket
  }

  return bracket
}

function normalizeTournamentKnockout(knockout = {}, tournament = null) {
  const source = knockout && typeof knockout === 'object' ? knockout : {}
  const settings = createKnockoutSettingsSnapshot({
    qualificationSlots: source.settings?.qualificationSlots ?? tournament?.groupDraw?.settings?.qualificationCount ?? 2,
    includeThirdPlaceTeams: source.settings?.includeThirdPlaceTeams ?? false,
    bestThirdPlaceTeams: source.settings?.bestThirdPlaceTeams ?? 0,
    thirdPlaceMatchEnabled: source.settings?.thirdPlaceMatchEnabled ?? false,
    extraTimeEnabled: source.settings?.extraTimeEnabled ?? tournament?.rules?.extraTimeEnabled ?? false,
    penaltyEnabled: source.settings?.penaltyEnabled ?? tournament?.rules?.penaltyEnabled ?? false,
    seededMode: source.settings?.seededMode ?? true,
    autoGenerateBracket: source.settings?.autoGenerateBracket ?? true,
  })

  const qualification = selectTournamentQualifiers({
    tournament,
    settings,
  })

  const baseBracket = source.bracket ? rebuildKnockoutProgression(deepClone(source.bracket), settings) : null
  const fallbackBracket = !baseBracket && qualification.bracketSize ? createKnockoutBracket({
    tournamentId: tournament?.id || '',
    qualifiers: qualification.qualifiers,
    settings,
  }).bracket : null
  const bracket = baseBracket || fallbackBracket || null

  return {
    ...createTournamentKnockoutDraft(settings),
    ...source,
    settings,
    qualifiers: Array.isArray(source.qualifiers) && source.qualifiers.length ? source.qualifiers.map((item) => deepClone(item)) : qualification.qualifiers,
    bracket,
    champion: bracket?.champion || source.champion || null,
    generatedAt: String(source.generatedAt || bracket?.generatedAt || ''),
    updatedAt: String(source.updatedAt || bracket?.updatedAt || ''),
  }
}

function createGroupName(index) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const safeIndex = Number(index) || 0
  if (safeIndex < letters.length) {
    return `Group ${letters[safeIndex]}`
  }

  return `Group ${safeIndex + 1}`
}

function createTournamentGroup(teamIds = [], index = 0, qualificationSlots = 2) {
  return {
    id: `group-${String(index + 1).padStart(2, '0')}`,
    name: createGroupName(index),
    teamIds: Array.isArray(teamIds) ? [...new Set(teamIds.map((teamId) => String(teamId).trim()).filter(Boolean))] : [],
    qualificationSlots,
    locked: false,
  }
}

export function createTournamentGroupDrawDraft(options = {}) {
  const groupCount = Math.max(1, Number(options.groupCount ?? TOURNAMENT_RULE_DEFAULTS.groupCount) || 1)
  const teamsPerGroup = Math.max(1, Number(options.teamsPerGroup ?? TOURNAMENT_RULE_DEFAULTS.teamsPerGroup) || 1)
  const qualificationCount = Math.max(
    1,
    Math.min(Number(options.qualificationCount ?? 2) || 2, teamsPerGroup),
  )

  return {
    mode: options.mode || 'automatic',
    locked: Boolean(options.locked),
    lastGeneratedAt: String(options.lastGeneratedAt || ''),
    settings: {
      groupCount,
      teamsPerGroup,
      qualificationCount,
      seededMode: Boolean(options.seededMode ?? true),
      autoFixtureGeneration: Boolean(options.autoFixtureGeneration ?? true),
    },
    groups: Array.from({ length: groupCount }, (_, index) =>
      createTournamentGroup([], index, qualificationCount),
    ),
  }
}

export function normalizeTournamentGroupDraw(groupDraw = {}, tournament = null) {
  const source = groupDraw && typeof groupDraw === 'object' ? groupDraw : {}
  const base = createTournamentGroupDrawDraft({
    groupCount: source.settings?.groupCount ?? source.groupCount ?? tournament?.rules?.groupCount ?? TOURNAMENT_RULE_DEFAULTS.groupCount,
    teamsPerGroup: source.settings?.teamsPerGroup ?? source.teamsPerGroup ?? tournament?.rules?.teamsPerGroup ?? TOURNAMENT_RULE_DEFAULTS.teamsPerGroup,
    qualificationCount:
      source.settings?.qualificationCount ?? source.qualificationCount ?? Math.max(1, Math.min(2, tournament?.rules?.teamsPerGroup || TOURNAMENT_RULE_DEFAULTS.teamsPerGroup)),
    seededMode: source.settings?.seededMode ?? source.seededMode ?? true,
    autoFixtureGeneration: source.settings?.autoFixtureGeneration ?? source.autoFixtureGeneration ?? true,
    mode: source.mode || 'automatic',
    locked: source.locked,
    lastGeneratedAt: source.lastGeneratedAt,
  })

  const groups = Array.isArray(source.groups) && source.groups.length
    ? source.groups.slice(0, base.settings.groupCount).map((group, index) => createTournamentGroup(
      Array.isArray(group?.teamIds) ? group.teamIds : [],
      index,
      Number(group?.qualificationSlots ?? base.settings.qualificationCount) || base.settings.qualificationCount,
    ))
    : base.groups

  while (groups.length < base.settings.groupCount) {
    groups.push(createTournamentGroup([], groups.length, base.settings.qualificationCount))
  }

  return {
    ...base,
    ...source,
    settings: {
      ...base.settings,
      ...source.settings,
    },
    groups,
    mode: source.mode || base.mode,
    locked: Boolean(source.locked ?? base.locked),
    lastGeneratedAt: String(source.lastGeneratedAt || base.lastGeneratedAt || ''),
  }
}

export function createTournamentDraft() {
  const nowYear = new Date().getFullYear()

  return {
    id: '',
    name: '',
    season: String(nowYear),
    sportType: TOURNAMENT_SPORT_TYPES[0],
    description: '',
    logo: '',
    banner: '',
    location: '',
    organizer: '',
    registrationOpenAt: '',
    registrationCloseAt: '',
    startAt: '',
    endAt: '',
    state: 'draft',
    registrationStatus: 'closed',
    visibility: 'private',
    rules: deepClone(TOURNAMENT_RULE_DEFAULTS),
    groupDraw: createTournamentGroupDrawDraft(),
    fixturesSettings: {
      roundRobinMode: 'single',
      homeAwayEnabled: Boolean(TOURNAMENT_RULE_DEFAULTS.homeAwayEnabled),
      matchdaySpacingDays: 7,
      baseDate: '',
      venue: '',
    },
    knockout: createTournamentKnockoutDraft({
      qualificationSlots: 2,
      includeThirdPlaceTeams: false,
      bestThirdPlaceTeams: 0,
      thirdPlaceMatchEnabled: false,
      extraTimeEnabled: Boolean(TOURNAMENT_RULE_DEFAULTS.extraTimeEnabled),
      penaltyEnabled: Boolean(TOURNAMENT_RULE_DEFAULTS.penaltyEnabled),
      seededMode: true,
      autoGenerateBracket: true,
    }),
    statistics: {
      registeredTeams: 0,
      totalTeams: 0,
      groupsCompleted: 0,
      fixturesGenerated: 0,
      matches: 0,
      completedMatches: 0,
      summary: null,
      analytics: null,
    },
    teams: [],
    fixtures: [],
    results: [],
    standings: [],
  }
}

export const mockTournaments = [
  {
    id: 'tournament-001',
    name: 'HFCCF National Youth League',
    season: currentSeasonLabel(),
    sportType: 'football',
    description: 'A flagship youth competition with group stages, knockout rounds, and official match tracking.',
    logo: '',
    banner: '',
    location: 'Olympic Stadium, Phnom Penh',
    organizer: 'HFCCF Sports Office',
    registrationOpenAt: '2026-03-20',
    registrationCloseAt: '2026-04-10',
    startAt: '2026-04-18',
    endAt: '2026-06-30',
    state: 'active',
    registrationStatus: 'closed',
    visibility: 'public',
    rules: {
      ...TOURNAMENT_RULE_DEFAULTS,
      groupCount: 4,
      teamsPerGroup: 4,
      knockoutEnabled: true,
      homeAwayEnabled: true,
      extraTimeEnabled: true,
      penaltyEnabled: true,
    },
    statistics: {
      registeredTeams: 16,
      totalTeams: 16,
      groupsCompleted: 4,
      fixturesGenerated: 32,
      matches: 48,
      completedMatches: 31,
    },
    groupDraw: normalizeTournamentGroupDraw({
      mode: 'automatic',
      locked: true,
      lastGeneratedAt: '2026-04-12',
      settings: {
        groupCount: 4,
        teamsPerGroup: 4,
        qualificationCount: 2,
        seededMode: true,
        autoFixtureGeneration: true,
      },
      groups: [
        createTournamentGroup(['team-001', 'team-005', 'team-009', 'team-013'], 0, 2),
        createTournamentGroup(['team-002', 'team-006', 'team-010', 'team-014'], 1, 2),
        createTournamentGroup(['team-003', 'team-007', 'team-011', 'team-015'], 2, 2),
        createTournamentGroup(['team-004', 'team-008', 'team-012', 'team-016'], 3, 2),
      ],
    }),
    teams: createTeamSeries(
      'team',
      [
        'Blue Phoenix',
        'River Hawks',
        'Mekong Stars',
        'Royal Tigers',
        'Amber Knights',
        'Golden Arrows',
        'City Strikers',
        'Eastern FC',
        'United Hearts',
        'Coastal Waves',
        'Harbor Lions',
        'Jade Rangers',
        'Phnom Stars',
        'Victory Temple',
        'Legacy United',
        'Young Warriors',
      ],
      [1, 2, 3, 4],
    ),
  },
  {
    id: 'tournament-002',
    name: 'HFCCF Inter-College Cup',
    season: '2025',
    sportType: 'basketball',
    description: 'Registration is closed and the tournament is ready for the group draw phase.',
    logo: '',
    banner: '',
    location: 'National Sports Complex',
    organizer: 'HFCCF Collegiate League',
    registrationOpenAt: '2026-02-10',
    registrationCloseAt: '2026-03-05',
    startAt: '2026-03-18',
    endAt: '2026-05-22',
    state: 'registration_closed',
    registrationStatus: 'closed',
    visibility: 'public',
    rules: {
      ...TOURNAMENT_RULE_DEFAULTS,
      groupCount: 2,
      teamsPerGroup: 6,
      knockoutEnabled: true,
      homeAwayEnabled: false,
      extraTimeEnabled: false,
      penaltyEnabled: false,
    },
    statistics: {
      registeredTeams: 8,
      totalTeams: 12,
      groupsCompleted: 0,
      fixturesGenerated: 0,
      matches: 0,
      completedMatches: 0,
    },
    groupDraw: normalizeTournamentGroupDraw({
      mode: 'automatic',
      locked: false,
      settings: {
        groupCount: 2,
        teamsPerGroup: 6,
        qualificationCount: 2,
        seededMode: true,
        autoFixtureGeneration: true,
      },
    }),
    teams: createTeamSeries(
      'team',
      [
        'City College Eagles',
        'Sunrise Falcons',
        'Urban Kings',
        'Maverick Lions',
        'Metro Titans',
        'Harbor Knights',
        'Skyline Dragons',
        'Union Panthers',
        'Nova Bears',
        'Prime Wolves',
        'Capital Owls',
        'Delta Sharks',
      ],
      [1, 2],
    ),
  },
  {
    id: 'tournament-003',
    name: 'HFCCF School Games',
    season: '2024 / 2025',
    sportType: 'volleyball',
    description: 'Group draws are complete and fixture generation is ready.',
    logo: '',
    banner: '',
    location: 'Regional Education Arena',
    organizer: 'School Sports Department',
    registrationOpenAt: '2025-09-01',
    registrationCloseAt: '2025-10-01',
    startAt: '2025-10-10',
    endAt: '2025-12-12',
    state: 'group_draw_completed',
    registrationStatus: 'closed',
    visibility: 'public',
    rules: {
      ...TOURNAMENT_RULE_DEFAULTS,
      groupCount: 3,
      teamsPerGroup: 4,
      knockoutEnabled: true,
      homeAwayEnabled: false,
      extraTimeEnabled: false,
      penaltyEnabled: true,
    },
    statistics: {
      registeredTeams: 12,
      totalTeams: 12,
      groupsCompleted: 3,
      fixturesGenerated: 0,
      matches: 0,
      completedMatches: 0,
    },
    groupDraw: normalizeTournamentGroupDraw({
      mode: 'manual',
      locked: true,
      lastGeneratedAt: '2025-10-02',
      settings: {
        groupCount: 3,
        teamsPerGroup: 4,
        qualificationCount: 2,
        seededMode: true,
        autoFixtureGeneration: false,
      },
      groups: [
        createTournamentGroup(['team-001', 'team-004', 'team-007', 'team-010'], 0, 2),
        createTournamentGroup(['team-002', 'team-005', 'team-008', 'team-011'], 1, 2),
        createTournamentGroup(['team-003', 'team-006', 'team-009', 'team-012'], 2, 2),
      ],
    }),
    teams: createTeamSeries(
      'team',
      [
        'North Ridge',
        'Westview',
        'Central Academy',
        'Riverdale',
        'Summit School',
        'Lakewood',
        'Heritage College',
        'Pioneer High',
        'Greenfield',
        'Sunset Academy',
        'Beacon Institute',
        'Starlight School',
      ],
      [1, 2, 3],
    ),
  },
  {
    id: 'tournament-004',
    name: 'HFCCF Legacy Championship',
    season: '2024',
    sportType: 'badminton',
    description: 'A completed championship with archived records and final results.',
    logo: '',
    banner: '',
    location: 'Indoor Sports Hall',
    organizer: 'HFCCF Legacy Board',
    registrationOpenAt: '2025-01-05',
    registrationCloseAt: '2025-01-20',
    startAt: '2025-02-01',
    endAt: '2025-03-15',
    state: 'completed',
    registrationStatus: 'closed',
    visibility: 'private',
    rules: {
      ...TOURNAMENT_RULE_DEFAULTS,
      groupCount: 2,
      teamsPerGroup: 8,
      knockoutEnabled: true,
      homeAwayEnabled: false,
      extraTimeEnabled: true,
      penaltyEnabled: true,
    },
    statistics: {
      registeredTeams: 14,
      totalTeams: 16,
      groupsCompleted: 2,
      fixturesGenerated: 24,
      matches: 36,
      completedMatches: 36,
    },
    groupDraw: normalizeTournamentGroupDraw({
      mode: 'automatic',
      locked: true,
      lastGeneratedAt: '2025-03-18',
      settings: {
        groupCount: 2,
        teamsPerGroup: 8,
        qualificationCount: 2,
        seededMode: false,
        autoFixtureGeneration: true,
      },
      groups: [
        createTournamentGroup(['team-001', 'team-003', 'team-005', 'team-007', 'team-009', 'team-011', 'team-013'], 0, 2),
        createTournamentGroup(['team-002', 'team-004', 'team-006', 'team-008', 'team-010', 'team-012', 'team-014'], 1, 2),
      ],
    }),
    teams: createTeamSeries(
      'team',
      [
        'Eastern Dragons',
        'Silver Arrows',
        'Golden Kites',
        'Harmony Club',
        'Northern Lights',
        'Blue Comets',
        'Amber Foxes',
        'Royal Waves',
        'Pacific Eagles',
        'Mountain Lions',
        'City Storm',
        'Nova Chargers',
        'Tidal Force',
        'Desert Falcons',
        'Prime Titans',
        'Crescent Stars',
      ],
      [1, 2, 3, 4],
    ),
  },
]

const tournament001Fixtures = createTournamentFixturesForGroups({
  groups: mockTournaments[0].groupDraw.groups,
  teams: mockTournaments[0].teams,
  rules: mockTournaments[0].rules,
  venue: mockTournaments[0].location,
  baseDate: mockTournaments[0].startAt,
  completedCount: 31,
  liveCount: 4,
})

mockTournaments[0].fixtures = tournament001Fixtures
mockTournaments[0].results = tournament001Fixtures.filter((fixture) => fixture.status === 'completed')
mockTournaments[0].standings = buildStandingsFromFixtures(mockTournaments[0])
mockTournaments[0].statistics = {
  ...mockTournaments[0].statistics,
  fixturesGenerated: tournament001Fixtures.length,
  matches: tournament001Fixtures.length,
  completedMatches: tournament001Fixtures.filter((fixture) => fixture.status === 'completed').length,
}

const tournament004Fixtures = createTournamentFixturesForGroups({
  groups: mockTournaments[3].groupDraw.groups,
  teams: mockTournaments[3].teams,
  rules: mockTournaments[3].rules,
  venue: mockTournaments[3].location,
  baseDate: mockTournaments[3].startAt,
  completedCount: 28,
  liveCount: 0,
})

mockTournaments[3].fixtures = tournament004Fixtures
mockTournaments[3].results = tournament004Fixtures.filter((fixture) => fixture.status === 'completed')
mockTournaments[3].standings = buildStandingsFromFixtures(mockTournaments[3])
mockTournaments[3].statistics = {
  ...mockTournaments[3].statistics,
  fixturesGenerated: tournament004Fixtures.length,
  matches: tournament004Fixtures.length,
  completedMatches: tournament004Fixtures.filter((fixture) => fixture.status === 'completed').length,
}

const tournament004KnockoutSettings = {
  qualificationSlots: 2,
  includeThirdPlaceTeams: false,
  bestThirdPlaceTeams: 0,
  thirdPlaceMatchEnabled: false,
  extraTimeEnabled: true,
  penaltyEnabled: true,
  seededMode: true,
  autoGenerateBracket: true,
}

const tournament004KnockoutBracket = buildCompletedKnockoutBracket(mockTournaments[3], tournament004KnockoutSettings)

mockTournaments[3].knockout = normalizeTournamentKnockout({
  settings: tournament004KnockoutSettings,
  bracket: tournament004KnockoutBracket,
  qualifiers: selectTournamentQualifiers({
    tournament: mockTournaments[3],
    settings: tournament004KnockoutSettings,
  }).qualifiers,
  generatedAt: '2025-03-19T09:00:00.000Z',
  updatedAt: '2025-03-19T11:30:00.000Z',
}, mockTournaments[3])

export function cloneTournamentRecord(tournament) {
  return deepClone(tournament)
}

export function createMockTournaments() {
  return mockTournaments.map((tournament) => cloneTournamentRecord(tournament))
}

export function createMockTournamentStats(tournaments = mockTournaments) {
  const items = Array.isArray(tournaments) ? tournaments : []

  return {
    total: items.length,
    active: items.filter((item) => item.state === 'active').length,
    registrationOpen: items.filter((item) => item.state === 'registration_open').length,
    completed: items.filter((item) => item.state === 'completed').length,
    totalRegisteredTeams: items.reduce((sum, item) => sum + Number(item.statistics?.registeredTeams || 0), 0),
    totalMatches: items.reduce((sum, item) => sum + Number(item.statistics?.matches || 0), 0),
  }
}

export function createMockTournamentRules() {
  return {
    ...TOURNAMENT_RULE_DEFAULTS,
  }
}

export function createMockTournamentGroupDraw() {
  return createTournamentGroupDrawDraft()
}

export function createMockTournamentSelectors() {
  return {
    sportTypes: [...TOURNAMENT_SPORT_TYPES],
    registrationStatuses: [...TOURNAMENT_REGISTRATION_STATUSES],
    visibilityOptions: [...TOURNAMENT_VISIBILITY_OPTIONS],
    states: [...TOURNAMENT_STATES],
  }
}

export {
  createTournamentKnockoutDraft,
  normalizeTournamentKnockout,
}
