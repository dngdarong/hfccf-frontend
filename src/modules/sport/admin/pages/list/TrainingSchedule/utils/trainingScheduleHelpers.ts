export function normalize(value: any): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function filterSessions(
  sessions: any[],
  searchQuery: string,
  intensityFilter: string,
  statusFilter: string,
  teamFilter: string,
): any[] {
  const query = normalize(searchQuery)

  return sessions.filter((session) => {
    let matches = true

    if (query) {
      const haystack = normalize(`${session.title} ${session.team} ${session.venue} ${session.focus}`)
      matches = haystack.includes(query)
    }

    if (matches && intensityFilter) {
      matches = normalize(session.intensity) === normalize(intensityFilter)
    }

    if (matches && statusFilter) {
      matches = normalize(session.status) === normalize(statusFilter)
    }

    if (matches && teamFilter) {
      matches = normalize(session.team) === normalize(teamFilter)
    }

    return matches
  })
}

export function getPaginatedSessions(sessions: any[], currentPage: number, pageSize: number): any[] {
  const start = (currentPage - 1) * pageSize
  return sessions.slice(start, start + pageSize)
}

export function getFilterOptions(sessions: any[], filterType: 'intensity' | 'status' | 'team'): string[] {
  const key = {
    intensity: 'intensity',
    status: 'status',
    team: 'team',
  }[filterType]

  const options = sessions.map((s: any) => s[key]).filter(Boolean)
  return [...new Set(options)].sort()
}

export function calculateLiveSessionsCount(sessions: any[]): number {
  return sessions.filter((s) => normalize(s.status) === 'live').length
}
