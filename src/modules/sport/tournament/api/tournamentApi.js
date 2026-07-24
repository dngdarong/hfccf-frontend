import http from '@/services/http'
import { buildQueryParams } from '@/services/api'
import {
  buildTournamentRequestPayload,
  normalizeTournamentDetailResponse,
  normalizeTournamentListResponse,
  normalizeTournamentMutationResponse,
} from './tournamentMappers'

const idOf = (value) => String(value ?? '').trim()
const envelope = (response) => response?.data?.data ?? response?.data ?? {}
const collection = (value) => Array.isArray(value) ? value : []

function normalizeTeam(team = {}, relationship = {}) {
  const source = team && typeof team === 'object' ? team : {}
  return {
    id: idOf(relationship.id || source.id || relationship.teamId || source.teamId),
    relationshipId: idOf(relationship.id),
    teamId: idOf(relationship.teamId || relationship.team_id || source.id || source.teamId),
    name: String(source.name || relationship.teamName || '').trim(),
    coach: source.coach || relationship.coach || null,
    logo: source.logo || source.logoUrl || null,
    joinedAt: relationship.joinedAt || relationship.joined_at || null,
    raw: source,
  }
}

function normalizeGroup(group = {}) {
  const teams = collection(group.teams).map((membership) => normalizeTeam(membership.team || membership, membership))
  return {
    id: idOf(group.id),
    tournamentId: idOf(group.tournamentId || group.tournament_id),
    name: group.name || '',
    code: group.code || '',
    position: Number(group.position ?? 0),
    status: group.status || 'draft',
    finalized: Boolean(group.finalizedAt || group.finalized_at || group.status === 'finalized'),
    locked: Boolean(group.finalizedAt || group.finalized_at || group.status === 'finalized'),
    finalizedAt: group.finalizedAt || group.finalized_at || null,
    qualificationSlots: Number(group.qualificationSlots ?? group.qualification_slots ?? 0),
    teams,
    teamIds: teams.map((team) => team.teamId).filter(Boolean),
    raw: group,
  }
}

function normalizeMatch(match = {}) {
  const homeTeam = normalizeTeam(match.homeTeam || {}, { teamId: match.homeTeamId })
  const awayTeam = normalizeTeam(match.awayTeam || {}, { teamId: match.awayTeamId })
  return {
    id: idOf(match.id),
    matchCode: match.matchCode || null,
    tournamentId: idOf(match.tournamentId || match.tournament_id),
    groupId: idOf(match.groupId || match.group_id),
    knockoutRoundId: idOf(match.knockoutRoundId || match.knockout_round_id),
    stage: match.competitionType || (match.knockoutRoundId ? 'knockout' : 'group'),
    roundName: match.roundName || match.knockoutRound?.name || null,
    matchday: match.matchday ?? null,
    homeTeamId: idOf(match.homeTeamId || homeTeam.teamId),
    awayTeamId: idOf(match.awayTeamId || awayTeam.teamId),
    homeTeam,
    awayTeam,
    homeTeamName: homeTeam.name,
    awayTeamName: awayTeam.name,
    scheduledAt: match.scheduledAt || match.scheduled_at || null,
    dateTime: match.scheduledAt || match.scheduled_at || null,
    venue: match.venue || null,
    status: match.status || 'scheduled',
    score: { home: match.homeScore ?? null, away: match.awayScore ?? null },
    homeScore: match.homeScore ?? null,
    awayScore: match.awayScore ?? null,
    extraTimeHomeScore: match.extraTimeHomeScore ?? null,
    extraTimeAwayScore: match.extraTimeAwayScore ?? null,
    penaltyHomeScore: match.penaltyHomeScore ?? null,
    penaltyAwayScore: match.penaltyAwayScore ?? null,
    winnerTeamId: idOf(match.winnerTeamId),
    currentPeriod: match.currentPeriod || null,
    notes: match.notes || null,
    raw: match,
  }
}

function normalizeStanding(row = {}) {
  return {
    groupId: idOf(row.groupId || row.group_id),
    groupCode: row.groupCode || row.group_code || null,
    groupName: row.groupName || row.group_name || null,
    teamId: idOf(row.teamId || row.team_id),
    teamName: row.teamName || row.team_name || '',
    rank: Number(row.rankPosition ?? row.rank ?? row.rank_position ?? 0),
    rankPosition: Number(row.rankPosition ?? row.rank_position ?? row.rank ?? 0),
    played: Number(row.played ?? 0),
    won: Number(row.wins ?? row.won ?? 0),
    drawn: Number(row.draws ?? row.drawn ?? 0),
    lost: Number(row.losses ?? row.lost ?? 0),
    goalsFor: Number(row.goalsFor ?? row.goals_for ?? 0),
    goalsAgainst: Number(row.goalsAgainst ?? row.goals_against ?? 0),
    goalDifference: Number(row.goalDifference ?? row.goal_difference ?? 0),
    points: Number(row.points ?? 0),
    qualified: Boolean(row.qualified),
    qualificationState: row.qualified ? 'qualified' : null,
    raw: row,
  }
}

