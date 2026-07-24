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

export async function fetchSportMatchesReport(params = {}, options = {}) {
  const response = await http.get('/sport/reports/matches', {
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
    filterLabels: {
      division: data.filter_labels?.division || 'All',
      team: data.filter_labels?.team || 'All',
      tournament: data.filter_labels?.tournament || 'All',
    },
    summary: {
      totalMatches: Number(summary.total_matches ?? 0),
      completedMatches: Number(summary.completed_matches ?? 0),
      scheduledMatches: Number(summary.scheduled_matches ?? 0),
      totalTeams: Number(summary.total_teams ?? 0),
    },
    matches: Array.isArray(data.matches)
      ? data.matches.map((row) => ({
          id: String(row.id ?? ''),
          homeTeamId: Number(row.homeTeamId ?? 0),
          awayTeamId: Number(row.awayTeamId ?? 0),
          homeTeamName: String(row.homeTeamName ?? ''),
          awayTeamName: String(row.awayTeamName ?? ''),
          homeScore: Number(row.homeScore ?? 0),
          awayScore: Number(row.awayScore ?? 0),
          score: String(row.score ?? ''),
          date: row.date ?? null,
          scheduledAt: row.scheduledAt ?? null,
          venue: String(row.venue ?? ''),
          status: String(row.status ?? ''),
          tournamentId: Number(row.tournamentId ?? 0),
          tournamentName: String(row.tournamentName ?? ''),
          divisionId: Number(row.divisionId ?? 0),
          divisionName: String(row.divisionName ?? ''),
        }))
      : [],
  }
}

function resolveAttachmentFilename(headers = {}, fallback = 'SportReport_matches.pdf') {
  const disposition = String(headers['content-disposition'] || headers['Content-Disposition'] || '')
  const match = disposition.match(/filename="?([^";]+)"?/i)
  return match?.[1] || fallback
}

export async function downloadSportMatchesReportPdf(params = {}, options = {}) {
  const response = await http.get('/sport/reports/matches/download', {
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
    filename: resolveAttachmentFilename(response.headers, params.filename || 'SportReport_matches.pdf'),
    mimeType: String(response.headers?.['content-type'] || ''),
  }
}

export async function downloadSportMatchesReportExcel(params = {}, options = {}) {
  const response = await http.get('/sport/reports/matches/download/excel', {
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
    filename: resolveAttachmentFilename(response.headers, params.filename || 'SportReport_matches.xlsx'),
    mimeType: String(response.headers?.['content-type'] || ''),
  }
}
