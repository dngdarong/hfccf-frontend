/**
 * English translations for Preschool Assessment module
 */

export default {
  // Page titles
  dashboard: 'Assessment Dashboard',
  list: 'Assessment Management',
  reports: 'Assessment Reports',
  settings: 'Assessment Settings',

  // Dashboard
  dashboardSubtitle: 'Track and manage student assessments with comprehensive analytics',
  welcomeTitle: 'Welcome to Assessment Hub',
  welcomeDescription: 'Manage student assessments, track progress, and identify areas for improvement.',

  // Buttons
  createAssessment: 'Create Assessment',
  viewReports: 'View Reports',
  manageSettings: 'Settings',
  createNew: 'Create New Assessment',
  clearAll: 'Clear All Filters',

  // Metrics
  totalAssessments: 'Total Assessments',
  completed: 'Completed',
  pending: 'Pending',
  averageScore: 'Average Score',
  categories: 'Categories',
  highRisk: 'High Risk',

  // Status
  draft: 'Draft',
  finalized: 'Finalized',
  archived: 'Archived',

  // Ratings
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  needsImprovement: 'Needs Improvement',

  // Form labels
  student: 'Student',
  class: 'Class',
  category: 'Category',
  period: 'Period',
  assessmentDate: 'Assessment Date',
  score: 'Score',
  rating: 'Rating',
  observation: 'Observation',
  teacherComment: 'Teacher Comment',

  // Filter labels
  filters: 'Filters',
  search: 'Search',
  status: 'Status',
  moreFilters: 'More Filters',
  hideFilters: 'Hide Filters',

  // Table columns
  dateColumn: 'Date',
  scoreColumn: 'Score',
  ratingColumn: 'Rating',
  statusColumn: 'Status',
  actions: 'Actions',

  // Modal titles
  createTitle: 'Create Assessment',
  editTitle: 'Edit Assessment',
  studentInformation: 'Student Information',
  assessmentDetails: 'Assessment Details',
  scoring: 'Scoring',

  // Empty states
  noAssessments: 'No assessments found',
  noAssessmentsDescription: 'Create your first assessment or adjust your filters',

  // Risk analysis
  riskAnalysis: 'Risk Analysis',
  riskDistribution: 'Risk Level Distribution',
  topPerformers: 'Top Performers',
  topCategories: 'Top Assessment Categories',

  // Risk levels
  riskLevelExcellent: 'Excellent (80+)',
  riskLevelGood: 'Good (70-79)',
  riskLevelFair: 'Fair (60-69)',
  riskLevelAtRisk: 'At Risk (<60)',

  // Reports
  summaryStatistics: 'Summary Statistics',
  categoryPerformance: 'Category Performance',
  periodComparison: 'Period Comparison',
  improvementTrend: 'Improvement Trend',
  exportReports: 'Export Reports',
  exportPDF: 'Export PDF',
  exportExcel: 'Export Excel',
  exportCSV: 'Export CSV',

  // Settings
  riskManagement: 'Risk Management',
  assessmentOptions: 'Assessment Options',
  categoryManagement: 'Category Management',
  periodConfiguration: 'Period Configuration',
  ratingScale: 'Rating Scale',
  saveSettings: 'Save Settings',
  resetSettings: 'Reset',
  settingsSaved: 'Settings saved successfully!',

  // Settings options
  enableRiskTracking: 'Enable Risk Tracking',
  riskThreshold: 'Risk Threshold Score',
  enableAutoRating: 'Enable Auto-Rating',
  requireObservation: 'Require Observation Notes',
  requireTeacherComment: 'Require Teacher Comment',
  allowArchiving: 'Allow Assessment Archiving',
  notifyOnHighRisk: 'Send Notifications',

  // Quick start
  quickStartGuide: 'Quick Start Guide',
  step1Create: 'Create',
  step2Track: 'Track',
  step3Analyze: 'Analyze',
  step4Improve: 'Improve',
  step1Desc: 'New assessment',
  step2Desc: 'Student progress',
  step3Desc: 'Performance data',
  step4Desc: 'Learning outcomes',

  // Messages
  selectStudent: 'Select Student',
  selectCategory: 'Assessment Category',
  allStudents: 'All students',
  allClasses: 'All classes',
  allCategories: 'All categories',
  allPeriods: 'All periods',
  allStatuses: 'All Statuses',

  // Success messages
  assessmentCreated: 'Assessment created successfully',
  assessmentUpdated: 'Assessment updated successfully',
  assessmentFinalized: 'Assessment finalized successfully',
  assessmentArchived: 'Assessment archived successfully',

  // Help text
  scoreInterpretation: 'Score Interpretation',
  suggestedRating: 'Based on the score, the suggested rating is',
  useSuggested: 'Use suggested',

  // Navigation
  backToDashboard: 'Back to Dashboard',
  viewDetails: 'View Details',
  edit: 'Edit',
  finalize: 'Finalize',
  archive: 'Archive',

  assessmentFormBuilder: {
    actions: {
      saveDraft: 'Save Draft',
      duplicate: 'Duplicate',
      publish: 'Publish',
      archive: 'Archive',
      restore: 'Restore',
    },
    status: {
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived',
    },
    messages: {
      loading: 'Loading template...',
      unsavedChanges: 'Unsaved changes',
      savedState: 'Draft saved',
      saved: 'Draft saved.',
      duplicated: 'Template duplicated.',
      published: 'Template published.',
      archived: 'Template archived.',
      restored: 'Template restored.',
    },
    notes: {
      publishTitle: 'Publish note',
      publishHint: 'Optional reason that will be saved with the published version.',
      publishPlaceholder: 'Add a note before publishing...',
      versionTitle: 'Version note',
      versionHint: 'Stored with the template and version snapshot for traceability.',
      versionPlaceholder: 'Add a version note...',
      reviewTitle: 'Review note',
      reviewPlaceholder: 'Add a review note...',
      duplicateTitle: 'Duplicate reason',
      duplicateHint: 'Optional note saved when creating a draft copy from a version.',
      duplicatePlaceholder: 'Add a duplication note...',
      restoreTitle: 'Restore reason',
      restorePlaceholder: 'Add a restore note...',
    },
    versionHistory: {
      eyebrow: 'Version history',
      title: 'Review versions',
      subtitle: 'Compare, duplicate, or restore a saved template version.',
      loading: 'Loading versions...',
      empty: 'No version history yet.',
      versionLabel: 'Version',
      currentDraft: 'Current draft',
      sections: 'Sections',
      questions: 'Questions',
      updatedAt: 'Updated',
      publishedAt: 'Published',
      updatedBy: 'Updated by',
      reviewedBy: 'Reviewed by',
      reviewedAt: 'Reviewed at',
      system: 'System',
      viewVersion: 'View version',
      duplicateDraft: 'Duplicate as draft',
      restoreVersion: 'Restore version',
      compareVersions: 'Compare versions',
      summary: 'Summary',
      templateTitle: 'Template title',
      versionTitle: 'Selected title',
      templateStatus: 'Status',
      sectionCount: 'Section count',
      questionCount: 'Question count',
      publishReason: 'Publish reason',
      versionNote: 'Version note',
      reviewNote: 'Review note',
      noNotesProvided: 'No notes provided',
      duplicatedFrom: 'Duplicated from',
      restoredFrom: 'Restored from',
      sectionsChanged: 'Sections changed',
      questionsChanged: 'Questions changed',
      scoringChanges: 'Scoring changes',
      validationChanges: 'Validation changes',
      noSectionChanges: 'No section changes detected.',
      noQuestionChanges: 'No question changes detected.',
      noScoringChanges: 'No scoring changes detected.',
      noValidationChanges: 'No validation changes detected.',
      unsavedChangesWarning: 'You have unsaved changes in the current builder.',
      unsavedChangesPrompt: 'You have unsaved changes. Continue and leave the current draft?',
      versionLoaded: 'Version loaded into the current draft.',
      versionDuplicated: 'Version duplicated as a draft.',
      missingSnapshot: 'This version cannot be used because the snapshot is unavailable.',
      addNoteBeforePublishing: 'Add a note before publishing',
      versionMetadata: 'Version metadata',
      added: 'added',
      changed: 'changed',
      validationChanged: 'validation changed',
      notAvailable: 'N/A',
    },
  },
}
