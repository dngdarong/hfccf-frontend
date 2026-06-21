export default {
  sportAttendanceStatus: {
    present: 'មានវត្តមាន',
    presentShort: 'ម',
    absent: 'អវត្តមាន',
    absentShort: 'អ',
    late: 'មកយឺត',
    lateShort: 'យ',
    excused: 'លើកលែង',
    excusedShort: 'ល',
  },
  sportAttendanceType: {
    player: 'កីឡាករ',
    coach: 'គ្រូបង្វឹក',
  },
  sportAttendanceShared: {
    playersEyebrow: '??????',
    coachesEyebrow: '??????????',
    historyEyebrow: '???????????????',
    progress: '????????',
    activeFilters: '??????????',
    results: '??????',
  },
  sportAttendanceHubPage: {
    title: 'ការគ្រប់គ្រងវត្តមានកីឡា',
    subtitle: 'កត់ត្រាវត្តមានកីឡាករ និងគ្រូបង្វឹក ហើយមើលប្រវត្តិបានពីកន្លែងតែមួយ។',
    cards: {
      players: {
        title: 'វត្តមានកីឡាករ',
        description: 'កត់ត្រាវត្តមានប្រចាំថ្ងៃតាមក្រុម។',
      },
      coaches: {
        title: 'វត្តមានគ្រូបង្វឹក',
        description: 'កត់ត្រាវត្តមានគ្រូបង្វឹកប្រចាំថ្ងៃ។',
      },
      history: {
        title: 'ប្រវត្តិវត្តមាន',
        description: 'ពិនិត្យវត្តមានតាមប្រភេទ ក្រុម និងកាលបរិច្ឆេទ។',
      },
    },
  },
  sportAdminPlayerAttendancePage: {
    title: 'វត្តមានកីឡាករ',
    subtitle: 'ជ្រើសរើសក្រុម ហើយកត់ត្រាវត្តមានកីឡាករតាមថ្ងៃដែលបានជ្រើស។',
    filters: {
      team: 'ក្រុម',
      date: 'កាលបរិច្ឆេទ',
    },
    placeholders: {
      team: 'ជ្រើសរើសក្រុម',
      note: 'បន្ថែមកំណត់សម្គាល់',
    },
    columns: {
      player: 'កីឡាករ',
      status: 'ស្ថានភាព',
      note: 'កំណត់សម្គាល់',
    },
    summary: 'បានកត់ត្រា {marked} ក្នុងចំណោម {total} កីឡាករ',
    actions: {
      back: 'ត្រឡប់',
      markAllPresent: 'កំណត់ទាំងអស់ថាមានវត្តមាន',
      markAllAbsent: 'កំណត់ទាំងអស់ថាអវត្តមាន',
      clearAll: 'លុបទាំងអស់',
      saving: 'កំពុងរក្សាទុក...',
      save: 'រក្សាទុកវត្តមាន',
    },
    messages: {
      selectTeam: 'សូមជ្រើសរើសក្រុមមួយដើម្បីបង្ហាញបញ្ជីកីឡាករ។',
      noPlayers: 'រកមិនឃើញកីឡាករសម្រាប់ក្រុមដែលបានជ្រើសទេ។',
      loadFailed: 'មិនអាចផ្ទុកវត្តមានកីឡាករបានទេ។',
      saveFailed: 'មិនអាចរក្សាទុកវត្តមានកីឡាករបានទេ។',
      saved: 'បានរក្សាទុកវត្តមានកីឡាកររួចរាល់។',
      skippedNote: 'តែជួរដែលបានកំណត់ស្ថានភាពប៉ុណ្ណោះដែលនឹងត្រូវរក្សាទុក។',
    },
  },
  sportAdminCoachAttendancePage: {
    title: 'វត្តមានគ្រូបង្វឹក',
    subtitle: 'កត់ត្រាវត្តមានគ្រូបង្វឹកតាមថ្ងៃដែលបានជ្រើស។',
    filters: {
      date: 'កាលបរិច្ឆេទ',
    },
    placeholders: {
      note: 'បន្ថែមកំណត់សម្គាល់',
    },
    columns: {
      coach: 'គ្រូបង្វឹក',
      status: 'ស្ថានភាព',
      note: 'កំណត់សម្គាល់',
    },
    summary: 'បានកត់ត្រា {marked} ក្នុងចំណោម {total} គ្រូបង្វឹក',
    actions: {
      back: 'ត្រឡប់',
      markAllPresent: 'កំណត់ទាំងអស់ថាមានវត្តមាន',
      markAllAbsent: 'កំណត់ទាំងអស់ថាអវត្តមាន',
      clearAll: 'លុបទាំងអស់',
      saving: 'កំពុងរក្សាទុក...',
      save: 'រក្សាទុកវត្តមាន',
    },
    messages: {
      noCoaches: 'រកមិនឃើញគ្រូបង្វឹកទេ។',
      loadFailed: 'មិនអាចផ្ទុកវត្តមានគ្រូបង្វឹកបានទេ។',
      saveFailed: 'មិនអាចរក្សាទុកវត្តមានគ្រូបង្វឹកបានទេ។',
      saved: 'បានរក្សាទុកវត្តមានគ្រូបង្វឹករួចរាល់។',
      skippedNote: 'តែជួរដែលបានកំណត់ស្ថានភាពប៉ុណ្ណោះដែលនឹងត្រូវរក្សាទុក។',
    },
  },
  sportAdminAttendanceHistoryPage: {
    title: 'ប្រវត្តិវត្តមាន',
    subtitle: 'ស្វែងរកវត្តមានតាមប្រភេទ បន្ថែមក្រុម និងចន្លោះកាលបរិច្ឆេទ។',
    filters: {
      type: 'ប្រភេទ',
      team: 'ក្រុម',
      from: 'ចាប់ពី',
      to: 'ដល់',
      search: 'ស្វែងរក',
    },
    placeholders: {
      type: 'ជ្រើសរើសប្រភេទ',
      team: 'ក្រុមទាំងអស់',
      search: 'ស្វែងរកតាមឈ្មោះ ឬកំណត់សម្គាល់',
    },
    columns: {
      date: 'កាលបរិច្ឆេទ',
      type: 'ប្រភេទ',
      team: 'ក្រុម',
      person: 'បុគ្គល',
      status: 'ស្ថានភាព',
      note: 'កំណត់សម្គាល់',
      recordedBy: 'កត់ត្រាដោយ',
    },
    actions: {
      apply: 'អនុវត្តតម្រង',
      reset: 'កំណត់ឡើងវិញ',
      back: 'ត្រឡប់',
    },
    messages: {
      noRecords: 'មិនមានវត្តមានណាដែលត្រូវនឹងតម្រងបច្ចុប្បន្នទេ។',
      loadFailed: 'មិនអាចផ្ទុកប្រវត្តិវត្តមានបានទេ។',
    },
  },
}
