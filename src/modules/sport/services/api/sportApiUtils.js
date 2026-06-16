import {
  buildQueryParams,
  getApiErrorMessage,
  unwrapApiData,
  unwrapApiItems,
  unwrapApiPagination,
} from '@/services/api'
import { mapUser, mapUsers } from '@/services/mappers/userMapper'

export function normalizeText(value) {
  return String(value ?? '').trim()
}

export function normalizeBooleanLike(value) {
  return Boolean(value)
}

export function normalizePerPage(value, fallback = 25, max = 100) {
  // The backend enforces an upper bound on page size to keep list queries
  // predictable and to avoid large response payloads on shared sport pages.
  const numeric = Number.parseInt(value, 10)

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback
  }

  return Math.min(numeric, max)
}

export function splitName(fullName) {
  const tokens = normalizeText(fullName).split(/\s+/).filter(Boolean)
  const [firstName = '', ...rest] = tokens

  return {
    firstName,
    lastName: rest.join(' '),
  }
}

export function resolveId(payloadOrId) {
  if (typeof payloadOrId === 'string' || typeof payloadOrId === 'number') {
    return normalizeText(payloadOrId)
  }

  return normalizeText(payloadOrId?.id || payloadOrId?._id)
}

function parseMatchEventTiming(event = {}) {
  const minuteInput = event.minute ?? event.minuteValue ?? 0
  const extraTimeInput = event.extraTimeMinute ?? event.extra_time_minute ?? null

  if (typeof minuteInput === 'string' && /\d+\+\d+/.test(minuteInput)) {
    const [minutePart, extraPart] = minuteInput.split('+', 2)

    return {
      minute: Number.parseInt(minutePart, 10) || 0,
      extraTimeMinute: Number.parseInt(extraPart, 10) || 0,
    }
  }

  return {
    minute: Number.parseInt(minuteInput, 10) || 0,
    extraTimeMinute:
      extraTimeInput === null || extraTimeInput === undefined || extraTimeInput === ''
        ? null
        : Number.parseInt(extraTimeInput, 10) || 0,
  }
}

export function compareMatchEvents(left = {}, right = {}) {
  const leftTiming = parseMatchEventTiming(left)
  const rightTiming = parseMatchEventTiming(right)

  if (leftTiming.minute !== rightTiming.minute) {
    return leftTiming.minute - rightTiming.minute
  }

  const leftExtra = leftTiming.extraTimeMinute === null ? -1 : leftTiming.extraTimeMinute
  const rightExtra = rightTiming.extraTimeMinute === null ? -1 : rightTiming.extraTimeMinute

  if (leftExtra !== rightExtra) {
    return leftExtra - rightExtra
  }

  const leftId = String(left.id ?? '')
  const rightId = String(right.id ?? '')
  const leftCreated = String(left.createdAt || left.created_at || '')
  const rightCreated = String(right.createdAt || right.created_at || '')

  if (leftCreated !== rightCreated) {
    return leftCreated.localeCompare(rightCreated)
  }

  return leftId.localeCompare(rightId)
}

export function buildFormData(payload = {}, options = {}) {
  const formData = new FormData()
  const method = String(options.method || 'POST').toUpperCase()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return

    if (value instanceof File) {
      formData.append(key, value)
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(`${key}[]`, item))
      return
    }

    if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0')
      return
    }

    formData.append(key, value)
  })

  if (method === 'PUT') {
    formData.append('_method', 'PUT')
  }

  return formData
}

export function normalizeCoachRow(row = {}) {
  const user = mapUser(row?.coach || row)
  const name = normalizeText(row.name || row.fullName || user.fullName || `${user.firstName} ${user.lastName}`)

  return {
    ...user,
    id: row.id ?? user.id,
    name,
    fullName: name,
    role: 'coach',
    status: normalizeText(row.status || user.status || 'active'),
    raw: row,
  }
}

