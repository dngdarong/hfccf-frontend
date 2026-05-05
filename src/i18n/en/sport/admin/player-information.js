export default {
  sportPlayerInformation: {
    title: 'Player Information',
    subtitle: 'Track player records, readiness, and team assignment across the sport program.',
    searchPlaceholder: 'Search players...',
    tableEmpty: 'No player records found.',
    toolbarEyebrow: 'Player records',
    toolbarSummary: '{count} player records in view',
    visibleRange: 'Showing {start}-{end} of {total} player records',
    noResults: 'No player records match the current filters.',
    activeRateLabel: 'Active rate',
    addButton: 'Add Player',
    table: {
      player: 'Player',
      team: 'Team',
      division: 'Division',
      position: 'Position',
      jersey: 'Jersey No.',
      age: 'Age',
      matches: 'Matches',
      goals: 'Goals',
    },
    // Player status vocabulary is owned by the sport module (players are data, not users).
    status: {
      active: 'Active',
      pending: 'Pending',
      inactive: 'Inactive',
      suspended: 'Suspended',
    },
    confirm: {
      deleteTitle: 'Delete player?',
      deleteMessage: 'Are you sure you want to delete {name}?',
      deletedMessage: 'Deleted {name}.',
      defaultName: 'this player',
    },
    highlights: {
      visiblePlayers: 'Visible players',
      divisions: 'Divisions',
      attentionItems: 'Attention items',
    },
    summary: {
      total: {
        title: 'Total players',
        badge: '{count} visible',
        caption: 'Player records currently prepared for the sport program.',
      },
      active: {
        title: 'Active players',
        badge: '{rate} roster ready',
        caption: 'Records marked ready for current planning, training, and coordination work.',
      },
      pending: {
        title: 'Pending review',
        badge: 'Needs follow-up',
        badgeClear: 'No backlog',
        caption: 'Records still waiting on review, confirmation, or final data checks.',
      },
      attention: {
        title: 'Needs attention',
        badge: 'Inactive or suspended',
        badgeClear: 'All clear',
        caption: 'Player records that may need follow-up before they can be used in operations.',
      },
    },
  },
}

