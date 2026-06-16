export default {
  preschoolLifecycleAnalyticsPage: {
    title: 'Lifecycle audit analytics',
    subtitle: 'Lightweight trends for overrides, blocked writes, and report-period lifecycle activity.',
    loading: 'Loading lifecycle analytics...',
    loadingError: 'Failed to load lifecycle analytics.',
    actions: {
      refresh: 'Refresh analytics',
    },
    cards: {
      totalEvents: 'Total events',
      totalEventsCaption: 'Lifecycle-sensitive actions recorded by Preschool.',
      blockedWrites: 'Blocked writes',
      blockedWritesCaption: 'Lifecycle conflicts prevented by the backend guard layer.',
      overrides: 'Override approvals',
      overridesCaption: 'Approved admin overrides recorded in the audit trail.',
      snapshots: 'Snapshots',
      snapshotsCaption: 'Immutable report snapshots generated for locked history.',
    },
    sections: {
      overrideTrends: 'Override reasons',
      blockedWrites: 'Blocked write trend',
      lifecycleActivity: 'Lifecycle activity',
      actorActivity: 'Actor activity',
      lifecycleTimeline: 'Lifecycle timeline',
    },
    emptyOverrideReasons: 'No override reasons recorded yet.',
    emptyBlockedWrites: 'No blocked writes recorded for the current filter.',
    emptyLifecycleActivity: 'No lifecycle actions recorded for the current filter.',
    emptyActorActivity: 'No actor activity recorded for the current filter.',
    emptyLifecycleTimeline: 'No lifecycle timeline entries recorded for the current filter.',
  },
}
