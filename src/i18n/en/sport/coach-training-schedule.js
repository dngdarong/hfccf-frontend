export default {
  coachTrainingSchedule: {
    title: 'Training Schedule',
    subtitle: 'Manage and track upcoming training sessions, venues, and focus areas for your teams.',
    toolbarEyebrow: 'Coaching Planner',
    toolbarSummary: '{count} Sessions scheduled',
    noResults: 'No training sessions found',
    visibleRange: 'Showing {shown} of {total} sessions',
    spotlightLabel: 'Active sessions',
    actions: {
      addButton: 'Add Session',
    },
    table: {
      title: 'Session Title',
      team: 'Team / Division',
      venue: 'Venue',
      dateTime: 'Date & Time',
      status: 'Status',
      intensity: 'Intensity',
      actions: 'Actions',
      empty: 'No training sessions scheduled at this time.',
    },
    status: {
      scheduled: 'Scheduled',
      live: 'Live',
      completed: 'Completed',
      postponed: 'Postponed',
      cancelled: 'Cancelled',
    },
    intensity: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    filters: {
      searchPlaceholder: 'Search sessions, teams, venues...',
      intensity: 'Intensity',
      status: 'Status',
      team: 'All Teams',
    },
    feedback: {
      addTitle: 'Feature Scaffolded',
      addMessage: 'The ability to add training sessions is coming soon in the next sprint.',
      deleteTitle: 'Delete Session?',
      deleteMessage: "Are you sure you want to delete '{title}'? This action cannot be undone.",
    },
  },
}
