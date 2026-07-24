import {
  DEFAULT_STATUS,
  DEFAULT_PERIOD,
  DEFAULT_EVENT_TYPE,
  FINAL_PERIOD,
  SCORING_EVENT_TYPES,
} from '../constants/resultEntryConstants'
import { formatMatchDateTimeParts } from '@/modules/sport/services/api/sportApiUtils'

export function createResultValue(value: any = {}) {
  return {
    homeTeam: String(value.homeTeam || ''),
    awayTeam: String(value.awayTeam || ''),
    homeScore: Number(value.homeScore || 0),
    awayScore: Number(value.awayScore || 0),
    status: String(value.status || DEFAULT_STATUS),
    report: String(value.report || ''),
    homeEvents: Array.isArray(value.homeEvents) ? value.homeEvents : [],
    awayEvents: Array.isArray(value.awayEvents) ? value.awayEvents : [],
  }
}

export function createDraftEvent(value: any = {}) {
  return {
    id: value.id || '',
    eventType: String(value.eventType || DEFAULT_EVENT_TYPE),
    teamId: value.teamId || '',
    squadId: value.squadId || '',
    squadPlayerId: value.squadPlayerId || '',
    relatedSquadPlayerId: value.relatedSquadPlayerId || '',
    minute: Number(value.minute || 0),
    stoppageMinute: Number(value.stoppageMinute || 0),
    period: String(value.period || DEFAULT_PERIOD),
    notes: String(value.notes || value.description || ''),
  }
}

export function isScoringEvent(event: any = {}): boolean {
  const type = String(event.eventType || '').toLowerCase()
  return SCORING_EVENT_TYPES.includes(type)
}

export function calculateScore(events: any[] = [], match: any = {}) {
  return events.reduce(
    (carry: { home: number; away: number }, event: any) => {
      if (!isScoringEvent(event)) return carry

      const teamId = String(event.teamId || event.team_id || '')
      const awayId = String(match.awayTeamId || match.away_team_id || '')
      const eventSide = String(event.side || '').toLowerCase()
      let creditedTeam = teamId === awayId || eventSide === 'away' ? 'away' : 'home'

      if (String(event.eventType || '').toLowerCase() === 'own_goal') {
        creditedTeam = creditedTeam === 'home' ? 'away' : 'home'
      }

      if (creditedTeam === 'home') carry.home += 1
      if (creditedTeam === 'away') carry.away += 1

      return carry
    },
    { home: 0, away: 0 },
  )
}

export function buildFixtureSummary(match: any = {}) {
  const target = match ?? {}
  const { date: matchDate, time: matchTime } = formatMatchDateTimeParts(
    target.schedule || target.scheduledAt || target.scheduled_at,
  )

  return {
    homeTeam: String(target.homeTeam || '-'),
    awayTeam: String(target.awayTeam || '-'),
    matchDate,
    matchTime,
    venue: String(target.venue || '-'),
    competition: String(target.tournament?.name || target.tournamentName || target.competitionType || '-'),
  }
}

export function validateResult(result: any, selectedMatch: any, t: any): string {
  if (!selectedMatch) {
    return t('sportMatchesManagement.resultsEntry.validation.matchRequired')
  }

  if (Number(result.homeScore) < 0 || Number(result.awayScore) < 0) {
    return t('sportMatchesManagement.resultsEntry.validation.scoreInvalid')
  }

  if (!result.status) {
    return t('sportMatchesManagement.resultsEntry.validation.statusRequired')
  }

  return ''
}

export function buildResultSavePayload(result: any) {
  return {
    status: result.status,
    currentPeriod: FINAL_PERIOD,
    notes: result.report,
  }
}