export function normalizeTeamRow(row = {}) {
  const coach = row.coach || {}
  const coachName = normalizeText(
    row.coachDisplayName || row.coach_display_name || coach.fullName || coach.name || coach.username,
  )
  const name = normalizeText(row.name || '')

  return {
    id: row.id ?? '',
    teamCode: normalizeText(row.teamCode || row.team_code),
    name,
    shortName: normalizeText(row.shortName || row.short_name),
    coachUserId: row.coachUserId ?? row.coach_user_id ?? '',
    coachDisplayName: coachName,
    coach: coachName,
    division: normalizeText(row.division),
    captainName: normalizeText(row.captainName || row.captain_name),
    playersCount: Number(row.playersCount ?? row.players_count ?? row.players ?? 0),
    players: Number(row.playersCount ?? row.players_count ?? row.players ?? 0),
    activePlayersCount: Number(row.activePlayersCount ?? row.active_players_count ?? 0),
    matchesCount: Number(row.matchesCount ?? row.matches_count ?? row.matches ?? 0),
    matches: Number(row.matchesCount ?? row.matches_count ?? row.matches ?? 0),
    wins: Number(row.wins ?? 0),
    draws: Number(row.draws ?? 0),
    losses: Number(row.losses ?? 0),
    points: Number(row.points ?? 0),
    venue: normalizeText(row.venue),
    logo: normalizeText(row.logo),
    status: normalizeText(row.status || 'active'),
    description: normalizeText(row.description),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

export function normalizeTournamentRow(row = {}) {
  return {
    id: row.id ?? '',
    tournamentCode: normalizeText(row.tournamentCode || row.tournament_code),
    name: normalizeText(row.name),
    title: normalizeText(row.title || row.name),
    season: normalizeText(row.season),
    tournamentType: normalizeText(row.tournamentType || row.tournament_type || 'league'),
    status: normalizeText(row.status || 'draft'),
    startsAt: row.startsAt || row.starts_at || '',
    endsAt: row.endsAt || row.ends_at || '',
    description: normalizeText(row.description),
    teamsCount: Number(row.teamsCount ?? row.teams_count ?? row.totalTeams ?? 0),
    matchesCount: Number(row.matchesCount ?? row.matches_count ?? row.matches ?? 0),
    standingsCount: Number(row.standingsCount ?? row.standings_count ?? 0),
    teams: Number(row.teamsCount ?? row.teams_count ?? row.totalTeams ?? 0),
    matches: Number(row.matchesCount ?? row.matches_count ?? row.matches ?? 0),
    location: normalizeText(row.location || row.season || row.tournamentType || ''),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

export function normalizeStandingRow(row = {}) {
  const team = row.team || {}

  return {
    id: row.id ?? '',
    tournamentId: row.tournamentId ?? row.tournament_id ?? '',
    teamId: row.teamId ?? row.team_id ?? '',
    rankPosition: Number(row.rankPosition ?? row.rank_position ?? 0),
    played: Number(row.played ?? 0),
    wins: Number(row.wins ?? 0),
    draws: Number(row.draws ?? 0),
    losses: Number(row.losses ?? 0),
    goalsFor: Number(row.goalsFor ?? row.goals_for ?? 0),
    goalsAgainst: Number(row.goalsAgainst ?? row.goals_against ?? 0),
    goalDifference: Number(row.goalDifference ?? row.goal_difference ?? 0),
    points: Number(row.points ?? 0),
    team: {
      id: team.id ?? '',
      teamCode: normalizeText(team.teamCode || team.team_code),
      name: normalizeText(team.name),
      shortName: normalizeText(team.shortName || team.short_name),
      logo: normalizeText(team.logo),
      status: normalizeText(team.status || ''),
    },
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

export function normalizePlayerRow(row = {}) {
  const firstName = normalizeText(row.firstName || row.first_name)
  const lastName = normalizeText(row.lastName || row.last_name)
  const name = normalizeText(row.name || `${firstName} ${lastName}`)
  const team = row.team || {}
  const teamName = normalizeText(row.teamName || row.team_name || team.name)

  return {
    id: row.id ?? '',
    playerCode: normalizeText(row.playerCode || row.player_code),
    firstName,
    lastName,
    name,
    jerseyNumber: row.jerseyNumber ?? row.jersey_number ?? null,
    position: normalizeText(row.position || row.primaryPosition || row.primary_position),
    teamId: row.teamId ?? row.team_id ?? '',
    team: teamName,
    division: normalizeText(row.division),
    gender: normalizeText(row.gender),
    age: row.age ?? null,
    dateOfBirth: row.dateOfBirth || row.date_of_birth || '',
    phone: normalizeText(row.phone),
    photo: normalizeText(row.photo),
    heightCm: row.heightCm ?? row.height_cm ?? null,
    weightKg: row.weightKg ?? row.weight_kg ?? null,
    preferredFoot: normalizeText(row.preferredFoot || row.preferred_foot),
    bloodType: normalizeText(row.bloodType || row.blood_type),
    village: normalizeText(row.village),
    commune: normalizeText(row.commune),
    district: normalizeText(row.district),
    province: normalizeText(row.province),
    currentSchool: normalizeText(row.currentSchool || row.current_school),
    gradeYear: normalizeText(row.gradeYear || row.grade_year),
    primaryPosition: normalizeText(row.primaryPosition || row.primary_position),
    registrationStatus: normalizeText(row.registrationStatus || row.registration_status),
    matchesPlayed: Number(row.matchesPlayed ?? row.matches_played ?? 0),
    goalsScored: Number(row.goalsScored ?? row.goals_scored ?? 0),
    approvalStatus: normalizeText(row.approvalStatus || row.approval_status),
    rosterStatus: normalizeText(row.rosterStatus || row.roster_status || row.status || 'inactive'),
    disciplinaryStatus: normalizeText(row.disciplinaryStatus || row.disciplinary_status),
    injuryStatus: normalizeText(row.injuryStatus || row.injury_status),
    archivedAt: row.archivedAt || row.archived_at || '',
    statusNotes: normalizeText(row.statusNotes || row.status_notes),
    createdByUserId: row.createdByUserId ?? row.created_by_user_id ?? '',
    approvedByUserId: row.approvedByUserId ?? row.approved_by_user_id ?? '',
    approvedAt: row.approvedAt || row.approved_at || '',
    rejectionReason: normalizeText(row.rejectionReason || row.rejection_reason),
    status: normalizeText(row.status || 'active'),
    notes: normalizeText(row.notes),
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

export function normalizeMembershipRow(row = {}) {
  const team = row.team || {}
  const player = row.player || {}

  return {
    id: row.id ?? '',
    teamId: row.teamId ?? row.team_id ?? '',
    playerId: row.playerId ?? row.player_id ?? '',
    status: normalizeText(row.status || 'inactive'),
    joinedAt: row.joinedAt || row.joined_at || '',
    leftAt: row.leftAt || row.left_at || '',
    suspensionUntil: row.suspensionUntil || row.suspension_until || '',
    injuryNotes: normalizeText(row.injuryNotes || row.injury_notes),
    notes: normalizeText(row.notes),
    createdByUserId: row.createdByUserId ?? row.created_by_user_id ?? '',
    updatedByUserId: row.updatedByUserId ?? row.updated_by_user_id ?? '',
    team: {
      id: team.id ?? '',
      teamCode: normalizeText(team.teamCode || team.team_code),
      name: normalizeText(team.name),
      shortName: normalizeText(team.shortName || team.short_name),
    },
    player: {
      id: player.id ?? '',
      playerCode: normalizeText(player.playerCode || player.player_code),
      name: normalizeText(player.name || `${normalizeText(player.firstName || player.first_name)} ${normalizeText(player.lastName || player.last_name)}`),
      approvalStatus: normalizeText(player.approvalStatus || player.approval_status),
      rosterStatus: normalizeText(player.rosterStatus || player.roster_status || player.status),
    },
    raw: row,
  }
}

export function normalizeEventRow(row = {}, homeTeamId = null, awayTeamId = null) {
  const teamId = row.teamId ?? row.team_id ?? ''
  const teamType =
    homeTeamId && String(teamId) === String(homeTeamId)
      ? 'home'
      : awayTeamId && String(teamId) === String(awayTeamId)
        ? 'away'
        : 'home'
  const player = row.player || {}
  const timing = parseMatchEventTiming(row)

  return {
    id: row.id ?? '',
    matchId: row.matchId ?? row.match_id ?? '',
    teamId,
    teamType,
    squadId: row.squadId ?? row.squad_id ?? '',
    squadPlayerId: row.squadPlayerId ?? row.squad_player_id ?? '',
    relatedSquadPlayerId: row.relatedSquadPlayerId ?? row.related_squad_player_id ?? '',
    playerId: row.playerId ?? row.player_id ?? '',
    eventType: normalizeText(row.eventType || row.event_type || 'goal'),
    minute: timing.minute,
    extraTimeMinute: timing.extraTimeMinute,
    stoppageMinute: row.stoppageMinute ?? row.stoppage_minute ?? null,
    period: normalizeText(row.period || row.match_period),
    side: normalizeText(row.side || row.teamSide),
    playerName: normalizeText(
      row.playerName ||
        row.player_name ||
        player.name ||
        `${player.firstName || player.first_name || ''} ${player.lastName || player.last_name || ''}`,
    ),
    player: player && typeof player === 'object' ? player : null,
    teamName: normalizeText(row.teamName || row.team_name || row.team?.name),
    metadata: row.metadata && typeof row.metadata === 'object' ? row.metadata : {},
    createdByUserId: row.createdByUserId ?? row.created_by_user_id ?? '',
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    raw: row,
  }
}

export function normalizeMatchRow(row = {}) {
  const homeTeam = row.homeTeam || {}
  const awayTeam = row.awayTeam || {}
  const tournament = row.tournament || null
  const events = Array.isArray(row.events)
    ? row.events.map((event) => normalizeEventRow(event, homeTeam.id, awayTeam.id))
    : []

  return {
    id: row.id ?? '',
    matchCode: normalizeText(row.matchCode || row.match_code),
    homeTeamId: row.homeTeamId ?? row.home_team_id ?? '',
    awayTeamId: row.awayTeamId ?? row.away_team_id ?? '',
    tournamentId: row.tournamentId ?? row.tournament_id ?? '',
    homeTeam: normalizeText(homeTeam.name || row.homeTeamName || row.home_team_name || row.home_team || ''),
    awayTeam: normalizeText(awayTeam.name || row.awayTeamName || row.away_team_name || row.away_team || ''),
    homeTeamData: homeTeam,
    awayTeamData: awayTeam,
    tournament:
      tournament && (tournament.id || tournament.name || tournament.tournamentCode || tournament.tournament_code)
        ? normalizeTournamentRow(tournament)
        : null,
    competitionType: normalizeText(row.competitionType || row.competition_type),
    tournamentName: normalizeText(row.tournamentName || row.tournament_name || tournament?.name),
    venue: normalizeText(row.venue),
    schedule: row.scheduledAt || row.scheduled_at || '',
    scheduledAt: row.scheduledAt || row.scheduled_at || '',
    startedAt: row.startedAt || row.started_at || '',
    completedAt: row.completedAt || row.completed_at || '',
    status: normalizeText(row.status || 'draft'),
    currentPeriod: normalizeText(row.currentPeriod || row.current_period),
    homeScore: Number(row.homeScore ?? row.home_score ?? 0),
    awayScore: Number(row.awayScore ?? row.away_score ?? 0),
    score: `${Number(row.homeScore ?? row.home_score ?? 0)} - ${Number(row.awayScore ?? row.away_score ?? 0)}`,
    notes: normalizeText(row.notes),
    createdByUserId: row.createdByUserId ?? row.created_by_user_id ?? '',
    matchType: normalizeText(row.matchType || row.match_type),
    approvalStatus: normalizeText(row.approvalStatus || row.approval_status),
    approvedByUserId: row.approvedByUserId ?? row.approved_by_user_id ?? '',
    approvedAt: row.approvedAt || row.approved_at || '',
    rejectionReason: normalizeText(row.rejectionReason || row.rejection_reason),
    requestedByRole: normalizeText(row.requestedByRole || row.requested_by_role),
    eventsCount: Number(row.eventsCount ?? row.events_count ?? events.length),
    events,
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

export function normalizeCoachListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: mapUsers(items).map((coach) => normalizeCoachRow(coach)),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

export function normalizeTeamListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeTeamRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

export function normalizePlayerListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizePlayerRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

export function normalizeMatchListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeMatchRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

export function normalizeTournamentListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeTournamentRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

export function normalizeStandingListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeStandingRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

export function normalizeEventListResponse(response, homeTeamId = null, awayTeamId = null, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items
      .map((event) => normalizeEventRow(event, homeTeamId, awayTeamId))
      .sort(compareMatchEvents),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
  }
}

export function buildTeamPayload(payload = {}, options = {}) {
  return buildFormData(
    {
      team_code: payload.teamCode || payload.team_code,
      name: payload.name,
      short_name: payload.shortName || payload.short_name,
      coach_user_id: payload.coachUserId || payload.coach_user_id || '',
      coach_display_name: payload.coachDisplayName || payload.coach_display_name || payload.coach,
      division: payload.division,
      captain_name: payload.captainName || payload.captain_name || payload.captain,
      players_count: payload.playersCount ?? payload.players_count ?? payload.players,
      matches_count: payload.matchesCount ?? payload.matches_count ?? payload.matches,
      wins: payload.wins,
      draws: payload.draws,
      losses: payload.losses,
      points: payload.points,
      venue: payload.venue,
      logo: payload.logo instanceof File ? payload.logo : undefined,
      remove_logo: payload.removeLogo || payload.remove_logo,
      status: payload.status,
      description: payload.description,
    },
    options,
  )
}

export function buildPlayerPayload(payload = {}, options = {}) {
  const fullName = normalizeText(payload.name || payload.fullName)
  const split = splitName(fullName)

  return buildFormData(
    {
      name: fullName,
      first_name: payload.firstName || payload.first_name || split.firstName,
      last_name: payload.lastName || payload.last_name || split.lastName,
      player_code: payload.playerCode || payload.player_code,
      jersey_number: payload.jerseyNumber ?? payload.jersey_number,
      position: payload.position,
      team: payload.team || payload.teamName || payload.team_name,
      gender: payload.gender,
      age: payload.age,
      date_of_birth: payload.dateOfBirth || payload.date_of_birth,
      phone: payload.phone,
      photo:
        payload.photo instanceof File ? payload.photo : payload.profileImage instanceof File ? payload.profileImage : undefined,
      remove_photo: payload.removePhoto || payload.remove_photo,
      height_cm: payload.heightCm ?? payload.height_cm,
      weight_kg: payload.weightKg ?? payload.weight_kg,
      preferred_foot: payload.preferredFoot || payload.preferred_foot,
      blood_type: payload.bloodType || payload.blood_type,
      village: payload.village,
      commune: payload.commune,
      district: payload.district,
      province: payload.province,
      current_school: payload.currentSchool || payload.current_school,
      grade_year: payload.gradeYear || payload.grade_year,
      primary_position: payload.primaryPosition || payload.primary_position,
      registration_status: payload.registrationStatus || payload.registration_status,
      matches_played: payload.matchesPlayed ?? payload.matches_played,
      goals_scored: payload.goalsScored ?? payload.goals_scored,
      status: payload.status,
      notes: payload.notes,
      division: payload.division,
    },
    options,
  )
}

export function buildCoachPayload(payload = {}, options = {}) {
  const fullName = normalizeText(payload.name || payload.fullName)
  const split = splitName(fullName)

  return buildFormData(
    {
      name: fullName,
      first_name: payload.firstName || payload.first_name || split.firstName,
      last_name: payload.lastName || payload.last_name || split.lastName,
      username: payload.username || fullName,
      email: payload.email,
      phone: payload.phone,
      status: payload.status,
      password: payload.password,
      password_confirmation: payload.confirmPassword || payload.password_confirmation,
      avatar:
        payload.avatar instanceof File ? payload.avatar : payload.profileImage instanceof File ? payload.profileImage : undefined,
      remove_avatar: payload.removeAvatar || payload.remove_avatar,
    },
    options,
  )
}

export function buildMatchPayload(payload = {}, options = {}) {
  return buildFormData(
    {
      match_code: payload.matchCode || payload.match_code,
      home_team: payload.homeTeam || payload.home_team,
      away_team: payload.awayTeam || payload.away_team,
      tournament_id: payload.tournamentId || payload.tournament_id,
      competition_type: payload.competitionType || payload.competition_type,
      tournament_name: payload.tournamentName || payload.tournament_name || payload.tournament,
      venue: payload.venue,
      scheduled_at: payload.scheduledAt || payload.scheduled_at || payload.dateTime,
      status: payload.status,
      current_period: payload.currentPeriod || payload.current_period,
      notes: payload.notes,
    },
    options,
  )
}

export function buildTournamentPayload(payload = {}, options = {}) {
  return buildFormData(
    {
      tournament_code: payload.tournamentCode || payload.tournament_code,
      name: payload.name,
      season: payload.season,
      tournament_type: payload.tournamentType || payload.tournament_type,
      status: payload.status,
      starts_at: payload.startsAt || payload.starts_at,
      ends_at: payload.endsAt || payload.ends_at,
      description: payload.description,
    },
    options,
  )
}

export function buildEventPayload(payload = {}, options = {}) {
  return buildFormData(
    {
      team_id: payload.teamId || payload.team_id,
      squad_id: payload.squadId || payload.squad_id,
      squad_player_id: payload.squadPlayerId || payload.squad_player_id,
      related_squad_player_id: payload.relatedSquadPlayerId || payload.related_squad_player_id,
      player_id: payload.playerId || payload.player_id,
      player_name: payload.playerName || payload.player_name,
      event_type: payload.eventType || payload.event_type,
      minute: payload.minute,
      extra_time_minute: payload.extraTimeMinute || payload.extra_time_minute,
      stoppage_minute: payload.stoppageMinute || payload.stoppage_minute,
      period: payload.period,
      side: payload.side,
      player_name_snapshot: payload.playerNameSnapshot || payload.player_name_snapshot,
      jersey_number_snapshot: payload.jerseyNumberSnapshot || payload.jersey_number_snapshot,
      position_snapshot: payload.positionSnapshot || payload.position_snapshot,
      metadata: payload.metadata,
    },
    options,
  )
}

export function normalizeDashboardPayload(response) {
  const payload = unwrapApiData(response) || {}

  return {
    ...payload,
    summary: payload.summary || {},
    teams: Array.isArray(payload.teams) ? payload.teams.map(normalizeTeamRow) : [],
    players: Array.isArray(payload.players) ? payload.players.map(normalizePlayerRow) : [],
    matches: Array.isArray(payload.matches) ? payload.matches.map(normalizeMatchRow) : [],
    events: Array.isArray(payload.events)
      ? payload.events.map((event) => normalizeEventRow(event, event?.match?.homeTeam?.id, event?.match?.awayTeam?.id))
      : [],
    tournaments: Array.isArray(payload.tournaments) ? payload.tournaments.map(normalizeTournamentRow) : [],
    featuredTournament: payload.featuredTournament ? normalizeTournamentRow(payload.featuredTournament) : null,
    standings: Array.isArray(payload.standings) ? payload.standings.map(normalizeStandingRow) : [],
  }
}

export { buildQueryParams, getApiErrorMessage, unwrapApiData }
