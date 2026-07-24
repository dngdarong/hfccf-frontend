import enPreschool from '@/i18n/en/preschool/analytics.js'

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
  preschoolAnalyticsPage: {
    title: 'ផ្ទាំងវិភាគទិន្នន័យមត្តេយ្យសិក្សា',
    subtitle: 'វិភាគទិន្នន័យប្រតិបត្តិការ ប្រវត្តិសាស្ត្រ និងនិន្នាការ ដោយអាស្រ័យលើទិន្នន័យស្នូលមត្តេយ្យសិក្សា។',
    generatedAt: 'បានបង្កើតនៅ',
    refresh: 'ផ្ទុកឡើងវិញ',
    filters: {
      title: 'តម្រង',
      dateRange: 'ចន្លោះកាលបរិច្ឆេទ',
      academicYear: 'ឆ្នាំសិក្សា',
      class: 'ថ្នាក់',
      teacher: 'គ្រូបង្រៀន',
      status: 'ស្ថានភាព',
      apply: 'អនុវត្តតម្រង',
      reset: 'កំណត់តម្រងឡើងវិញ',
    },
    overview: 'ទិដ្ឋភាពទូទៅ',
    attendanceAnalytics: 'វិភាគវត្តមាន',
    sessionAnalytics: 'វិភាគវគ្គវត្តមាន',
    scheduleAnalytics: 'វិភាគកាលវិភាគ',
    alertAnalytics: 'វិភាគការជូនដំណឹង',
    guardianAnalytics: 'វិភាគការទាក់ទងអាណាព្យាបាល',
    studentAnalytics: 'វិភាគសិស្ស',
    teacherAnalytics: 'វិភាគគ្រូបង្រៀន',
    reportLauncher: 'ចូលទៅរបាយការណ៍',
    viewDetails: 'មើលព័ត៌មានលម្អិត',
    drillDown: 'មើលជ្រៅ',
    backToAnalytics: 'ត្រឡប់ទៅវិភាគទិន្នន័យ',
    filteredBy: 'បានច្រោះតាម',
    appliedFilters: 'តម្រងដែលបានអនុវត្ត',
    clearFilters: 'សម្អាតតម្រង',
    compareMode: 'របៀបប្រៀបធៀប',
    comparisonUnavailable: 'មិនអាចប្រៀបធៀបបាននៅពេលនេះ',
    savedFilters: 'តម្រងដែលបានរក្សាទុក',
    today: 'ថ្ងៃនេះ',
    thisWeek: 'សប្ដាហ៍នេះ',
    thisMonth: 'ខែនេះ',
    currentAcademicYear: 'ឆ្នាំសិក្សាបច្ចុប្បន្ន',
    attendanceDetail: 'ព័ត៌មានលម្អិតវត្តមាន',
    sessionDetail: 'ព័ត៌មានលម្អិតវគ្គវត្តមាន',
    alertDetail: 'ព័ត៌មានលម្អិតការជូនដំណឹង',
    studentDetail: 'ព័ត៌មានលម្អិតសិស្ស',
    teacherDetail: 'ព័ត៌មានលម្អិតគ្រូបង្រៀន',
    guardianContactDetail: 'ព័ត៌មានលម្អិតការទាក់ទងអាណាព្យាបាល',
    openDetail: 'បើកព័ត៌មានលម្អិត',
    noDrillDownAvailable: 'មិនមានការមើលលម្អិត។',
    attendanceRate: 'អត្រាវត្តមាន',
    completionRate: 'អត្រាបញ្ចប់',
    attendanceTrend: 'និន្នាការវត្តមាន',
    trend: 'និន្នាការ',
    breakdown: 'ការបែងចែក',
    dataset: 'សំណុំទិន្នន័យ',
    sessionsGenerated: 'វគ្គដែលបានបង្កើត',
    sessionsCompleted: 'វគ្គដែលបានបញ្ចប់',
    missingSessions: 'វគ្គដែលខ្វះការកត់ត្រា',
    openAlerts: 'ការជូនដំណឹងកំពុងបើក',
    overdueAlerts: 'ការជូនដំណឹងហួសកំណត់',
    guardianContacts: 'ការទាក់ទងអាណាព្យាបាល',
    outstandingFollowUps: 'ការតាមដាននៅសល់',
    noAnalyticsData: 'មិនមានទិន្នន័យវិភាគទេ។',
    reportDataset: 'សំណុំទិន្នន័យរបាយការណ៍',
    attendanceReport: 'របាយការណ៍វត្តមាន',
    sessionReport: 'របាយការណ៍វគ្គវត្តមាន',
    scheduleReport: 'របាយការណ៍កាលវិភាគ',
    noDetailData: 'មិនមានទិន្នន័យលម្អិតទេ។',
    noTrendData: 'មិនមានទិន្នន័យនិន្នាការទេ។',
    noBreakdownData: 'មិនមានទិន្នន័យបែងចែកទេ។',
    noDatasetRows: 'មិនមានជួរទិន្នន័យទេ។',
    byClass: 'តាមថ្នាក់',
    byTeacher: 'តាមគ្រូបង្រៀន',
    byStudent: 'តាមសិស្ស',
    byWeek: 'តាមសប្ដាហ៍',
    byMonth: 'តាមខែ',
    byStatus: 'តាមស្ថានភាព',
    bySeverity: 'តាមកម្រិតធ្ងន់ធ្ងរ',
    byMethod: 'តាមវិធីសាស្ត្រ',
    byReason: 'តាមមូលហេតុ',
    activeStudents: 'សិស្សសកម្ម',
    present: 'មានវត្តមាន',
    absent: 'អវត្តមាន',
    late: 'មកយឺត',
    excused: 'បានអនុញ្ញាត',
    unexcused: 'មិនបានអនុញ្ញាត',
    activeSchedules: 'កាលវិភាគសកម្ម',
    inactiveSchedules: 'កាលវិភាគមិនសកម្ម',
    weeklySessions: 'វគ្គប្រចាំសប្ដាហ៍',
    generatedSessions: 'វគ្គដែលបានបង្កើត',
    totalAlerts: 'ការជូនដំណឹងសរុប',
    open: 'កំពុងបើក',
    acknowledged: 'បានទទួលស្គាល់',
    completed: 'បានបញ្ចប់',
    overdue: 'ហួសកំណត់',
    contactLogs: 'កំណត់ហេតុទំនាក់ទំនង',
    followUps: 'ការតាមដាន',
    outstanding: 'នៅសល់',
    assignedClasses: 'ថ្នាក់ដែលបានចាត់តាំង',
    students: 'សិស្ស',
    attendanceSessions: 'វគ្គវត្តមាន',
    alertCount: 'ចំនួនការជូនដំណឹង',
    guardianContactsCount: 'ការទាក់ទងអាណាព្យាបាល',
    healthAlerts: 'ការជូនដំណឹងសុខភាព',
    assessmentParticipation: 'ការចូលរួមវាយតម្លៃ',
    completion: 'ការបញ្ចប់',
    sections: {
      attendance: {
        title: 'វិភាគវត្តមាន',
        subtitle: 'អត្រាវត្តមាន សមាសភាពស្ថានភាព និងទិន្នន័យនិន្នាការ។',
        details: 'មើលព័ត៌មានលម្អិត',
      },
      sessions: {
        title: 'វិភាគវគ្គវត្តមាន',
        subtitle: 'វគ្គដែលបានបង្កើត បញ្ចប់ ចាក់សោ បោះបង់ និងខ្វះការកត់ត្រា។',
        details: 'មើលព័ត៌មានលម្អិត',
      },
      schedules: {
        title: 'វិភាគកាលវិភាគ',
        subtitle: 'បរិមាណកាលវិភាគ និងទិដ្ឋភាពប្រើប្រាស់។',
        details: 'មើលព័ត៌មានលម្អិត',
      },
      alerts: {
        title: 'វិភាគការជូនដំណឹង',
        subtitle: 'ស្ថានភាពការជូនដំណឹង និងការបែងចែកតាមកម្រិតធ្ងន់ធ្ងរ។',
        details: 'មើលព័ត៌មានលម្អិត',
      },
      guardians: {
        title: 'វិភាគការទាក់ទងអាណាព្យាបាល',
        subtitle: 'និន្នាការកំណត់ហេតុទំនាក់ទំនង និងស្ថានភាពតាមដាន។',
        details: 'មើលព័ត៌មានលម្អិត',
      },
      students: {
        title: 'វិភាគសិស្ស',
        subtitle: 'វិភាគប្រតិបត្តិការក្នុងកម្រិតសិស្ស។',
        details: 'មើលព័ត៌មានលម្អិត',
      },
      teachers: {
        title: 'វិភាគគ្រូបង្រៀន',
        subtitle: 'បន្ទុកការងារ និងដំណើរការវគ្គវត្តមានរបស់គ្រូបង្រៀន។',
        details: 'មើលព័ត៌មានលម្អិត',
      },
    },
  },
}

export default mergeDeep(enPreschool, overrides)
