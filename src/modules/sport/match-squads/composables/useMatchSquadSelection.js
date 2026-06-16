import { computed, ref } from 'vue'
import { MATCH_SQUAD_PLAYER_ROLE, normalizeMatchSquadRole } from '@/modules/sport/constants/matchSquad'

function resolvePlayerId(player = {}) {
  return String(player.playerId || player.player_id || player.id || player.player?.id || '')
}

export function useMatchSquadSelection() {
  const players = ref([])

  const starters = computed(() => players.value.filter((player) => player.role === MATCH_SQUAD_PLAYER_ROLE.STARTER))
  const substitutes = computed(() => players.value.filter((player) => player.role === MATCH_SQUAD_PLAYER_ROLE.SUBSTITUTE))
  const reserves = computed(() => players.value.filter((player) => player.role === MATCH_SQUAD_PLAYER_ROLE.RESERVE))
  const unavailable = computed(() => players.value.filter((player) => player.role === MATCH_SQUAD_PLAYER_ROLE.UNAVAILABLE))

  const payload = computed(() =>
    players.value.map((player) => ({
      player_id: player.playerId,
      role: player.role,
    })),
  )

  function syncFromEligibility(eligibilityPlayers = [], squadPlayers = []) {
    const existing = new Map(
      squadPlayers
        .map((player) => [resolvePlayerId(player), player])
        .filter(([playerId]) => Boolean(playerId)),
    )
    const seen = new Set()

    players.value = eligibilityPlayers
      .map((row) => {
        const playerId = resolvePlayerId(row)

        if (!playerId || seen.has(playerId)) {
          return null
        }

        seen.add(playerId)

        const current = existing.get(playerId)
        const role = current?.role || (row.isEligible ? MATCH_SQUAD_PLAYER_ROLE.RESERVE : MATCH_SQUAD_PLAYER_ROLE.UNAVAILABLE)

        return {
          ...row,
          playerId,
          role: normalizeMatchSquadRole(role),
          playerName: row.playerName || row.player?.name || row.playerNameSnapshot || row.player?.fullName || '',
        }
      })
      .filter(Boolean)
  }

  function setRole(playerId, role) {
    const normalizedPlayerId = String(playerId || '')
    const normalizedRole = normalizeMatchSquadRole(role)

    players.value = players.value.map((player) =>
      String(player.playerId) === normalizedPlayerId
        ? { ...player, role: normalizedRole }
        : player,
    )
  }

  function reset() {
    players.value = []
  }

  const canSubmit = computed(() => players.value.some((player) =>
    [MATCH_SQUAD_PLAYER_ROLE.STARTER, MATCH_SQUAD_PLAYER_ROLE.SUBSTITUTE, MATCH_SQUAD_PLAYER_ROLE.RESERVE].includes(player.role),
  ))

  return {
    canSubmit,
    payload,
    players,
    reserves,
    reset,
    setRole,
    starters,
    substitutes,
    syncFromEligibility,
    unavailable,
  }
}
