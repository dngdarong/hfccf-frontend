import { COMPETITION_TYPES, DEFAULT_COMPETITION_TYPE, DEFAULT_MATCH_STATUS } from '../constants/addMatchConstants'
import { formatMatchDateTimeForInput } from '@/modules/sport/services/api/sportApiUtils'

export function parseSchedule(value: string | null | undefined): string {
  return formatMatchDateTimeForInput(value)
}

export function inferCompetitionType(match: any): string {
  return match?.tournamentId ? COMPETITION_TYPES.TOURNAMENT : match?.tournamentName ? COMPETITION_TYPES.FRIENDLY : COMPETITION_TYPES.TOURNAMENT
}

export function initializeMatchForm(
  match: any,
  setters: {
    setCompetitionType: (value: string) => void
    setTournamentId: (value: string) => void
    setTournament: (value: string) => void
    setDateTime: (value: string) => void
    setVenue: (value: string) => void
    setStatus: (value: string) => void
    setHomeTeam: (value: string) => void
    setAwayTeam: (value: string) => void
  },
) {
  const {
    setCompetitionType,
    setTournamentId,
    setTournament,
    setDateTime,
    setVenue,
    setStatus,
    setHomeTeam,
    setAwayTeam,
  } = setters

  if (!match) {
    setCompetitionType(DEFAULT_COMPETITION_TYPE)
    setTournamentId('')
    setTournament('')
    setDateTime('')
    setVenue('')
    setStatus(DEFAULT_MATCH_STATUS)
    setHomeTeam('')
    setAwayTeam('')
    return
  }

  setCompetitionType(match.competitionType || inferCompetitionType(match))
  setTournamentId(String(match.tournamentId || match.tournament?.id || ''))
  setTournament(String(match.tournamentName || match.tournament?.name || ''))
  setDateTime(parseSchedule(match.schedule || match.scheduledAt))
  setVenue(String(match.venue || ''))
  setStatus(String(match.status || DEFAULT_MATCH_STATUS))
  setHomeTeam(String(match.homeTeam || ''))
  setAwayTeam(String(match.awayTeam || ''))
}

export function resetMatchForm(_setters: {
  setCompetitionType: (value: string) => void
  setTournamentId: (value: string) => void
  setTournament: (value: string) => void
  setDateTime: (value: string) => void
  setVenue: (value: string) => void
  setStatus: (value: string) => void
  setHomeTeam: (value: string) => void
  setAwayTeam: (value: string) => void
}) {
  const {
    setCompetitionType,
    setTournamentId,
    setTournament,
    setDateTime,
    setVenue,
    setStatus,
    setHomeTeam,
    setAwayTeam,
  } = _setters

  setCompetitionType(DEFAULT_COMPETITION_TYPE)
  setTournamentId('')
  setTournament('')
  setDateTime('')
  setVenue('')
  setStatus(DEFAULT_MATCH_STATUS)
  setHomeTeam('')
  setAwayTeam('')
}

export function getFormPayload(
  competitionType: string,
  tournamentId: string,
  tournament: string,
  dateTime: string,
  venue: string,
  status: string,
  homeTeam: string,
  awayTeam: string,
): Record<string, any> {
  return {
    competitionType,
    tournamentId: competitionType === COMPETITION_TYPES.TOURNAMENT ? tournamentId : null,
    tournamentName: competitionType === COMPETITION_TYPES.FRIENDLY ? tournament : null,
    scheduledAt: dateTime,
    venue,
    status,
    homeTeam,
    awayTeam,
  }
}

export function validateTeams(homeTeam: string, awayTeam: string, t: any): string {
  if (homeTeam && homeTeam === awayTeam) {
    return t('sportMatchesManagement.teamSelectionError')
  }
  return ''
}
