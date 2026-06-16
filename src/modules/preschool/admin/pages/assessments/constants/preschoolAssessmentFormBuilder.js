export const PRESCHOOL_ASSESSMENT_FORM_BUILDER_SECTIONS = [
  {
    key: 'library',
    titleKey: 'assessmentFormBuilder.sidebar.library',
    titleFallback: 'Question Library',
    descriptionKey: 'assessmentFormBuilder.sidebar.libraryDescription',
    descriptionFallback: 'Reusable questions, templates, and common building blocks.',
    icon: 'pi pi-book',
  },
  {
    key: 'sections',
    titleKey: 'assessmentFormBuilder.sidebar.sections',
    titleFallback: 'Sections',
    descriptionKey: 'assessmentFormBuilder.sidebar.sectionsDescription',
    descriptionFallback: 'Organize the assessment into logical sections and groups.',
    icon: 'pi pi-list',
  },
  {
    key: 'logic',
    titleKey: 'assessmentFormBuilder.sidebar.logic',
    titleFallback: 'Conditional Logic',
    descriptionKey: 'assessmentFormBuilder.sidebar.logicDescription',
    descriptionFallback: 'Show or hide questions based on answers.',
    icon: 'pi pi-share-alt',
  },
]

export const PRESCHOOL_ASSESSMENT_FORM_BUILDER_PALETTE = [
  {
    key: 'shortText',
    group: 'core',
    icon: 'pi pi-pencil',
    titleFallback: 'Short Text',
    descriptionFallback: 'Single line text input for names and brief answers.',
  },
  {
    key: 'longText',
    group: 'core',
    icon: 'pi pi-align-left',
    titleFallback: 'Long Text',
    descriptionFallback: 'Multi-line response field for narratives and notes.',
  },
  {
    key: 'dropdown',
    group: 'choices',
    icon: 'pi pi-chevron-down',
    titleFallback: 'Dropdown',
    descriptionFallback: 'Pick one option from a structured list.',
  },
  {
    key: 'rating',
    group: 'choices',
    icon: 'pi pi-star',
    titleFallback: 'Rating Scale',
    descriptionFallback: 'Score an answer with a consistent rating scale.',
  },
  {
    key: 'table',
    group: 'structured',
    icon: 'pi pi-table',
    titleFallback: 'Table / Grid',
    descriptionFallback: 'Capture repeated answers in a matrix layout.',
  },
  {
    key: 'signature',
    group: 'structured',
    icon: 'pi pi-sign-in',
    titleFallback: 'Signature',
    descriptionFallback: 'Collect guardian, teacher, or reviewer approval.',
  },
]

export const PRESCHOOL_ASSESSMENT_FORM_BUILDER_CANVAS = [
  {
    key: 'studentProfile',
    titleKey: 'assessmentFormBuilder.canvas.studentProfile',
    titleFallback: 'Student Profile',
    descriptionKey: 'assessmentFormBuilder.canvas.studentProfileDescription',
    descriptionFallback: 'Identity, class, and academic information.',
  },
  {
    key: 'family',
    titleKey: 'assessmentFormBuilder.canvas.family',
    titleFallback: 'Family Information',
    descriptionKey: 'assessmentFormBuilder.canvas.familyDescription',
    descriptionFallback: 'Guardian contacts, household composition, and support data.',
  },
  {
    key: 'scoring',
    titleKey: 'assessmentFormBuilder.canvas.scoring',
    titleFallback: 'Scoring Rubric',
    descriptionKey: 'assessmentFormBuilder.canvas.scoringDescription',
    descriptionFallback: 'Weights, thresholds, and risk rules.',
  },
]

export const PRESCHOOL_ASSESSMENT_FORM_BUILDER_DEFAULT_SECTIONS = [
  {
    key: 'studentProfile',
    titleFallback: 'Student Profile',
    descriptionFallback: 'Identity, class, and academic information.',
    questionCount: 4,
    hintFallback: 'Place core identification and academic questions here.',
  },
  {
    key: 'family',
    titleFallback: 'Family Information',
    descriptionFallback: 'Guardian contacts, household composition, and support data.',
    questionCount: 5,
    hintFallback: 'Add household and guardian questions to this section.',
  },
  {
    key: 'scoring',
    titleFallback: 'Scoring Rubric',
    descriptionFallback: 'Weights, thresholds, and risk rules.',
    questionCount: 3,
    hintFallback: 'Map question scores to risk categories and thresholds.',
  },
]

export const PRESCHOOL_ASSESSMENT_FORM_BUILDER_SECTION_QUESTION_SEEDS = {
  studentProfile: [
    {
      key: 'shortText',
      titleFallback: 'Student name',
      descriptionFallback: 'Capture the full legal name.',
    },
    {
      key: 'shortText',
      titleFallback: 'Student ID',
      descriptionFallback: 'Record the public student identifier.',
    },
    {
      key: 'dropdown',
      titleFallback: 'Gender',
      descriptionFallback: 'Select the student gender.',
    },
    {
      key: 'date',
      titleFallback: 'Date of birth',
      descriptionFallback: 'Use the calendar date of birth.',
    },
  ],
  family: [
    {
      key: 'shortText',
      titleFallback: 'Guardian name',
      descriptionFallback: 'Primary guardian or caregiver name.',
    },
    {
      key: 'shortText',
      titleFallback: 'Phone number',
      descriptionFallback: 'Primary contact phone number.',
    },
    {
      key: 'dropdown',
      titleFallback: 'Household status',
      descriptionFallback: 'Choose the household category.',
    },
    {
      key: 'longText',
      titleFallback: 'Home situation',
      descriptionFallback: 'Describe the family living context.',
    },
  ],
  scoring: [
    {
      key: 'rating',
      titleFallback: 'Risk rating',
      descriptionFallback: 'Assign the assessment risk level.',
    },
    {
      key: 'table',
      titleFallback: 'Scoring table',
      descriptionFallback: 'Group scores by category and band.',
    },
    {
      key: 'signature',
      titleFallback: 'Reviewer signature',
      descriptionFallback: 'Capture the final approval signature.',
    },
  ],
}

export const PRESCHOOL_ASSESSMENT_FORM_BUILDER_SETTINGS = [
  {
    key: 'validation',
    titleKey: 'assessmentFormBuilder.settings.validation',
    titleFallback: 'Validation',
    descriptionKey: 'assessmentFormBuilder.settings.validationDescription',
    descriptionFallback: 'Required fields, min/max limits, and answer rules.',
  },
  {
    key: 'scoring',
    titleKey: 'assessmentFormBuilder.settings.scoring',
    titleFallback: 'Scoring',
    descriptionKey: 'assessmentFormBuilder.settings.scoringDescription',
    descriptionFallback: 'Score values, rubrics, and risk bands.',
  },
  {
    key: 'publish',
    titleKey: 'assessmentFormBuilder.settings.publish',
    titleFallback: 'Publish',
    descriptionKey: 'assessmentFormBuilder.settings.publishDescription',
    descriptionFallback: 'Versioning, status, and rollout controls.',
  },
]
