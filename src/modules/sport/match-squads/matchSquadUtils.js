import { MATCH_SQUAD_PLAYER_ROLE } from '@/modules/sport/constants/matchSquad'

function resolveTeamLabel(team = {}) {
  return String(team.shortName || team.short_name || team.name || '').trim()
}

export function resolveMatchTeamOptions(match, allowedTeamIds = null) {
  const teams = [match?.homeTeamData, match?.awayTeamData].filter(Boolean)

  return teams
    .filter((team) => !allowedTeamIds || allowedTeamIds.has(String(team.id)))
    .map((team) => ({
      label: resolveTeamLabel(team),
      value: String(team.id ?? ''),
      team,
    }))
    .filter((team) => Boolean(team.value))
}

export function groupMatchSquadPlayers(players = []) {
  return players.reduce(
    (groups, player) => {
      const role = String(player.role || MATCH_SQUAD_PLAYER_ROLE.RESERVE).trim().toLowerCase()

      if (role === MATCH_SQUAD_PLAYER_ROLE.STARTER) {
        groups.starters.push(player)
      } else if (role === MATCH_SQUAD_PLAYER_ROLE.SUBSTITUTE) {
        groups.substitutes.push(player)
      } else if (role === MATCH_SQUAD_PLAYER_ROLE.RESERVE) {
        groups.reserves.push(player)
      } else {
        groups.unavailable.push(player)
      }

      return groups
    },
    {
      starters: [],
      substitutes: [],
      reserves: [],
      unavailable: [],
    },
  )
}

export function resolvePlayerDisplayName(player = {}) {
  return String(
    player.playerNameSnapshot ||
      player.playerName ||
      player.name ||
      player.player?.name ||
      '',
  ).trim()
}

export function resolvePlayerPosition(player = {}) {
  return String(player.positionSnapshot || player.position || player.player?.primaryPosition || '').trim()
}

