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
  sportAttendanceShared: {
    playersEyebrow: 'Players',
    historyEyebrow: 'History',
    progress: 'Progress',
    activeFilters: 'Active filters',
    results: 'Results',
  },
  sportAttendanceHubPage: {
    title: 'Attendance Management',
    subtitle: 'Track player attendance, then review records from a single workflow.',
    cards: {
      players: {
        title: 'Player Attendance',
        description: 'Mark daily attendance for athletes by team.',
      },
      idcard: {
        title: 'Generate ID Card',
        description: 'Create and export digital ID cards for players.',
      },
      history: {
        title: 'Attendance History',
        description: 'Review saved attendance records by team and date.',
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
      reason: 'Reason (optional)',
    },
    columns: {
      player: 'Player',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
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
  sportCoachPlayerAttendancePage: {
    title: 'Player Attendance',
    subtitle: 'Choose one of your assigned teams and mark each player for the selected date.',
    messages: {
      noTeams: 'No active team assignments were found for your account.',
    },
  },
  sportAdminAttendanceHistoryPage: {
    title: 'Attendance History',
    subtitle: 'Search player attendance records by team and date range.',
    filters: {
      team: 'Team',
      from: 'From',
      to: 'To',
      search: 'Search',
    },
    placeholders: {
      team: 'All teams',
      search: 'Search by name or note',
    },
    columns: {
      date: 'Date',
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
