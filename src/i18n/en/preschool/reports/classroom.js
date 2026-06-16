// Keep classroom report copy separate so the overview, student, and classroom
// screens remain searchable and easy to maintain as reporting grows.
export default {
  preschoolClassroomReportsPage: {
    title: 'Classroom Reports',
    subtitle: 'Review classroom-wide progress, attendance, and observations.',
    filters: {
      class: 'Class',
      period: 'Reporting Period',
    },
    placeholders: {
      class: 'Select a class',
      period: 'Select a report period',
    },
    actions: {
      back: 'Back to Overview',
    },
    studentsTitle: 'Student Summaries',
    emptyStudents: 'No student summaries are available for this period.',
    studentColumns: {
      name: 'Student',
      assessments: 'Assessments',
      average: 'Average',
      attendance: 'Attendance',
      latest: 'Latest Assessment',
    },
  },
}
