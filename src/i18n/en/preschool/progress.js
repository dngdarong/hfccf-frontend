// Keep progress summary wording separate from the assessment form so future
// reporting screens can reuse the same compact summary labels.
export default {
  preschoolProgressSummaryPage: {
    title: 'Progress Summary',
    subtitle: 'Review finalized assessment trends before the reports phase exists.',
    loading: 'Loading progress summary...',
    emptyRecent: 'No finalized assessments are available yet.',
    emptyTrends: 'No category trends are available yet.',
    cardFallback: 'Summary indicator',
    recentTitle: 'Recent finalized assessments',
    trendsTitle: 'Category trends',
    selectedStudent: 'Selected student: {name}',
    filters: {
      student: 'Student',
    },
    placeholders: {
      student: 'Select a student',
    },
    actions: {
      refresh: 'Refresh Summary',
    },
    cards: {
      total: {
        title: 'All Assessments',
        caption: 'Draft, finalized, and archived records',
      },
      finalized: {
        title: 'Finalized',
        caption: 'Locked progress records',
      },
      draft: {
        title: 'Draft',
        caption: 'Editable assessments',
      },
      average: {
        title: 'Average Score',
        caption: 'Finalized score average',
      },
    },
    countLabel: '{count} assessments',
    averageLabel: 'Average: {score}',
  },
}
