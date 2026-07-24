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
  sportAttendanceShared: {
    playersEyebrow: 'កីឡាករ',
    historyEyebrow: 'ប្រវត្តិវត្តមាន',
    progress: 'វឌ្ឍនភាព',
    activeFilters: 'តម្រងសកម្ម',
    results: 'លទ្ធផល',
  },
  sportAttendanceHubPage: {
    title: 'ការគ្រប់គ្រងវត្តមានកីឡា',
    subtitle: 'កត់ត្រាវត្តមានកីឡាករ ហើយមើលប្រវត្តិបានពីកន្លែងតែមួយ។',
    cards: {
      players: {
        title: 'វត្តមានកីឡាករ',
        description: 'កត់ត្រាវត្តមានប្រចាំថ្ងៃតាមក្រុម។',
      },
      history: {
        title: 'ប្រវត្តិវត្តមាន',
        description: 'ពិនិត្យវត្តមានតាមក្រុម និងកាលបរិច្ឆេទ។',
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
      reason: 'មូលហេតុ (ឯកស្ថម)',
    },
    columns: {
      player: 'កីឡាករ',
      dateOfBirth: 'ថ្ងៃកំណើត',
      gender: 'ភេទ',
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
  sportCoachPlayerAttendancePage: {
    title: 'វត្តមានកីឡាករ',
    subtitle: 'ជ្រើសរើសក្រុមដែលបានចាត់តាំងឲ្យអ្នក ហើយកត់ត្រាវត្តមានកីឡាករនីមួយៗសម្រាប់កាលបរិច្ឆេទដែលបានជ្រើសរើស។',
    messages: {
      noTeams: 'មិនមានការចាត់តាំងក្រុមសកម្មសម្រាប់គណនីរបស់អ្នកទេ។',
    },
  },
  sportAdminAttendanceHistoryPage: {
    title: 'ប្រវត្តិវត្តមាន',
    subtitle: 'ស្វែងរកវត្តមានកីឡាករតាមក្រុម និងចន្លោះកាលបរិច្ឆេទ។',
    filters: {
      team: 'ក្រុម',
      from: 'ចាប់ពី',
      to: 'ដល់',
      search: 'ស្វែងរក',
    },
    placeholders: {
      team: 'ក្រុមទាំងអស់',
      search: 'ស្វែងរកតាមឈ្មោះ ឬកំណត់សម្គាល់',
    },
    columns: {
      date: 'កាលបរិច្ឆេទ',
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
