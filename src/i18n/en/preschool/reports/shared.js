// Keep report shared labels separate so the student and classroom pages can
// reuse the same loading, empty, and observation copy without duplication.
export default {
  preschoolReportsShared: {
    loading: 'Loading report...',
    emptyReport: 'Select a student and a reporting period to view the report.',
    emptyOverview: 'No finalized report periods are available yet.',
    periodHint: 'Reports are built from finalized assessments only.',
    summary: {
      finalized: 'Assessments',
      finalizedCaption: 'Finalized records in this period',
      average: 'Average Score',
      averageCaption: 'Average across all categories',
      observations: 'Observations',
      observationsCaption: 'Teacher notes recorded this period',
      latest: 'Last Assessment',
      latestCaption: 'Most recent finalized date',
      students: 'Students',
      studentsCaption: 'Students tracked in the classroom',
    },
    attendanceTitle: 'Attendance',
    attendanceSubtext: 'Within the selected reporting period.',
    attendance: {
      total: 'Total Days',
      present: 'Present',
      late: 'Late',
      absent: 'Absent',
      excused: 'Excused',
      latest: 'Last attendance record: {date}',
      totalShort: '{count} records',
      rateLabel: 'Attendance rate',
    },
    // ── Data source labels (replaces cryptic "Immutable Snapshot" jargon) ──
    dataSource: {
      live: 'Live Report',
      liveNote: 'Data reflects the latest finalized assessments.',
      snapshot: 'Saved Snapshot',
      snapshotNote: 'This report was saved when the period was finalized. Data will not change.',
      asOf: 'As of',
    },
    // ── Category performance section ──────────────────────────────────────
    categoryPerformanceTitle: 'Performance by Category',
    categoryPerformanceSubtitle: 'Average score per learning area across all finalized assessments.',
    emptyCategorySummaries: 'No category data available for this period.',
    assessmentCount: '{count} assessments',
    // ── Observations ──────────────────────────────────────────────────────
    observationsTitle: 'Teacher Observations',
    observationsSubtitle: 'Notes and comments recorded during this period.',
    emptyObservations: 'No teacher observations were recorded for this period.',
    // ── Assessment detail list ─────────────────────────────────────────────
    assessmentsTitle: 'Assessment Details',
    assessmentsSubtitle: 'All finalized records, grouped by learning category.',
    emptyAssessments: 'No finalized assessments were found for this period.',
    labels: {
      studentFallback: 'Student',
      categoryFallback: 'Uncategorized',
      score: 'Score: {score}',
      assessedBy: 'by',
    },
    actions: {
      refresh: 'Reload Report',
    },
  },
}
