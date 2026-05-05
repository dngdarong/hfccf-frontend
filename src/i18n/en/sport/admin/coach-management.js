export default {
  sportCoachManagement: {
    title: 'Coach Management',
    subtitle: 'Track coaching staff, approvals, and roster readiness across the sport program.',
    addButton: 'Add Coach',
    addButtonCaption: 'Create coach profile',
    searchPlaceholder: 'Search coaches, emails, or permissions',
    tableEmpty: 'No coaches found.',
    toolbarEyebrow: 'Coach directory',
    toolbarSummary: '{count} coaches in view',
    visibleRange: 'Showing {start}-{end} of {total} coaches',
    noResults: 'No coaches match the current filters.',
    activeRateLabel: 'Active rate',
    highlights: {
      visibleRoster: 'Visible roster',
      pendingReview: 'Pending review',
      attentionItems: 'Attention items',
    },
    summary: {
      total: {
        title: 'Total coaches',
        badge: '{count} visible',
        caption: 'Full coaching roster currently assigned to the sport program.',
      },
      active: {
        title: 'Active coaches',
        badge: '{rate} roster ready',
        caption: 'Available for current sessions, match preparation, and day-to-day operations.',
      },
      pending: {
        title: 'Pending approvals',
        badge: 'Needs onboarding follow-up',
        badgeClear: 'No backlog',
        caption: 'Accounts still waiting for review, confirmation, or final access activation.',
      },
      attention: {
        title: 'Needs attention',
        badge: 'Inactive or suspended',
        badgeClear: 'All clear',
        caption: 'Profiles with delivery risk that may affect training continuity or staffing.',
      },
    },
  },
}
