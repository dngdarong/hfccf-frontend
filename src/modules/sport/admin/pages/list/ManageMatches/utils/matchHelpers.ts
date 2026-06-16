export function normalize(value: string | number | undefined | null): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function toScoreNumber(value: any): number | null {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : null
}

export function formatDisplayScore(match: any = {}): string {
  const homeScore = toScoreNumber(match.homeScore ?? match.home_score)
  const awayScore = toScoreNumber(match.awayScore ?? match.away_score)

  if (homeScore === null || awayScore === null) return '- - -'
  return `${homeScore} - ${awayScore}`
}

export function toTableMatch(match: any): any {
  return {
    ...match,
    score: String(match.score || formatDisplayScore(match)),
  }
}

export function matchTournamentLabel(match: any = {}): string {
  return String(match?.tournament?.name || match?.tournamentName || match?.tournament || '').trim()
}

export function getCompetitionOptions(matches: any[]): string[] {
  const options = matches.map((match) => match.competitionType || match.competition || '').filter(Boolean)
  return [...new Set(options)].sort()
}

export function getTournamentOptions(matches: any[]): string[] {
  const options = matches
    .map((match) => match.tournament?.name || match?.tournamentName || match?.tournament || '')
    .filter(Boolean)
  return [...new Set(options)].sort()
}
