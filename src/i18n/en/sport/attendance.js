export default {
  sportAttendanceStatus: {
    present: 'Present',
    presentShort: 'P',
    absent: 'Absent',
    absentShort: 'A',
    late: 'Late',
    lateShort: 'L',
    excused: 'Excused',
    excusedShort: 'E',
  },
  sportAttendanceType: {
    player: 'Player',
    coach: 'Coach',
  },
  sportAttendanceShared: {
    playersEyebrow: 'Players',
    coachesEyebrow: 'Coaches',
    historyEyebrow: 'History',
    progress: 'Progress',
    activeFilters: 'Active filters',
    results: 'Results',
  },
  sportAttendanceHubPage: {
    title: 'Attendance Management',
    subtitle: 'Track player and coach attendance, then review records from a single workflow.',
    cards: {
      players: {
        title: 'Player Attendance',
        description: 'Mark daily attendance for athletes by team.',
      },
      coaches: {
        title: 'Coach Attendance',
        description: 'Record attendance for active coaches each day.',
      },
      idcard: {
        title: 'Generate ID Card',
        description: 'Create and export digital ID cards for players.',
      },
      history: {
        title: 'Attendance History',
        description: 'Review saved attendance records by type, team, and date.',
      },
    },
  },
  sportAdminPlayerAttendancePage: {
    title: 'Player Attendance',
    subtitle: 'Select a team and mark each player for the chosen date.',
    filters: {
      team: 'Team',
      date: 'Date',
    },
    placeholders: {
      team: 'Select a team',
      note: 'Add a note',
    },
    columns: {
      player: 'Player',
      status: 'Status',
      note: 'Note',
    },
    summary: '{marked} of {total} players marked',
    actions: {
      back: 'Back',
      markAllPresent: 'Mark All Present',
      markAllAbsent: 'Mark All Absent',
      clearAll: 'Clear All',
      saving: 'Saving...',
      save: 'Save Attendance',
    },
    messages: {
      selectTeam: 'Choose a team to load its roster.',
      noPlayers: 'No players were found for the selected team.',
      loadFailed: 'Unable to load player attendance.',
      saveFailed: 'Unable to save player attendance.',
      saved: 'Player attendance saved.',
      skippedNote: 'Only players with a selected status will be saved.',
    },
  },
  sportAdminCoachAttendancePage: {
    title: 'Coach Attendance',
    subtitle: 'Mark attendance for coaches for the selected date.',
    filters: {
      date: 'Date',
    },
    placeholders: {
      note: 'Add a note',
    },
    columns: {
      coach: 'Coach',
      status: 'Status',
      note: 'Note',
    },
    summary: '{marked} of {total} coaches marked',
    actions: {
      back: 'Back',
      markAllPresent: 'Mark All Present',
      markAllAbsent: 'Mark All Absent',
      clearAll: 'Clear All',
      saving: 'Saving...',
      save: 'Save Attendance',
    },
    messages: {
      noCoaches: 'No coaches were found.',
      loadFailed: 'Unable to load coach attendance.',
      saveFailed: 'Unable to save coach attendance.',
      saved: 'Coach attendance saved.',
      skippedNote: 'Only coaches with a selected status will be saved.',
    },
  },
  sportAdminAttendanceHistoryPage: {
    title: 'Attendance History',
    subtitle: 'Search attendance records by person type, team, and date range.',
    filters: {
      type: 'Type',
      team: 'Team',
      from: 'From',
      to: 'To',
      search: 'Search',
    },
    placeholders: {
      type: 'Choose a type',
      team: 'All teams',
      search: 'Search by name or note',
    },
    columns: {
      date: 'Date',
      type: 'Type',
      team: 'Team',
      person: 'Person',
      status: 'Status',
      note: 'Note',
      recordedBy: 'Recorded By',
    },
    actions: {
      apply: 'Apply Filters',
      reset: 'Reset',
      back: 'Back',
    },
    messages: {
      noRecords: 'No attendance records match the current filters.',
      loadFailed: 'Unable to load attendance history.',
    },
  },
}
