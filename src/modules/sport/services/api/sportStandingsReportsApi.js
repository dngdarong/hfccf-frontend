import http from '@/services/http'
import {
  buildQueryParams,
  unwrapApiData,
} from './sportApiUtils'

function formatReportDateParam(value) {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

export async function fetchSportStandingsReport(params = {}, options = {}) {
  const response = await http.get('/sport/reports/standings', {
    params: buildQueryParams({
      date_from: formatReportDateParam(params.dateFrom),
      date_to: formatReportDateParam(params.dateTo),
      division_id: params.divisionId || '',
      team_id: params.teamId || '',
      tournament_id: params.tournamentId || '',
    }),
    signal: options.signal,
  })

  const data = unwrapApiData(response) || {}
  const summary = data.summary || {}

  return {
    filters: data.filters || {},
    summary: {
      totalTeams: Number(summary.total_teams ?? 0),
      tournamentsWithStandings: Number(summary.tournaments_with_standings ?? 0),
      totalGroups: Number(summary.total_groups ?? 0),
    },
    standings: Array.isArray(data.standings)
      ? data.standings.map((row) => ({
          rankPosition: Number(row.rank_position ?? row.position ?? 0),
          teamId: Number(row.team_id ?? 0),
          teamName: String(row.team_name ?? row.team ?? ''),
          tournamentId: Number(row.tournament_id ?? 0),
          tournamentName: String(row.tournament_name ?? row.tournament ?? ''),
          groupId: row.group_id ?? null,
          groupName: row.group_name ?? null,
          played: Number(row.played ?? 0),
          wins: Number(row.wins ?? 0),
          draws: Number(row.draws ?? 0),
          losses: Number(row.losses ?? 0),
          goalsFor: Number(row.goals_for ?? 0),
          goalsAgainst: Number(row.goals_against ?? 0),
          goalDifference: Number(row.goal_difference ?? 0),
          points: Number(row.points ?? 0),
        }))
      : [],
  }
}

function resolveAttachmentFilename(headers = {}, fallback = 'SportReport_standings.pdf') {
  const disposition = String(headers['content-disposition'] || headers['Content-Disposition'] || '')
  const match = disposition.match(/filename="?([^";]+)"?/i)
  return match?.[1] || fallback
}

export async function downloadSportStandingsReportPdf(params = {}, options = {}) {
  const response = await http.get('/sport/reports/standings/download', {
    params: buildQueryParams({
      date_from: formatReportDateParam(params.dateFrom),
      date_to: formatReportDateParam(params.dateTo),
      division_id: params.divisionId || '',
      team_id: params.teamId || '',
      tournament_id: params.tournamentId || '',
    }),
    responseType: 'blob',
    signal: options.signal,
  })

  return {
    blob: response.data,
    filename: resolveAttachmentFilename(response.headers, params.filename || 'SportReport_standings.pdf'),
    mimeType: String(response.headers?.['content-type'] || ''),
  }
}

export async function downloadSportStandingsReportExcel(params = {}, options = {}) {
  const response = await http.get('/sport/reports/standings/download/excel', {
    params: buildQueryParams({
      date_from: formatReportDateParam(params.dateFrom),
      date_to: formatReportDateParam(params.dateTo),
      division_id: params.divisionId || '',
      team_id: params.teamId || '',
      tournament_id: params.tournamentId || '',
    }),
    responseType: 'blob',
    signal: options.signal,
  })

  return {
    blob: response.data,
    filename: resolveAttachmentFilename(response.headers, params.filename || 'SportReport_standings.xlsx'),
    mimeType: String(response.headers?.['content-type'] || ''),
  }
}
