import { createTournamentDraft, normalizeTournamentGroupDraw, normalizeTournamentKnockout } from '../mocks/tournaments.mock'
import { normalizeTournamentState } from '../composables/useTournamentStateMachine'

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
  return String(value ?? '').trim()
}

function normalizeDateValue(value) {
  return normalizeText(value)
}

function normalizeVisibility(value, fallback = 'private') {
  const text = normalizeText(value || fallback).toLowerCase()
  return ['public', 'private', 'hidden'].includes(text) ? text : fallback
}

function normalizeRegistrationStatus(value, state, fallback = 'closed') {
  const text = normalizeText(value).toLowerCase()
  if (text) {
    return text
  }

  const derivedState = normalizeTournamentState(state)
  if (derivedState === 'registration_open') return 'open'
  if (derivedState === 'registration_closed') return 'closed'
  return fallback
}

function normalizeMediaPath(value) {
  const text = normalizeText(value)

  if (!text) return ''
  if (text.startsWith('blob:') || text.startsWith('data:')) return ''

  return text
}

function normalizeRules(rules = {}, fallback = {}) {
  return {
    ...deepClone(fallback),
    ...(rules && typeof rules === 'object' ? deepClone(rules) : {}),
  }
}

function normalizeSettings(settings = {}, fallback = {}) {
  return {
    ...deepClone(fallback),
    ...(settings && typeof settings === 'object' ? deepClone(settings) : {}),
  }
}

function normalizeStatistics(statistics = {}, fallback = {}) {
  return {
    ...deepClone(fallback),
    ...(statistics && typeof statistics === 'object' ? deepClone(statistics) : {}),
  }
}

function normalizeCollection(items = []) {
  return Array.isArray(items) ? items.map((item) => deepClone(item)) : []
}

function normalizeCounts(source = {}, fallback = {}) {
  return {
    teamsCount: Number(source.teamsCount ?? source.teams_count ?? fallback.teamsCount ?? fallback.teams_count ?? 0),
    matchesCount: Number(source.matchesCount ?? source.matches_count ?? fallback.matchesCount ?? fallback.matches_count ?? 0),
    standingsCount: Number(source.standingsCount ?? source.standings_count ?? fallback.standingsCount ?? fallback.standings_count ?? 0),
    groupsCount: Number(source.groupsCount ?? source.groups_count ?? fallback.groupsCount ?? fallback.groups_count ?? 0),
    knockoutRoundsCount: Number(source.knockoutRoundsCount ?? source.knockout_rounds_count ?? fallback.knockoutRoundsCount ?? fallback.knockout_rounds_count ?? 0),
    matchEventsCount: Number(source.matchEventsCount ?? source.match_events_count ?? fallback.matchEventsCount ?? fallback.match_events_count ?? 0),
  }
}

