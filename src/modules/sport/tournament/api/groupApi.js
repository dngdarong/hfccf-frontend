import {
  fetchTournamentGroups,
  drawTournamentGroups as apiDrawTournamentGroups,
  finalizeTournamentGroups as apiFinalizeTournamentGroups,
} from './tournamentApi'
import { buildTournamentGroupsDrawPayload } from './groupMappers'

export async function getTournamentGroups(tournamentId, options = {}) {
  const response = await fetchTournamentGroups(tournamentId, options)
  return {
    ...response,
    groupDraw: {
      groups: response.groups,
      locked: response.groups.every((group) => group.finalized),
      settings: {
        groupCount: response.groups.length,
        qualificationCount: response.groups[0]?.qualificationSlots || 1,
      },
    },
  }
}

export async function drawTournamentGroups(tournamentId, payload = {}, options = {}) {
  const response = await apiDrawTournamentGroups(tournamentId, buildTournamentGroupsDrawPayload(payload), options)
  return { ...response, groupDraw: { groups: response.groups, locked: false, settings: { groupCount: response.groups.length, qualificationCount: response.groups[0]?.qualificationSlots || 1 } } }
}

export async function finalizeTournamentGroups(tournamentId, options = {}) {
  const response = await apiFinalizeTournamentGroups(tournamentId, {}, options)
  return { ...response, groupDraw: { groups: response.groups, locked: true, settings: { groupCount: response.groups.length, qualificationCount: response.groups[0]?.qualificationSlots || 1 } } }
}
