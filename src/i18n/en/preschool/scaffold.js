export default {
  preschoolScaffold: {
    formManagement: {
      loading: 'Loading form data...',
      title: 'Forms Overview',
      subtitle: 'Open the overview, manage templates, build forms, and review submissions.',
      eyebrow: 'Forms overview',
      description:
        'Manage the launch points for the forms overview, template library, builder, submissions, and review tools.',
      hero: {
        summaryWithForms: '{count} forms are currently active.',
        summaryNoForms: 'No forms have been created yet.',
        metricForms: 'Total Forms',
        formRequired: 'Form required',
        openLabel: 'Open',
      },
      pages: {
        overview: {
          eyebrow: 'Overview metrics',
          title: 'Overview metrics',
          description: 'A static snapshot of the template lifecycle for quick orientation.',
          summary: 'Choose a section below to open the overview, template library, builder, or review workspace.',
          metrics: {
            totalTemplates: {
              title: 'Total templates',
              description: 'Overview of the current template library.',
            },
            drafts: {
              title: 'Drafts',
              description: 'Templates that are still being prepared.',
            },
            published: {
              title: 'Published',
              description: 'Templates available for active use.',
            },
            pendingReview: {
              title: 'Pending review',
              description: 'Templates waiting for approval.',
            },
            archived: {
              title: 'Archived',
              description: 'Inactive templates kept for reference.',
            },
          },
          steps: {
            overview: {
              title: 'Forms Overview',
              description: 'Start here to see the main entry points for Preschool forms.',
            },
            createTemplate: {
              title: 'Create template',
              description: 'Start a new preschool form template in the builder.',
            },
            buildQuestions: {
              title: 'Build questions',
              description: 'Add sections, fields, and validation rules.',
            },
            publish: {
              title: 'Publish',
              description: 'Make the template available to teachers and staff.',
            },
            reviewSubmissions: {
              title: 'Review submissions',
              description: 'Track responses and review outcomes.',
            },
            build: {
              title: 'Build Form',
              description: 'Create and refine forms with the guided tools.',
            },
            manage: {
              title: 'Manage Templates',
              description: 'Organize the template library and related records.',
            },
            review: {
              title: 'Review Forms',
              description: 'Inspect submissions and reporting outputs.',
            },
          },
        },
        quickActions: {
          eyebrow: 'Quick actions',
          title: 'Quick actions',
          description: 'Jump into the core Preschool forms tasks without extra navigation.',
        },
        workflow: {
          eyebrow: 'Workflow',
          title: 'Workflow',
          description: 'Follow the current form lifecycle from creation through review.',
        },
        resources: {
          eyebrow: 'Resources',
          title: 'Resources',
          description: 'Open related reporting and audit destinations.',
        },
        sections: {
          title: 'Sections',
        },
        manage: {
          title: 'Manage Templates',
          subtitle: 'Open the template catalog and related records.',
          eyebrow: 'Form management',
          description: 'Open the template catalog and related records.',
          guidance: {
            browse: {
              title: 'Browse catalog',
              description: 'View active and archived templates.',
            },
            review: {
              title: 'Review details',
              description: 'Check template properties and audit history.',
            },
            organize: {
              title: 'Organize',
              description: 'Archive, duplicate, or reorganize templates.',
            },
          },
        },
        build: {
          title: 'Build Form',
          subtitle: 'Create and refine forms with the guided tools.',
          eyebrow: 'Form builder',
          description: 'Create and refine forms with the guided tools.',
        },
        review: {
          title: 'Review Forms',
          subtitle: 'Review submission and reporting outputs.',
          eyebrow: 'Form review',
          description: 'Review submission and reporting outputs.',
        },
      },
      cards: {
        dashboard: {
          title: 'Forms Overview',
          description: 'View the overview and quickly jump into key areas.',
        },
        forms: {
          title: 'Manage Templates',
          description: 'Review and organize the current template catalog.',
        },
        newForm: {
          title: 'Build Form',
          description: 'Create a new form for a workflow or data collection flow.',
        },
        submissions: {
          title: 'Submissions',
          description: 'Track submissions and monitor their processing status.',
        },
        wizard: {
          title: 'Wizard',
          description: 'Build forms step by step with guided assistance.',
        },
        scoring: {
          title: 'Scoring',
          description: 'Define and manage form scoring rules.',
        },
        printDesigner: {
          title: 'Print Designer',
          description: 'Arrange print layouts and present forms cleanly.',
        },
        reports: {
          title: 'Reports',
          description: 'View summary data and reports for forms.',
        },
        auditLogs: {
          title: 'Audit Log',
          description: 'Review activity and the history of changes.',
        },
      },
    },
    reportManagement: {
      loading: 'Loading report management...',
      title: 'Report Management',
      subtitle: 'Create, organize, review, and manage Preschool reports.',
      eyebrow: 'Report overview',
      description:
        'Manage the launch points for report builders, recent reports, summaries, and review tools.',
    },
  },
  preschoolAdminAttendancePage: {
    status: {
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      excused: 'Excused',
    },
  },
}
