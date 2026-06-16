import { computed, ref } from 'vue'
import {
  cloneTournamentRecord,
  createMockTournaments,
  createTournamentDraft,
  normalizeTournamentGroupDraw,
  normalizeTournamentKnockout,
} from '../mocks/tournaments.mock'
import { canTransitionTournament, normalizeTournamentState } from './useTournamentStateMachine'

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

function normalizeText(value) {
  return String(value || '').trim()
}

function normalizeRules(rules = {}) {
  return {
    groupCount: Number(rules.groupCount ?? 0),
    teamsPerGroup: Number(rules.teamsPerGroup ?? 0),
    pointsWin: Number(rules.pointsWin ?? 3),
    pointsDraw: Number(rules.pointsDraw ?? 1),
    pointsLoss: Number(rules.pointsLoss ?? 0),
    knockoutEnabled: Boolean(rules.knockoutEnabled),
    homeAwayEnabled: Boolean(rules.homeAwayEnabled),
    extraTimeEnabled: Boolean(rules.extraTimeEnabled),
    penaltyEnabled: Boolean(rules.penaltyEnabled),
  }
}

export function normalizeTournamentStatistics(statistics = {}) {
  const source = statistics && typeof statistics === 'object' ? statistics : {}

  return {
    registeredTeams: Number(source.registeredTeams ?? 0),
    totalTeams: Number(source.totalTeams ?? 0),
    groupsCompleted: Number(source.groupsCompleted ?? 0),
    fixturesGenerated: Number(source.fixturesGenerated ?? 0),
    matches: Number(source.matches ?? 0),
    completedMatches: Number(source.completedMatches ?? 0),
    summary: deepClone(source.summary || null),
    analytics: deepClone(source.analytics || null),
  }
}

function normalizeTournamentInput(payload = {}) {
  const source = payload && typeof payload === 'object' ? payload : {}
  const base = createTournamentDraft()

  return {
    ...base,
    ...deepClone(source),
    id: normalizeText(source.id || base.id),
    name: normalizeText(source.name),
    season: normalizeText(source.season || base.season),
    sportType: normalizeText(source.sportType || base.sportType),
    description: normalizeText(source.description),
    logo: normalizeText(source.logo),
    banner: normalizeText(source.banner),
    location: normalizeText(source.location),
    organizer: normalizeText(source.organizer),
    registrationOpenAt: normalizeText(source.registrationOpenAt),
    registrationCloseAt: normalizeText(source.registrationCloseAt),
    startAt: normalizeText(source.startAt),
    endAt: normalizeText(source.endAt),
    state: normalizeTournamentState(source.state || base.state),
    registrationStatus: normalizeText(source.registrationStatus || base.registrationStatus) || 'closed',
    visibility: normalizeText(source.visibility || base.visibility) || 'private',
    rules: normalizeRules(source.rules || base.rules),
    groupDraw: normalizeTournamentGroupDraw(source.groupDraw || base.groupDraw, source),
    fixturesSettings: {
      roundRobinMode: String(source.fixturesSettings?.roundRobinMode || base.fixturesSettings.roundRobinMode || 'single').trim().toLowerCase() === 'double'
        ? 'double'
        : 'single',
      homeAwayEnabled: Boolean(source.fixturesSettings?.homeAwayEnabled ?? base.fixturesSettings.homeAwayEnabled),
      matchdaySpacingDays: Number(source.fixturesSettings?.matchdaySpacingDays ?? base.fixturesSettings.matchdaySpacingDays ?? 7),
      baseDate: normalizeText(source.fixturesSettings?.baseDate ?? base.fixturesSettings.baseDate),
      venue: normalizeText(source.fixturesSettings?.venue ?? base.fixturesSettings.venue),
    },
    statistics: normalizeTournamentStatistics({
      ...base.statistics,
      ...deepClone(source.statistics || {}),
    }),
    teams: Array.isArray(source.teams) ? source.teams.map((team) => deepClone(team)) : [],
    fixtures: Array.isArray(source.fixtures) ? source.fixtures.map((fixture) => deepClone(fixture)) : [],
    results: Array.isArray(source.results) ? source.results.map((result) => deepClone(result)) : [],
    standings: Array.isArray(source.standings) ? source.standings.map((standing) => deepClone(standing)) : [],
    knockout: normalizeTournamentKnockout(source.knockout || base.knockout, {
      ...base,
      ...deepClone(source),
    }),
  }
}

const catalog = ref(createMockTournaments().map((tournament) => normalizeTournamentInput(tournament)))

let nextTournamentId = catalog.value.length + 1

function generateTournamentId() {
  const id = `tournament-${String(nextTournamentId).padStart(3, '0')}`
  nextTournamentId += 1
  return id
}

function findTournamentIndex(id) {
  const targetId = normalizeText(id)

  if (!targetId) return -1

  return catalog.value.findIndex((item) => String(item.id) === targetId)
}

export function useTournamentCatalog() {
  const tournaments = computed(() => catalog.value.map((item) => cloneTournamentRecord(item)))

  function getTournamentById(id) {
    const index = findTournamentIndex(id)
    return index >= 0 ? cloneTournamentRecord(catalog.value[index]) : null
  }

  function createTournament(payload) {
    const record = normalizeTournamentInput({
      ...payload,
      id: payload?.id || generateTournamentId(),
    })

    catalog.value.unshift(record)

    return cloneTournamentRecord(record)
  }

  function updateTournament(id, payload) {
    const index = findTournamentIndex(id)

    if (index < 0) return null

    const current = catalog.value[index]
    const record = normalizeTournamentInput({
      ...current,
      ...payload,
      id: current.id,
    })

    catalog.value.splice(index, 1, record)

    return cloneTournamentRecord(record)
  }

  function transitionTournament(id, nextState) {
    const index = findTournamentIndex(id)

    if (index < 0) return null

    const current = catalog.value[index]

    if (!canTransitionTournament(current.state, nextState)) {
      return null
    }

    const record = normalizeTournamentInput({
      ...current,
      state: nextState,
      registrationStatus: nextState === 'registration_open' ? 'open' : nextState === 'registration_closed' ? 'closed' : current.registrationStatus,
    })

    catalog.value.splice(index, 1, record)

    return cloneTournamentRecord(record)
  }

  function removeTournament(id) {
    const index = findTournamentIndex(id)

    if (index < 0) return false

    catalog.value.splice(index, 1)

    return true
  }

  function resetTournamentCatalog() {
    catalog.value = createMockTournaments().map((tournament) => normalizeTournamentInput(tournament))
    nextTournamentId = catalog.value.length + 1
  }

  return {
    tournaments,
    getTournamentById,
    createTournament,
    updateTournament,
    transitionTournament,
    removeTournament,
    resetTournamentCatalog,
  }
}
