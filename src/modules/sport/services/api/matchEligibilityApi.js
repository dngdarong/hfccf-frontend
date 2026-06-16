import http from '@/services/http'
import { resolveId } from './sportApiUtils'
import { normalizeMatchEligibilityResponse } from './matchSquadMappers'

export async function fetchMatchTeamEligibility(matchId, teamId, options = {}) {
  const targetMatchId = resolveId(matchId)
  const targetTeamId = resolveId(teamId)

  if (!targetMatchId || !targetTeamId) {
    return { match: null, team: null, items: [], raw: null }
  }

  const response = await http.get(
    `/sport/matches/${encodeURIComponent(targetMatchId)}/teams/${encodeURIComponent(targetTeamId)}/eligibility`,
    {
      signal: options.signal,
    },
  )

  return normalizeMatchEligibilityResponse(response)
}
