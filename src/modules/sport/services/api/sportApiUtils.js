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

function parseMatchDateTime(value) {
  const raw = normalizeText(value)
  if (!raw) return null

  const normalized = raw.includes(' ') && !raw.includes('T') ? raw.replace(' ', 'T') : raw
  const parsed = new Date(normalized)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function formatMatchDateTimeForInput(value) {
  const parsed = parseMatchDateTime(value)
  if (!parsed) return normalizeText(value)

  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export function formatMatchDateTimeForDisplay(value) {
  const raw = normalizeText(value)
  if (!raw) return '-'

  const parsed = parseMatchDateTime(raw)
  if (!parsed) return raw

  return parsed.toLocaleString()
}

export function formatMatchDateTimeParts(value) {
  const parsed = parseMatchDateTime(value)

  if (!parsed) {
    const raw = normalizeText(value)
    if (!raw) return { date: '-', time: '-' }

    const [date = raw, time = '-'] = raw.split(/\s+/)
    return {
      date,
      time: time === '-' ? '-' : time.slice(0, 5),
    }
  }

  return {
    date: parsed.toLocaleDateString(),
    time: parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
    divisionId: row.divisionId ?? row.division_id ?? '',
    playingStyleId: row.playingStyleId ?? row.playing_style_id ?? '',
    playingStyleName: normalizeText(row.playingStyleName || row.playing_style_name),
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

export function normalizeEquipmentItemRow(row = {}) {
  return {
    id: row.id ?? '',
    equipmentCode: normalizeText(row.equipmentCode || row.equipment_code),
    name: normalizeText(row.name),
    category: normalizeText(row.category),
    description: normalizeText(row.description),
    unit: normalizeText(row.unit),
    totalQuantity: Number(row.totalQuantity ?? row.total_quantity ?? 0),
    availableQuantity: Number(row.availableQuantity ?? row.available_quantity ?? 0),
    minimumStockLevel: Number(row.minimumStockLevel ?? row.minimum_stock_level ?? 0),
    storageLocation: normalizeText(row.storageLocation || row.storage_location),
    status: normalizeText(row.status || 'active'),
    isLowStock: Boolean(row.isLowStock ?? row.is_low_stock ?? false),
    isOutOfStock: Boolean(row.isOutOfStock ?? row.is_out_of_stock ?? false),
    createdByUserId: row.createdByUserId ?? row.created_by_user_id ?? '',
    updatedByUserId: row.updatedByUserId ?? row.updated_by_user_id ?? '',
    createdBy: row.createdBy || null,
    updatedBy: row.updatedBy || null,
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

export function normalizeEquipmentRequestRow(row = {}) {
  const item = row.item || row.equipmentItem || {}
  const team = row.team || {}
  const coach = row.coach || {}
  const reviewedBy = row.reviewedBy || {}
  const issuedBy = row.issuedBy || {}
  const returnedBy = row.returnedBy || {}

  return {
    id: row.id ?? '',
    requestCode: normalizeText(row.requestCode || row.request_code),
    equipmentItemId: row.equipmentItemId ?? row.equipment_item_id ?? '',
    coachUserId: row.coachUserId ?? row.coach_user_id ?? '',
    teamId: row.teamId ?? row.team_id ?? '',
    requestedQuantity: Number(row.requestedQuantity ?? row.requested_quantity ?? 0),
    approvedQuantity: row.approvedQuantity ?? row.approved_quantity ?? null,
    issuedQuantity: Number(row.issuedQuantity ?? row.issued_quantity ?? 0),
    returnedQuantity: Number(row.returnedQuantity ?? row.returned_quantity ?? 0),
    damagedQuantity: Number(row.damagedQuantity ?? row.damaged_quantity ?? 0),
    missingQuantity: Number(row.missingQuantity ?? row.missing_quantity ?? 0),
    purpose: normalizeText(row.purpose),
    requiredDate: row.requiredDate || row.required_date || '',
    expectedReturnDate: row.expectedReturnDate || row.expected_return_date || '',
    status: normalizeText(row.status || 'pending'),
    adminNote: normalizeText(row.adminNote || row.admin_note),
    rejectionReason: normalizeText(row.rejectedReason || row.rejectionReason || row.rejected_reason),
    reviewedByUserId: row.reviewedByUserId ?? row.reviewed_by_user_id ?? '',
    reviewedAt: row.reviewedAt || row.reviewed_at || '',
    issuedByUserId: row.issuedByUserId ?? row.issued_by_user_id ?? '',
    issuedAt: row.issuedAt || row.issued_at || '',
    returnedByUserId: row.returnedByUserId ?? row.returned_by_user_id ?? '',
    returnedAt: row.returnedAt || row.returned_at || '',
    item: item && (item.id || item.name || item.equipmentCode || item.equipment_code) ? normalizeEquipmentItemRow(item) : null,
    coach: coach && (coach.id || coach.username || coach.firstName || coach.first_name) ? {
      id: coach.id ?? '',
      firstName: normalizeText(coach.firstName || coach.first_name),
      lastName: normalizeText(coach.lastName || coach.last_name),
      username: normalizeText(coach.username),
      email: normalizeText(coach.email),
    } : null,
    team: team && (team.id || team.name || team.teamCode || team.team_code) ? {
      id: team.id ?? '',
      teamCode: normalizeText(team.teamCode || team.team_code),
      name: normalizeText(team.name),
      shortName: normalizeText(team.shortName || team.short_name),
    } : null,
    reviewedBy: reviewedBy && (reviewedBy.id || reviewedBy.username || reviewedBy.firstName || reviewedBy.first_name) ? {
      id: reviewedBy.id ?? '',
      firstName: normalizeText(reviewedBy.firstName || reviewedBy.first_name),
      lastName: normalizeText(reviewedBy.lastName || reviewedBy.last_name),
      username: normalizeText(reviewedBy.username),
      email: normalizeText(reviewedBy.email),
    } : null,
    issuedBy: issuedBy && (issuedBy.id || issuedBy.username || issuedBy.firstName || issuedBy.first_name) ? {
      id: issuedBy.id ?? '',
      firstName: normalizeText(issuedBy.firstName || issuedBy.first_name),
      lastName: normalizeText(issuedBy.lastName || issuedBy.last_name),
      username: normalizeText(issuedBy.username),
      email: normalizeText(issuedBy.email),
    } : null,
    returnedBy: returnedBy && (returnedBy.id || returnedBy.username || returnedBy.firstName || returnedBy.first_name) ? {
      id: returnedBy.id ?? '',
      firstName: normalizeText(returnedBy.firstName || returnedBy.first_name),
      lastName: normalizeText(returnedBy.lastName || returnedBy.last_name),
      username: normalizeText(returnedBy.username),
      email: normalizeText(returnedBy.email),
    } : null,
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

function normalizeAssignmentRelation(value, fallback = {}) {
  if (typeof value === 'string' || typeof value === 'number') {
    return {
      id: '',
      name: normalizeText(value),
      fullName: normalizeText(value),
      teamCode: '',
      equipmentCode: '',
      firstName: '',
      lastName: '',
      username: '',
      email: '',
    }
  }

  if (!value || typeof value !== 'object') return null

  return {
    id: value.id ?? fallback.id ?? '',
    name: normalizeText(value.name || value.fullName || value.full_name || fallback.name),
    fullName: normalizeText(value.fullName || value.full_name || value.name || fallback.fullName),
    teamCode: normalizeText(value.teamCode || value.team_code || fallback.teamCode),
    equipmentCode: normalizeText(value.equipmentCode || value.equipment_code || fallback.equipmentCode),
    firstName: normalizeText(value.firstName || value.first_name || fallback.firstName),
    lastName: normalizeText(value.lastName || value.last_name || fallback.lastName),
    username: normalizeText(value.username || fallback.username),
    email: normalizeText(value.email || fallback.email),
  }
}

function normalizeAssignmentQuantity(value) {
  const quantity = Number(value)
  return Number.isFinite(quantity) ? quantity : 0
}

export function normalizeEquipmentAssignmentRow(row = {}) {
  const itemValue = row.item ?? row.equipmentItem ?? row.equipment_item ?? null
  const teamValue = row.team ?? null
  const coachValue = row.coach ?? null
  const assignedByValue = row.assignedBy ?? row.assigned_by ?? null
  const returnedByValue = row.returnedBy ?? row.returned_by ?? null
  const item = normalizeAssignmentRelation(itemValue)
  const team = normalizeAssignmentRelation(teamValue)
  const coach = normalizeAssignmentRelation(coachValue)
  const assignedByUser = normalizeAssignmentRelation(assignedByValue)
  const returnedByUser = normalizeAssignmentRelation(returnedByValue)
  const normalizedItem = itemValue && typeof itemValue === 'object'
    ? normalizeEquipmentItemRow(itemValue)
    : item
  const assignedQuantity = normalizeAssignmentQuantity(row.assignedQuantity ?? row.assigned_quantity)
  const returnedQuantity = normalizeAssignmentQuantity(row.returnedQuantity ?? row.returned_quantity)
  const damagedQuantity = normalizeAssignmentQuantity(row.damagedQuantity ?? row.damaged_quantity)
  const missingQuantity = normalizeAssignmentQuantity(row.missingQuantity ?? row.missing_quantity)

  return {
    id: row.id ?? '',
    assignmentCode: normalizeText(row.assignmentCode || row.assignment_code),
    equipmentRequestId: row.equipmentRequestId ?? row.equipment_request_id ?? '',
    equipmentItemId: row.equipmentItemId ?? row.equipment_item_id ?? item?.id ?? '',
    equipmentItem: normalizedItem,
    equipmentName: normalizeText(row.equipmentName || row.equipment_name || normalizedItem?.name || itemValue),
    equipmentCode: normalizeText(row.equipmentCode || row.equipment_code || normalizedItem?.equipmentCode),
    teamId: row.teamId ?? row.team_id ?? team?.id ?? '',
    team,
    teamName: normalizeText(row.teamName || row.team_name || team?.name || teamValue),
    coachUserId: row.coachUserId ?? row.coach_user_id ?? coach?.id ?? '',
    coach,
    coachName: normalizeText(
      row.coachName
      || row.coach_name
      || coach?.fullName
      || coach?.name
      || [coach?.firstName, coach?.lastName].filter(Boolean).join(' ')
      || coachValue,
    ),
    assignedQuantity,
    returnedQuantity,
    damagedQuantity,
    missingQuantity,
    remainingQuantity: normalizeAssignmentQuantity(
      row.remainingQuantity
      ?? row.remaining_quantity
      ?? assignedQuantity - returnedQuantity - damagedQuantity - missingQuantity,
    ),
    status: normalizeText(row.status || 'assigned'),
    assignedAt: row.assignedAt || row.assigned_at || '',
    expectedReturnAt: row.expectedReturnAt || row.expected_return_at || '',
    returnedAt: row.returnedAt || row.returned_at || '',
    assignedByUserId: row.assignedByUserId ?? row.assigned_by_user_id ?? assignedByUser?.id ?? '',
    returnedByUserId: row.returnedByUserId ?? row.returned_by_user_id ?? returnedByUser?.id ?? '',
    assignedByUser,
    returnedByUser,
    notes: normalizeText(row.notes),
    request: row.request && typeof row.request === 'object' ? {
      id: row.request.id ?? '',
      requestCode: normalizeText(row.request.requestCode || row.request.request_code),
      status: normalizeText(row.request.status),
    } : null,
    createdAt: row.createdAt || row.created_at || '',
    updatedAt: row.updatedAt || row.updated_at || '',
    deletedAt: row.deletedAt || row.deleted_at || '',
    raw: row,
  }
}

export function normalizeEquipmentAssignmentListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeEquipmentAssignmentRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
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

export function normalizeEquipmentItemListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeEquipmentItemRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
    summary: unwrapApiData(response)?.summary || {},
  }
}

export function normalizeEquipmentRequestListResponse(response, fallbackPage = 1, fallbackPerPage = 10) {
  const items = unwrapApiItems(response)

  return {
    items: items.map(normalizeEquipmentRequestRow),
    pagination: unwrapApiPagination(response, fallbackPage, fallbackPerPage, items.length),
    summary: unwrapApiData(response)?.summary || {},
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
      division_id: payload.divisionId || payload.division_id,
      playing_style_id: payload.playingStyleId || payload.playing_style_id,
      captain_name: payload.captainName || payload.captain_name || payload.captain,
      players_count: payload.playersCount ?? payload.players_count ?? payload.players,
      matches_count: payload.matchesCount ?? payload.matches_count ?? payload.matches,
      player_ids: JSON.stringify(payload.selectedPlayerIds ?? payload.playerIds ?? payload.player_ids ?? []),
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

export function buildCoachMatchPayload(payload = {}, options = {}) {
  const scheduledAt = normalizeText(payload.scheduledAt || payload.scheduled_at || payload.dateTime)

  return buildFormData(
    {
      match_code: payload.matchCode || payload.match_code,
      team_id: payload.teamId || payload.team_id,
      opponent_team_id: payload.opponentTeamId || payload.opponent_team_id,
      match_type: payload.matchType || payload.match_type,
      competition_type: payload.competitionType || payload.competition_type,
      tournament_name: payload.tournamentName || payload.tournament_name,
      venue: payload.venue,
      scheduled_at: scheduledAt ? formatMatchDateTimeForInput(scheduledAt) : undefined,
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
