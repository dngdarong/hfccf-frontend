export default {
  sportCoachDashboard: {
    title: 'Coaching Control Panel',
    subtitle: 'Assigned teams and recent match activity.',
    cards: {
      teams: {
        title: 'Teams',
        label: 'Assigned teams',
      },
      matches: {
        title: 'Matches',
        label: 'Recent matches',
      },
      liveMatches: {
        title: 'Live matches',
        label: 'Current activity',
      },
      upcoming: {
        title: 'Upcoming',
        label: 'Scheduled next',
      },
    },
    spotlight: {
      title: 'Athlete readiness',
      text: 'Complete performance reviews and monitor injury watchlist before next sessions.',
    },
    actions: {
      finalizePlans: 'Finalize training intensity plans',
      submitNotes: 'Submit performance notes',
      confirmRecovery: 'Confirm recovery protocols',
      viewSchedule: 'View training schedule',
      openTeams: 'Open my teams',
      markAttendance: 'Mark attendance',
    },
    nextTraining: {
      title: 'Next training session',
      empty: 'No upcoming training session.',
    },
    teamOverview: {
      title: 'My team overview',
      activePlayers: '{count} active players',
      nextMatch: 'Next match: {match}',
      empty: 'No assigned teams found.',
    },
    quickActions: {
      title: 'Quick actions',
    },
    states: {
      loading: 'Loading...',
      retry: 'Retry',
      loadError: 'Unable to load this dashboard section.',
    },
  },
}
