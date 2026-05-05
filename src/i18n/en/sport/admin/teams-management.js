export default {
  sportTeamsManagement: {
    title: 'Teams Management',
    subtitle: 'Monitor squad readiness, divisions, roster size, and match performance across the sport program.',
    addButton: 'Add Team',
    searchPlaceholder: 'Search teams, coaches, captains, divisions, or venues',
    tableEmpty: 'No teams found.',
    toolbarEyebrow: 'Team directory',
    toolbarSummary: '{count} teams in view',
    visibleRange: 'Showing {start}-{end} of {total} teams',
    noResults: 'No teams match the current filters.',
    spotlightLabel: 'Active squads',
    highlights: {
      visibleTeams: 'Visible teams',
      visiblePlayers: 'Visible players',
      visibleMatches: 'Visible matches',
      topPoints: 'Top points',
    },
    summary: {
      total: {
        title: 'Total teams',
        badge: '{count} visible',
        caption: 'All squads currently tracked for competition, training, and operational planning.',
      },
      active: {
        title: 'Active squads',
        badge: '{rate} competition ready',
        caption: 'Teams marked ready for fixtures, training cycles, and current program operations.',
      },
      pending: {
        title: 'Pending setup',
        badge: 'Needs final review',
        badgeClear: 'No pending squads',
        caption: 'Teams still waiting on roster confirmation, scheduling, or final administrative approval.',
      },
      players: {
        title: 'Rostered players',
        badge: 'Across all listed teams',
        caption: 'Total athletes assigned to the current team structure in the sport program.',
      },
    },
    table: {
      team: 'Team',
      division: 'Division',
      coach: 'Coach',
      players: 'Players',
      matches: 'Matches',
      record: 'Record',
      venue: 'Venue',
      captainPrefix: 'Captain: {captain}',
      pointsPrefix: '{points} pts',
    },
  },
}

