export default {
  preschoolReportSnapshots: {
    title: 'Immutable report snapshots',
    labels: {
      immutableSnapshot: 'Immutable snapshot',
      liveReport: 'Live report',
      frozenReport: 'Frozen report',
      snapshotGenerated: 'Snapshot generated',
      generatedAt: 'Generated at',
      version: 'Version',
      studentReportTitle: 'Student report snapshot',
      studentReportSubtitle: 'This student report uses the immutable snapshot for the selected report period.',
      classroomReportTitle: 'Classroom report snapshot',
      classroomReportSubtitle: 'This classroom report uses the immutable snapshot for the selected report period.',
      progressSummaryTitle: 'Progress summary snapshot',
      progressSummarySubtitle: 'This progress summary is preserved so the historical output does not drift later.',
    },
    states: {
      draft: 'Draft snapshot',
      active: 'Active snapshot',
      finalized: 'Finalized snapshot',
      locked: 'Locked snapshot',
      archived: 'Archived snapshot',
    },
  },
}
