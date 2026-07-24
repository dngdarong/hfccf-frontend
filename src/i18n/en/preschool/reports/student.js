// Keep student report copy separate so reporting labels stay aligned with the
// backend assessment-period contract and the classroom screen can evolve later.
export default {
  preschoolStudentReportsPage: {
    title: 'Student Reports',
    subtitle: 'Review finalized assessments, attendance, and teacher observations for a student.',
    filters: {
      periodType: 'Period Type',
      student: 'Student',
      period: 'Reporting Period',
    },
    placeholders: {
      periodType: 'Select period type',
      student: 'Select a student',
      period: 'Select a period',
    },
    periodTypes: {
      monthly: 'Monthly',
      term: 'Term',
      annual: 'Annual',
    },
    actions: {
      back: 'Back',
      load: 'Load Report',
      loading: 'Loading…',
    },
  },
}
