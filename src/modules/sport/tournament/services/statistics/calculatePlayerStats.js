import {
  createPlayerStatKey,
  createPlayerStatName,
  getDisciplinePoints,
  isDisciplineEventType,
  isScoringEventType,
  normalizeText,
  resolveEventTeamId,
} from './eventStatRules'
import { normalizeStatisticsInput } from './normalizeStatisticsInput'
import { normalizeEventType } from '../normalizeMatchEvents'

function createEmptyPlayerRow(event = {}, key = '') {
  return {
    key,
    playerId: normalizeText(event.playerId || event.assistPlayerId),
    playerName: createPlayerStatName(event),
    teamId: normalizeText(event.teamId),
    teamName: normalizeText(event.teamName),
    matches: new Set(),
    appearances: 0,
    goals: 0,
    assists: 0,
    penaltyGoals: 0,
    penaltyMisses: 0,
    ownGoals: 0,
    yellowCards: 0,
    redCards: 0,
    disciplinePoints: 0,
  }
}

function ensureRow(rows = new Map(), event = {}, role = 'player') {
  const key = createPlayerStatKey(event, role)
  if (!key) return null

  if (!rows.has(key)) {
    rows.set(key, createEmptyPlayerRow(event, key))
  }

  const row = rows.get(key)
  const teamId = resolveEventTeamId(event, event?.fixture || {})

  if (!row.playerName) {
    row.playerName = createPlayerStatName(event, role)
  }

  if (!row.playerId && normalizeText(role === 'assist' ? event.assistPlayerId : event.playerId)) {
    row.playerId = normalizeText(role === 'assist' ? event.assistPlayerId : event.playerId)
  }

  if (!row.teamId && teamId) {
    row.teamId = teamId
  }

  if (!row.teamName && normalizeText(event.teamName)) {
    row.teamName = normalizeText(event.teamName)
  }

  return row
}

function registerAppearance(row = null, matchId = '') {
  if (!row) return
  const targetMatchId = normalizeText(matchId)
  if (!targetMatchId) return

  row.matches.add(targetMatchId)
}

function finalizeRow(row = {}) {
  const appearances = row.matches instanceof Set ? row.matches.size : row.appearances

  const output = {
    ...row,
    appearances,
  }

  delete output.matches

  return output
}

function applyPrimaryEvent(rows = new Map(), event = {}, fixture = {}) {
  const type = normalizeEventType(event.type)
  const primaryRow = ensureRow(rows, { ...event, fixture }, 'player')

  if (isScoringEventType(type) || type === 'assist' || type === 'penalty_miss' || isDisciplineEventType(type) || type === 'substitution' || type === 'injury' || type === 'var_review' || type === 'note') {
    registerAppearance(primaryRow, fixture.id)
  }

  if (!primaryRow) {
    return
  }

  if (type === 'goal' || type === 'penalty_goal') {
    primaryRow.goals += 1
    if (type === 'penalty_goal') {
      primaryRow.penaltyGoals += 1
    }
  } else if (type === 'assist') {
    primaryRow.assists += 1
  } else if (type === 'own_goal') {
    primaryRow.ownGoals += 1
  } else if (type === 'penalty_miss') {
    primaryRow.penaltyMisses += 1
  } else if (type === 'yellow_card') {
    primaryRow.yellowCards += 1
    primaryRow.disciplinePoints += getDisciplinePoints(type)
  } else if (type === 'red_card') {
    primaryRow.redCards += 1
    primaryRow.disciplinePoints += getDisciplinePoints(type)
  }

  if ((type === 'goal' || type === 'penalty_goal') && normalizeText(event.assistPlayerId || event.assistPlayerName)) {
    const assistRow = ensureRow(rows, { ...event, playerId: event.assistPlayerId, playerName: event.assistPlayerName }, 'player')
    registerAppearance(assistRow, fixture.id)
    if (assistRow) {
      assistRow.assists += 1
    }
  }
}

function applyLinkedParticipants(rows = new Map(), event = {}, fixture = {}) {
  if (normalizeText(event.playerOutId || event.playerOutName)) {
    const row = ensureRow(rows, { ...event, playerId: event.playerOutId, playerName: event.playerOutName }, 'player')
    registerAppearance(row, fixture.id)
  }

  if (normalizeText(event.playerInId || event.playerInName)) {
    const row = ensureRow(rows, { ...event, playerId: event.playerInId, playerName: event.playerInName }, 'player')
    registerAppearance(row, fixture.id)
  }
}

export function calculatePlayerStats({
  tournament = {},
  fixtures = [],
} = {}) {
  const normalized = normalizeStatisticsInput(tournament)
  const sourceFixtures = Array.isArray(fixtures) && fixtures.length ? fixtures : normalized.fixtures
  const rows = new Map()

  sourceFixtures.forEach((fixture) => {
    const status = normalizeText(fixture.status).toLowerCase()
    if (status === 'cancelled' || status === 'postponed') {
      return
    }

    const events = Array.isArray(fixture.events) ? fixture.events : []

    events.forEach((event) => {
      applyPrimaryEvent(rows, event, fixture)
      applyLinkedParticipants(rows, event, fixture)
    })
  })

  return [...rows.values()]
    .map((row) => finalizeRow(row))
    .sort((left, right) => normalizeText(left.playerName).localeCompare(normalizeText(right.playerName)))
}

export {
  applyLinkedParticipants,
  applyPrimaryEvent,
  createEmptyPlayerRow,
  ensureRow,
  finalizeRow,
  registerAppearance,
}
