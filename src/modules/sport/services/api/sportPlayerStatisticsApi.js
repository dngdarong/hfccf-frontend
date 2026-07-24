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

export async function fetchSportPlayerStatisticsReport(params = {}, options = {}) {
  const response = await http.get('/sport/reports/players', {
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
      totalPlayers: Number(summary.total_players ?? 0),
      playersWithAppearances: Number(summary.players_with_appearances ?? 0),
      totalGoals: Number(summary.total_goals ?? 0),
      totalAssists: Number(summary.total_assists ?? 0),
      totalYellowCards: Number(summary.total_yellow_cards ?? 0),
      totalRedCards: Number(summary.total_red_cards ?? 0),
    },
    players: Array.isArray(data.players)
      ? data.players.map((row) => ({
          rankPosition: Number(row.rank_position ?? 0),
          playerId: Number(row.player_id ?? 0),
          playerCode: String(row.player_code ?? ''),
          playerName: String(row.player_name ?? ''),
          teamId: Number(row.team_id ?? 0),
          teamName: String(row.team_name ?? ''),
          playingPosition: String(row.playing_position ?? ''),
          appearances: Number(row.appearances ?? 0),
          goals: Number(row.goals ?? 0),
          assists: Number(row.assists ?? 0),
          yellowCards: Number(row.yellow_cards ?? 0),
          redCards: Number(row.red_cards ?? 0),
          penaltyGoals: Number(row.penalty_goals ?? 0),
          ownGoals: Number(row.own_goals ?? 0),
          penaltyMisses: Number(row.penalty_misses ?? 0),
          disciplinePoints: Number(row.discipline_points ?? 0),
        }))
      : [],
  }
}

function resolveAttachmentFilename(headers = {}, fallback = 'SportReport_player-statistics.pdf') {
  const disposition = String(headers['content-disposition'] || headers['Content-Disposition'] || '')
  const match = disposition.match(/filename="?([^";]+)"?/i)
  return match?.[1] || fallback
}

export async function downloadSportPlayerStatisticsReportPdf(params = {}, options = {}) {
  const response = await http.get('/sport/reports/players/download', {
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
    filename: resolveAttachmentFilename(response.headers, params.filename || 'SportReport_player-statistics.pdf'),
    mimeType: String(response.headers?.['content-type'] || ''),
  }
}

export async function downloadSportPlayerStatisticsReportExcel(params = {}, options = {}) {
  const response = await http.get('/sport/reports/players/download/excel', {
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
    filename: resolveAttachmentFilename(response.headers, params.filename || 'SportReport_player-statistics.xlsx'),
    mimeType: String(response.headers?.['content-type'] || ''),
  }
}
