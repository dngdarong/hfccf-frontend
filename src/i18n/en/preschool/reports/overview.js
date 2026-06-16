// Keep the report overview copy isolated so the landing page can evolve
// independently from the student and classroom report screens.
export default {
  preschoolReportsPage: {
    title: 'Preschool Reports',
    subtitle: 'Review finalized assessment and attendance data by reporting period.',
    loading: 'Loading report periods...',
    emptyOverview: 'No finalized report periods are available yet.',
    actions: {
      openStudentReports: 'Student Reports',
      openClassroomReports: 'Classroom Reports',
    },
    overview: {
      periods: 'Report Periods',
      periodsCaption: 'Finalized periods available for reporting',
      students: 'Tracked Students',
      studentsCaption: 'Students currently available in Preschool',
      finalized: 'Finalized Periods',
      finalizedCaption: 'Closed reporting windows that should remain stable',
      locked: 'Locked / Archived',
      lockedCaption: 'Periods that are read-only for normal workflows',
      listTitle: 'Reporting Periods',
      listSubtitle: 'Finalized report periods derived from assessment data.',
    },
    selectedPeriod: {
      title: 'Selected Report Period',
      subtitle: 'The selected period controls which report output is shown below.',
    },
    periodColumns: {
      label: 'Period',
      status: 'Status',
      dates: 'Date Range',
      assessments: 'Assessments',
      students: 'Students',
      classes: 'Classes',
    },
  },
}
