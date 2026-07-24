import enPreschool from '@/i18n/en/preschool/dashboard.js'

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
  preschoolDashboardPage: {
    title: 'ផ្ទាំងគ្រប់គ្រងប្រតិបត្តិការរបស់ Preschool',
    subtitle: 'ទិដ្ឋភាពប្រតិបត្តិការបន្តផ្ទាល់សម្រាប់ការចុះឈ្មោះ វត្តមាន និងការគាំទ្រថ្នាក់រៀន។',
    operationalSummary: {
      title: 'សង្ខេបប្រតិបត្តិការ',
      subtitle: 'កាលវិភាគថ្ងៃនេះ វគ្គដែលបានបង្កើត និងការគ្របដណ្តប់ដែលខ្វះនៅទីនេះ។',
      todaySchedule: {
        title: 'កាលវិភាគថ្ងៃនេះ',
        subtitle: 'ធាតុកាលវិភាគដែលមានរចនាសម្ព័ន្ធសម្រាប់ថ្ងៃនេះ។',
        label: 'ថ្នាក់ដែលបានរៀបចំ',
      },
      todaySessions: {
        title: 'វគ្គថ្ងៃនេះ',
        subtitle: 'វគ្គវត្តមានដែលបានបង្កើតពីកាលវិភាគថ្ងៃនេះ។',
        label: 'វគ្គដែលបានបង្កើត',
      },
      scheduled: {
        title: 'បានរៀបចំ',
        label: 'វគ្គបានកំណត់',
      },
      open: {
        title: 'កំពុងបើក',
        label: 'វគ្គសកម្ម',
      },
      completed: {
        title: 'បានបញ្ចប់',
        label: 'វគ្គបានបញ្ចប់',
      },
      locked: {
        title: 'បានចាក់សោ',
        label: 'វគ្គបានចាក់សោ',
      },
      cancelled: {
        title: 'បានបោះបង់',
        label: 'វគ្គបានបោះបង់',
      },
      missing: {
        title: 'វគ្គខ្វះ',
        label: 'មិនទាន់បានបង្កើតវគ្គ',
      },
      noSessionsToday: 'មិនមានវគ្គសម្រាប់ថ្ងៃនេះ',
      noSessionGenerated: 'មិនមានវគ្គដែលបានបង្កើត',
    },
    cards: {
      reports: {
        title: 'របាយការណ៍',
        subtitle: 'ទិដ្ឋភាពរួមចម្រុះរវាងគ្រប់ផ្នែក',
        action: 'បើកមជ្ឈមណ្ឌលរបាយការណ៍',
        label: 'អត្រាវត្តមាន',
        revenue: 'ប្រាក់ចំណូល',
        revenueLabel: 'ប្រសិទ្ធភាពទូទាត់',
        health: 'ការជូនដំណឹងសុខភាពបើក',
        healthLabel: 'ហានិភ័យសុខភាព',
        assessments: 'ការបញ្ចប់វាយតម្លៃ',
        assessmentsLabel: 'វឌ្ឍនភាពសិក្សា',
      },
    },
  },
  preschoolTeacherDashboardPage: {
    title: 'កន្លែងបង្រៀនមត្តេយ្យសិក្សា',
    subtitle: 'ជំនួយថ្នាក់ប្រចាំថ្ងៃ ការថែទាំសិស្ស និងការរៀបចំសកម្មភាព។',
    loading: 'កំពុងផ្ទុកផ្ទាំងគ្រូ...',
    quickStats: 'ស្ថិតិរហ័ស',
    cards: {
      students: {
        title: 'សិស្ស',
        label: 'សិស្សក្នុងថ្នាក់របស់អ្នក',
      },
      classes: {
        title: 'ថ្នាក់',
        label: 'ថ្នាក់ដែលបានចាត់តាំង',
      },
      attendance: {
        title: 'វត្តមានថ្ងៃនេះ',
        label: 'កំណត់ត្រាសម្រាប់ថ្ងៃនេះ',
        actions: {
          recordAttendance: 'កត់ត្រាវត្តមាន',
          viewToday: 'មើលវត្តមានថ្ងៃនេះ',
        },
      },
      payments: {
        title: 'ការទូទាត់នៅខ្វះ',
        label: 'ការតាមដានថ្លៃសិក្សា',
      },
    },
    actions: {
      upcomingClasses: 'ថ្នាក់បន្ទាប់៖ {count}',
      overduePayments: 'ការទូទាត់ហួសកំណត់៖ {count}',
      paidPayments: 'ការទូទាត់បានបង់៖ {count}',
      mySchedule: 'កាលវិភាគរបស់ខ្ញុំ',
    },
    attendanceSessions: {
      title: 'វគ្គវត្តមាន',
      subtitle: 'ការងារវត្តមានថ្ងៃនេះសម្រាប់ថ្នាក់ដែលបានចាត់តាំងរបស់អ្នក។',
      todayCount: 'វគ្គថ្ងៃនេះ',
      loading: 'កំពុងផ្ទុកវគ្គវត្តមានថ្ងៃនេះ...',
      warning: 'វត្តមានត្រូវការការយកចិត្តទុកដាក់',
      noRoster: 'មិនមានចំនួនសិស្សទេ',
      progressLabel: 'បានកត់ {completed} ក្នុង {total}',
      completedSummary: 'បានកត់សិស្ស {completed} ក្នុង {total}',
      pendingSummary: 'បានកត់ {completed} ក្នុង {total} · ខ្វះ {pending}',
      empty: {
        title: 'មិនមានវគ្គវត្តមានកំណត់សម្រាប់ថ្ងៃនេះទេ។',
        subtitle: 'បើក Attendance ដើម្បីចាប់ផ្តើម ឬបន្តវគ្គថ្នាក់នៅពេលចាំបាច់។',
      },
      labels: {
        students: 'សិស្ស',
        completed: 'បានកត់',
        progress: 'វឌ្ឍនភាព',
      },
      actions: {
        openAttendance: 'បើក Attendance',
        recordAttendance: 'កត់ត្រាវត្តមាន',
        continueAttendance: 'បន្តកត់ត្រាវត្តមាន',
        recordNow: 'កត់ត្រាឥឡូវនេះ',
        viewDetails: 'មើលព័ត៌មានលម្អិត',
      },
      errors: {
        loadFailed: 'មិនអាចផ្ទុកវគ្គវត្តមានថ្ងៃនេះបានទេ។',
      },
    },
    spotlight: {
      nextSuffix: 'ជាថ្នាក់បន្ទាប់',
      noUpcomingClasses: 'មិនមានថ្នាក់បន្ទាប់',
      assignedTeacher: 'គ្រូដែលបានចាត់តាំង',
      fallback: 'ថ្នាក់ដែលបានចាត់តាំងរបស់អ្នកនឹងបង្ហាញនៅទីនេះនៅពេលវាត្រូវបានបង្កើត។',
    },
    activity: {
      title: 'សកម្មភាពថ្មីៗ',
      fallback: 'កំណត់ត្រាវត្តមាននឹងបង្ហាញនៅទីនេះនៅពេលមានការកត់ត្រា។',
    },
    errors: {
      loadFailed: 'មិនអាចផ្ទុកផ្ទាំងគ្រូបានទេ។',
    },
  },
}

export default mergeDeep(enPreschool, overrides)