function normalizeEvent(event = {}) {
  return {
    id: idOf(event.id),
    matchId: idOf(event.matchId || event.match_id),
    playerId: idOf(event.playerId || event.player_id),
    teamId: idOf(event.teamId || event.team_id),
    eventType: event.eventType || event.event_type || '',
    type: event.eventType || event.event_type || '',
    minute: Number(event.minute ?? 0),
    extraMinute: event.stoppageMinute ?? event.stoppage_minute ?? event.extraTimeMinute ?? event.extra_time_minute ?? null,
    metadata: event.metadata || {},
    notes: event.description || event.notes || null,
    raw: event,
  }
}

function normalizeKnockoutRounds(rounds = [], matches = []) {
  return collection(rounds).map((round) => ({
    id: idOf(round.id),
    roundName: round.name || '',
    name: round.name || '',
    order: Number(round.position ?? round.order ?? 0),
    position: Number(round.position ?? round.order ?? 0),
    status: round.status || 'scheduled',
    bracketSize: Number(round.bracketSize ?? round.bracket_size ?? 0),
    completedAt: round.completedAt || round.completed_at || null,
    matches: collection(round.matches).length
      ? collection(round.matches).map(normalizeMatch)
      : matches.filter((match) => idOf(match.knockoutRoundId) === idOf(round.id)),
    metadata: round.metadata || {},
    raw: round,
  }))
}

function normalizeWorkflowResponse(response) {
  const data = envelope(response)
  return {
    ...data,
    tournamentId: idOf(data.tournamentId || data.tournament_id),
    groups: collection(data.groups).map(normalizeGroup),
    matches: collection(data.matches).map(normalizeMatch),
    fixtures: collection(data.fixtures || data.matches).map(normalizeMatch),
    standings: collection(data.standings).map(normalizeStanding),
    events: collection(data.events).map(normalizeEvent),
    raw: data,
  }
}

export async function listTournaments(
  { page = 1, perPage = 10, search = '', status = '', type = '', sortBy = 'created_at', sortDirection = 'desc' } = {},
  options = {},
) {
  const response = await http.get('/sport/tournaments', {
    params: buildQueryParams({
      page,
      per_page: perPage,
      search,
      status,
      type,
      sort_by: sortBy,
      sort_direction: sortDirection,
    }),
    signal: options.signal,
  })

  return normalizeTournamentListResponse(response, page, perPage)
}

export async function getTournament(id, options = {}) {
  const tournamentId = String(id ?? '').trim()
  if (!tournamentId) return null

  const response = await http.get(`/sport/tournaments/${encodeURIComponent(tournamentId)}`, {
    signal: options.signal,
  })

  return normalizeTournamentDetailResponse(response)
}

export async function createTournament(payload = {}) {
  const response = await http.post('/sport/tournaments', buildTournamentRequestPayload(payload))
  return normalizeTournamentMutationResponse(response, payload)
}

export async function updateTournament(id, payload = {}) {
  const tournamentId = String(id ?? '').trim()
  if (!tournamentId) throw new Error('Tournament id is required.')

  const response = await http.put(`/sport/tournaments/${encodeURIComponent(tournamentId)}`, buildTournamentRequestPayload(payload))
  return normalizeTournamentMutationResponse(response, payload)
}

export async function deleteTournament(id) {
  const tournamentId = String(id ?? '').trim()
  if (!tournamentId) return false

  await http.delete(`/sport/tournaments/${encodeURIComponent(tournamentId)}`)
  return true
}

export async function archiveTournament(id) {
  return deleteTournament(id)
}

export const fetchTournamentList = listTournaments
export const fetchTournamentDetail = getTournament

export async function addTournamentTeam(tournamentId, payload = {}) {
  const id = idOf(tournamentId)
  const teamId = idOf(typeof payload === 'object' ? payload.teamId || payload.team_id : payload)
  const response = await http.post(`/sport/tournaments/${encodeURIComponent(id)}/teams`, { team_id: teamId })
  const data = envelope(response)
  return { tournament: data.tournament ? normalizeTournamentMutationResponse(response) : null, standings: collection(data.standings).map(normalizeStanding) }
}

