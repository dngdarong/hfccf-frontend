import enPreschool from '@/i18n/en/preschool/operations.js'

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function mergeDeep(base, overrides) {
  if (Array.isArray(base) && Array.isArray(overrides)) {
    return overrides.map((item) => (isPlainObject(item) ? mergeDeep({}, item) : item))
  }

  if (!isPlainObject(base) || !isPlainObject(overrides)) {
    return overrides === undefined ? base : overrides
  }

  const output = { ...base }

  for (const [key, value] of Object.entries(overrides)) {
    output[key] = mergeDeep(base[key], value)
  }

  return output
}

const overrides = {
  preschoolOperationsPage: {
    title: 'មជ្ឈមណ្ឌលប្រតិបត្តិការ',
    subtitle: 'ផ្ទាំងបញ្ជាប្រតិបត្តិការប្រចាំថ្ងៃសម្រាប់អ្នកគ្រប់គ្រងមត្តេយ្យ ដើម្បីតាមដានវគ្គ ការជូនដំណឹង ការតាមដាន និងហានិភ័យ។',
    generatedAt: 'បានបង្កើតនៅ',
    refresh: 'ផ្ទុកឡើងវិញ',
    loading: 'កំពុងផ្ទុក…',
    filters: {
      title: 'តម្រង',
      subtitle: 'ប្រើតម្រងប្រតិបត្តិការស្រាលៗ ដើម្បីបង្រួមទិដ្ឋភាពថ្ងៃនេះ។',
      dateFrom: 'ចាប់ពីកាលបរិច្ឆេទ',
      dateTo: 'ដល់កាលបរិច្ឆេទ',
      class: 'ថ្នាក់',
      teacher: 'គ្រូបង្រៀន',
      status: 'ស្ថានភាព',
      apply: 'អនុវត្តតម្រង',
      reset: 'កំណត់តម្រងឡើងវិញ',
    },
    todayOverview: 'សង្ខេបថ្ងៃនេះ',
    operationalSummary: 'សង្ខេបប្រតិបត្តិការ',
    workflowVisibility: 'ភាពមើលឃើញលំហូរការងារ',
    workflowActivity: 'សកម្មភាពលំហូរការងារ',
    noWorkflowActivity: 'មិនមានសកម្មភាពលំហូរការងារ',
    openWorkflow: 'បើកលំហូរការងារ',
    openWorkflowCenter: 'បើកមជ្ឈមណ្ឌលលំហូរការងារ',
    pendingWorkflows: 'លំហូរការងារកំពុងរង់ចាំ',
    pendingApprovals: 'ការអនុម័តកំពុងរង់ចាំ',
    overdueWorkflows: 'លំហូរការងារហួសកំណត់',
    escalatedWorkflows: 'លំហូរការងារបានបង្កើនកម្រិត',
    recentlyUpdatedWorkflows: 'លំហូរការងារធ្វើបច្ចុប្បន្នភាពថ្មីៗ',
    todaySessions: 'វគ្គថ្ងៃនេះ',
    attendanceMonitoring: 'តាមដានវត្តមាន',
    guardianFollowUp: 'ការតាមដានអាណាព្យាបាល',
    notificationsCenter: 'មជ្ឈមណ្ឌលជូនដំណឹង',
    healthMonitoring: 'តាមដានសុខភាព',
    paymentOperations: 'ប្រតិបត្តិការបង់ប្រាក់',
    assessmentOperations: 'ប្រតិបត្តិការវាយតម្លៃ',
    teacherOperations: 'ប្រតិបត្តិការគ្រូ',
    operationalRisks: 'ហានិភ័យប្រតិបត្តិការ',
    timeline: 'បន្ទាត់ពេលវេលា',
    quickActions: 'សកម្មភាពរហ័ស',
    openDetail: 'បើកព័ត៌មានលម្អិត',
    noData: 'មិនមានទិន្នន័យប្រតិបត្តិការទេ។',
    noSessions: 'មិនមានវគ្គទេ។',
    noRisks: 'មិនមានហានិភ័យប្រតិបត្តិការទេ។',
    noTimeline: 'មិនមានព្រឹត្តិការណ៍ក្នុងបន្ទាត់ពេលវេលាទេ។',
    takeAttendance: 'កត់ត្រាវត្តមាន',
    continueAttendance: 'បន្តកត់ត្រាវត្តមាន',
    viewSession: 'មើលវគ្គ',
    viewDetails: 'មើលលម្អិត',
    openAlerts: 'បើកការជូនដំណឹង',
    reviewAssessment: 'ពិនិត្យការវាយតម្លៃ',
    viewInvoice: 'មើលវិក្កយបត្រ',
    viewReports: 'មើលរបាយការណ៍',
    viewHealthRecord: 'មើលកំណត់ត្រាសុខភាព',
    viewGuardianContact: 'មើលទំនាក់ទំនងអាណាព្យាបាល',
    missingSessions: 'វគ្គខ្វះការកត់ត្រា',
    healthAlerts: 'ការជូនដំណឹងសុខភាព',
    openHealthAlerts: 'ការជូនដំណឹងសុខភាពកំពុងបើក',
    criticalIncidents: 'ឧប្បត្តិហេតុធ្ងន់ធ្ងរ',
    medicationReminders: 'ការរំលឹកថ្នាំព្យាបាល',
    studentsRequiringAttention: 'សិស្សដែលត្រូវការយកចិត្តទុកដាក់',
    overduePayments: 'ការទូទាត់ហួសកំណត់',
    pendingAssessments: 'ការវាយតម្លៃរង់ចាំ',
    upcomingAssessments: 'ការវាយតម្លៃជិតមកដល់',
    overdueGrading: 'ការដាក់ពិន្ទុហួសកំណត់',
    guardianFollowUps: 'ការតាមដានអាណាព្យាបាល',
    unreadNotifications: 'ការជូនដំណឹងមិនទាន់អាន',
    openAutomationTasks: 'ភារកិច្ចស្វ័យប្រវត្តិកំពុងបើក',
    overdueAutomationTasks: 'ភារកិច្ចស្វ័យប្រវត្តិហួសកំណត់',
    criticalNotifications: 'ការជូនដំណឹងសំខាន់បំផុត',
    criticalRisks: 'ហានិភ័យធ្ងន់ធ្ងរ',
    blockedWorkflows: 'លំហូរការងារត្រូវបានបិទ',
    todayWorkload: 'បន្ទុកការងារថ្ងៃនេះ',
    pendingAttendance: 'វត្តមានរង់ចាំ',
    assignedSessions: 'វគ្គដែលបានចាត់តាំង',
    attendanceRate: 'អត្រាវត្តមាន',
    present: 'មានវត្តមាន',
    absent: 'អវត្តមាន',
    late: 'មកយឺត',
    excused: 'បានអនុញ្ញាត',
    unexcused: 'មិនបានអនុញ្ញាត',
    contactLogs: 'កំណត់ហេតុទំនាក់ទំនង',
    followUps: 'ការតាមដាន',
    completed: 'បានបញ្ចប់',
    outstandingFollowUps: 'ការតាមដាននៅសល់',
    outstandingBalance: 'សមតុល្យនៅសល់',
    pendingReceipts: 'បង្កាន់ដៃរង់ចាំ',
    assignedClasses: 'ថ្នាក់ដែលបានចាត់តាំង',
    students: 'សិស្ស',
    attendanceSessions: 'វគ្គវត្តមាន',
    completedSessions: 'វគ្គបានបញ្ចប់',
    alertCount: 'ចំនួនការជូនដំណឹង',
    noDetailData: 'មិនមានទិន្នន័យលម្អិតទេ។',
  },
}

export default mergeDeep(enPreschool, overrides)
