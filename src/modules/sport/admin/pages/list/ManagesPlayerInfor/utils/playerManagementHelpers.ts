export function normalize(value: string | number | undefined | null): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function filterPlayers(
  players: any[],
  searchQuery: string,
  statusFilter: string,
  divisionFilter: string,
  teamFilter: string,
): any[] {
  const query = normalize(searchQuery)

  return players.filter((player) => {
    let isMatch = true

    if (query) {
      const haystack = normalize(
        [
          player.playerCode,
          player.name,
          player.position,
          player.primaryPosition,
          player.team,
          player.division,
          player.status,
          player.phone,
          player.jerseyNumber,
        ]
          .filter((value) => value !== undefined && value !== null)
          .join(' '),
      )
      isMatch = haystack.includes(query)
    }

    if (isMatch && statusFilter) {
      isMatch = normalize(player.status) === normalize(statusFilter)
    }

    if (isMatch && divisionFilter) {
      isMatch = normalize(player.division) === normalize(divisionFilter)
    }

    if (isMatch && teamFilter) {
      isMatch = normalize(player.team) === normalize(teamFilter)
    }

    return isMatch
  })
}

export function getPaginatedPlayers(
  players: any[],
  currentPage: number,
  pageSize: number,
): any[] {
  const start = (currentPage - 1) * pageSize
  return players.slice(start, start + pageSize).map((player, index) => ({
    ...player,
    position: String(player?.primaryPosition || player?.position || '').trim(),
    rowNumber: start + index + 1,
  }))
}

export function calculatePlayerMetrics(players: any[]) {
  const activePlayers = players.filter((player) => normalize(player.status) === 'active').length
  const pendingPlayers = players.filter((player) => normalize(player.status) === 'pending').length
  const attentionPlayers = players.filter((player) =>
    ['inactive', 'suspended'].includes(normalize(player.status)),
  ).length

  return {
    totalPlayers: players.length,
    activePlayers,
    pendingPlayers,
    attentionPlayers,
    activeRate: players.length ? `${Math.round((activePlayers / players.length) * 100)}%` : '0%',
  }
}

export function getHighlightItems(filteredPlayers: any[], t: any) {
  return [
    {
      label: t('sportPlayerInformation.highlights.visiblePlayers'),
      value: filteredPlayers.length,
    },
    {
      label: t('sportPlayerInformation.highlights.divisions'),
      value: new Set(filteredPlayers.map((player) => player.division).filter(Boolean)).size,
    },
    {
      label: t('sportPlayerInformation.highlights.attentionItems'),
      value: filteredPlayers.filter((player) =>
        ['inactive', 'suspended'].includes(normalize(player.status)),
      ).length,
    },
  ]
}

export function getDivisionOptions(players: any[]): string[] {
  const divisions = players.map((p) => p.division).filter(Boolean)
  return [...new Set(divisions)].sort()
}

export function getTeamOptions(players: any[]): string[] {
  const teams = players.map((p) => p.team).filter(Boolean)
  return [...new Set(teams)].sort()
}