function mergeWithFallback(source, fallback) {
  const base = fallback ? deepClone(fallback) : createTournamentDraft()
  const payload = source && typeof source === 'object' ? deepClone(source) : {}
  const state = normalizeTournamentState(payload.state || payload.status || base.state)

  return {
    ...base,
    ...payload,
    id: normalizeText(payload.id || payload._id || base.id),
    tournamentCode: normalizeText(payload.tournamentCode || payload.tournament_code || base.tournamentCode),
    name: normalizeText(payload.name || base.name),
    title: normalizeText(payload.title || payload.name || base.title || base.name),
    season: normalizeText(payload.season || base.season),
    sportType: normalizeText(payload.sportType || payload.sport_type || payload.tournamentType || payload.tournament_type || base.sportType),
    tournamentType: normalizeText(payload.tournamentType || payload.tournament_type || payload.sportType || payload.sport_type || base.tournamentType),
    state,
    status: state,
    registrationStatus: normalizeRegistrationStatus(
      payload.registrationStatus || payload.registration_status,
      state,
      base.registrationStatus,
    ),
    visibility: normalizeVisibility(payload.visibility || base.visibility, base.visibility),
    registrationOpenAt: normalizeDateValue(payload.registrationOpenAt || payload.registration_open_at || base.registrationOpenAt),
    registrationCloseAt: normalizeDateValue(payload.registrationCloseAt || payload.registration_close_at || base.registrationCloseAt),
    startAt: normalizeDateValue(payload.startAt || payload.startsAt || payload.starts_at || base.startAt),
    endAt: normalizeDateValue(payload.endAt || payload.endsAt || payload.ends_at || base.endAt),
    startsAt: normalizeDateValue(payload.startsAt || payload.starts_at || payload.startAt || base.startsAt || base.startAt),
    endsAt: normalizeDateValue(payload.endsAt || payload.ends_at || payload.endAt || base.endsAt || base.endAt),
    description: normalizeText(payload.description || base.description),
    logoPath: normalizeMediaPath(payload.logoPath || payload.logo_path || base.logoPath),
    bannerPath: normalizeMediaPath(payload.bannerPath || payload.banner_path || base.bannerPath),
    logo: normalizeText(payload.logoUrl || payload.logo || payload.logo_path || base.logo || ''),
    banner: normalizeText(payload.bannerUrl || payload.banner || payload.banner_path || base.banner || ''),
    location: normalizeText(payload.location || base.location),
    organizer: normalizeText(payload.organizer || base.organizer),
    rules: normalizeRules(payload.rules, base.rules),
    settings: normalizeSettings(payload.settings, base.settings),
    teams: normalizeCollection(payload.teams || base.teams),
    fixtures: normalizeCollection(payload.fixtures || base.fixtures),
    results: normalizeCollection(payload.results || base.results),
    standings: normalizeCollection(payload.standings || base.standings),
    groupDraw: normalizeTournamentGroupDraw(payload.groupDraw || payload.group_draw || base.groupDraw, {
      ...base,
      ...payload,
    }),
    knockout: normalizeTournamentKnockout(payload.knockout || base.knockout, {
      ...base,
      ...payload,
    }),
    statistics: normalizeStatistics(payload.statistics, base.statistics),
    createdByUserId: normalizeText(payload.createdByUserId || payload.created_by_user_id || base.createdByUserId),
    createdAt: normalizeDateValue(payload.createdAt || payload.created_at || base.createdAt),
    updatedAt: normalizeDateValue(payload.updatedAt || payload.updated_at || base.updatedAt),
    deletedAt: normalizeDateValue(payload.deletedAt || payload.deleted_at || base.deletedAt),
    ...normalizeCounts(payload, base),
    raw: payload,
  }
}

export function normalizeTournamentRecord(source, fallback = null) {
  return mergeWithFallback(source, fallback || createTournamentDraft())
}

export function normalizeTournamentListItems(items = []) {
  return Array.isArray(items) ? items.map((item) => normalizeTournamentRecord(item)) : []
}

export function normalizeTournamentListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const payload = response?.data?.data ?? response?.data ?? {}
  const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : []
  const pagination = payload?.pagination || payload?.meta || {}

  return {
    items: normalizeTournamentListItems(items),
    pagination: {
      page: Number(pagination.page || pagination.current_page || fallbackPage || 1),
      perPage: Number(pagination.perPage || pagination.per_page || fallbackPerPage || 10),
      total: Number(pagination.total || items.length || 0),
      totalPages: Number(pagination.totalPages || pagination.last_page || 1),
    },
  }
}

export function normalizeTournamentDetailResponse(response) {
  const payload = response?.data?.data ?? response?.data ?? {}
  const tournament = payload?.tournament || payload
  return normalizeTournamentRecord(tournament)
}

export function normalizeTournamentMutationResponse(response, fallback = null) {
  const payload = response?.data?.data ?? response?.data ?? {}
  return normalizeTournamentRecord(payload?.tournament || payload, fallback)
}

export function buildTournamentRequestPayload(payload = {}) {
  const currentState = normalizeTournamentState(payload.state || payload.status)

  return {
    tournament_code: normalizeText(payload.tournamentCode || payload.tournament_code),
    slug: normalizeText(payload.slug),
    name: normalizeText(payload.name),
    season: normalizeText(payload.season),
    tournament_type: normalizeText(payload.tournamentType || payload.tournament_type || payload.sportType || payload.sport_type),
    status: currentState,
    visibility: normalizeVisibility(payload.visibility),
    registration_open_at: normalizeDateValue(payload.registrationOpenAt || payload.registration_open_at),
    registration_close_at: normalizeDateValue(payload.registrationCloseAt || payload.registration_close_at),
    starts_at: normalizeDateValue(payload.startAt || payload.startsAt || payload.starts_at),
    ends_at: normalizeDateValue(payload.endAt || payload.endsAt || payload.ends_at),
    description: normalizeText(payload.description),
    logo_path: normalizeMediaPath(payload.logoPath || payload.logo_path || payload.logo),
    banner_path: normalizeMediaPath(payload.bannerPath || payload.banner_path || payload.banner),
    location: normalizeText(payload.location),
    organizer: normalizeText(payload.organizer),
    rules: normalizeRules(payload.rules),
    settings: normalizeSettings(payload.settings),
  }
}
