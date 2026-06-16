export function buildActionOptions(t: any) {
  return [
    { label: t('preschoolLifecycleAuditPage.actions.all'), value: '' },
    { label: t('preschoolLifecycleAuditPage.actions.writeBlocked'), value: 'write.blocked' },
    { label: t('preschoolLifecycleAuditPage.actions.overrideAttempt'), value: 'override.attempt' },
    { label: t('preschoolLifecycleAuditPage.actions.overrideApproved'), value: 'override.approved' },
    { label: t('preschoolLifecycleAuditPage.actions.reportPeriodCreated'), value: 'report_period.created' },
    { label: t('preschoolLifecycleAuditPage.actions.reportPeriodFinalized'), value: 'report_period.finalized' },
    { label: t('preschoolLifecycleAuditPage.actions.reportPeriodLocked'), value: 'report_period.locked' },
    { label: t('preschoolLifecycleAuditPage.actions.reportPeriodArchived'), value: 'report_period.archived' },
    { label: t('preschoolLifecycleAuditPage.actions.reportPeriodActivated'), value: 'report_period.activated' },
    { label: t('preschoolLifecycleAuditPage.actions.academicYearClosed'), value: 'academic_year.closed' },
    { label: t('preschoolLifecycleAuditPage.actions.academicYearOpened'), value: 'academic_year.activated' },
    { label: t('preschoolLifecycleAuditPage.actions.termClosed'), value: 'academic_term.closed' },
    { label: t('preschoolLifecycleAuditPage.actions.termOpened'), value: 'academic_term.activated' },
  ]
}

export function buildEntityOptions(t: any) {
  return [
    { label: t('preschoolLifecycleAuditPage.entities.all'), value: '' },
    { label: t('preschoolLifecycleAuditPage.entities.academicTerm'), value: 'academic_term' },
    { label: t('preschoolLifecycleAuditPage.entities.reportPeriod'), value: 'report_period' },
    { label: t('preschoolLifecycleAuditPage.entities.assessment'), value: 'assessment' },
    { label: t('preschoolLifecycleAuditPage.entities.attendance'), value: 'attendance' },
    { label: t('preschoolLifecycleAuditPage.entities.schedule'), value: 'schedule' },
    { label: t('preschoolLifecycleAuditPage.entities.assignment'), value: 'assignment' },
    { label: t('preschoolLifecycleAuditPage.entities.academicYear'), value: 'academic_year' },
  ]
}

export function buildAnalyticsCards(t: any, analytics: any) {
  const overview = analytics.overview || {}
  return [
    {
      title: t('preschoolLifecycleAnalyticsPage.cards.totalEvents'),
      value: overview.totalEvents ?? 0,
      caption: t('preschoolLifecycleAnalyticsPage.cards.totalEventsCaption'),
    },
    {
      title: t('preschoolLifecycleAnalyticsPage.cards.blockedWrites'),
      value: overview.blockedWrites ?? 0,
      caption: t('preschoolLifecycleAnalyticsPage.cards.blockedWritesCaption'),
    },
    {
      title: t('preschoolLifecycleAnalyticsPage.cards.overrides'),
      value: overview.overrideApprovals ?? 0,
      caption: t('preschoolLifecycleAnalyticsPage.cards.overridesCaption'),
    },
    {
      title: t('preschoolLifecycleAnalyticsPage.cards.snapshots'),
      value: overview.snapshotCount ?? 0,
      caption: t('preschoolLifecycleAnalyticsPage.cards.snapshotsCaption'),
    },
  ]
}