export async function removeTournamentTeam(tournamentId, teamId) {
  const id = idOf(tournamentId)
  const response = await http.delete(`/sport/tournaments/${encodeURIComponent(id)}/teams/${encodeURIComponent(idOf(teamId))}`)
  const data = envelope(response)
  return { tournament: data.tournament ? normalizeTournamentMutationResponse(response) : null, standings: collection(data.standings).map(normalizeStanding) }
}

export async function fetchTournamentGroups(tournamentId, options = {}) {
  const response = await http.get(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/groups`, { signal: options.signal })
  return normalizeWorkflowResponse(response)
}

export async function drawTournamentGroups(tournamentId, payload = {}, options = {}) {
  const response = await http.post(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/groups/draw`, payload, { signal: options.signal })
  return normalizeWorkflowResponse(response)
}

export async function finalizeTournamentGroups(tournamentId, payload = {}, options = {}) {
  const response = await http.post(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/groups/finalize`, payload, { signal: options.signal })
  return normalizeWorkflowResponse(response)
}

export async function fetchTournamentFixtures(tournamentId, options = {}) {
  const response = await http.get(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/fixtures`, { signal: options.signal })
  return normalizeWorkflowResponse(response)
}

export async function generateTournamentFixtures(tournamentId, payload = {}, options = {}) {
  const response = await http.post(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/fixtures/generate`, payload, { signal: options.signal })
  return normalizeWorkflowResponse(response)
}

export async function fetchTournamentStandings(tournamentId, params = {}, options = {}) {
  const response = await http.get(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/standings`, { params, signal: options.signal })
  return normalizeWorkflowResponse(response)
}

export async function recalculateTournamentStandings(tournamentId, payload = {}, options = {}) {
  const response = await http.post(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/recalculate-standings`, payload, { signal: options.signal })
  return normalizeWorkflowResponse(response)
}

export async function fetchTournamentResults(tournamentId, options = {}) {
  const response = await http.get(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/results`, { signal: options.signal })
  return normalizeWorkflowResponse(response)
}

export async function fetchTournamentResult(tournamentId, matchId, options = {}) {
  const response = await http.get(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/results/${encodeURIComponent(idOf(matchId))}`, { signal: options.signal })
  const data = normalizeWorkflowResponse(response)
  return { ...data, match: normalizeMatch(envelope(response).match), events: collection(envelope(response).events).map(normalizeEvent) }
}

function resultPayload(payload = {}) {
  const fields = ['homeScore','awayScore','extraTimeHomeScore','extraTimeAwayScore','penaltyHomeScore','penaltyAwayScore','winnerTeamId','status','currentPeriod','notes']
  const output = {}
  fields.forEach((field) => { if (Object.prototype.hasOwnProperty.call(payload, field)) output[field.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)] = payload[field] })
  return output
}

export async function updateTournamentResult(tournamentId, matchId, payload = {}, options = {}) {
  const response = await http.put(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/results/${encodeURIComponent(idOf(matchId))}`, resultPayload(payload), { signal: options.signal })
  const data = envelope(response)
  return { match: normalizeMatch(data.match), standings: collection(data.standings).map(normalizeStanding), raw: data }
}

export async function addTournamentMatchEvent(tournamentId, matchId, payload = {}, options = {}) {
  const response = await http.post(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/results/${encodeURIComponent(idOf(matchId))}/events`, payload, { signal: options.signal })
  const data = envelope(response)
  return { event: normalizeEvent(data.event), match: normalizeMatch(data.match), raw: data }
}

export async function fetchTournamentStatistics(tournamentId, options = {}) {
  const response = await http.get(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/statistics`, { signal: options.signal })
  return envelope(response).statistics || {}
}

export async function fetchTournamentKnockout(tournamentId, options = {}) {
  const response = await http.get(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/knockout`, { signal: options.signal })
  const data = normalizeWorkflowResponse(response)
  return { ...data, knockout: { rounds: normalizeKnockoutRounds(data.raw.rounds, data.matches), matches: data.matches, qualifiers: collection(data.raw.qualifiers) } }
}

export async function generateTournamentKnockout(tournamentId, payload = {}, options = {}) {
  const response = await http.post(`/sport/tournaments/${encodeURIComponent(idOf(tournamentId))}/knockout/generate`, payload, { signal: options.signal })
  const data = normalizeWorkflowResponse(response)
  return { ...data, knockout: { rounds: normalizeKnockoutRounds(data.raw.rounds, data.matches), matches: data.matches, qualifiers: collection(data.raw.qualifiers) } }
}

export { normalizeTeam, normalizeGroup, normalizeMatch, normalizeStanding, normalizeEvent, normalizeKnockoutRounds }
