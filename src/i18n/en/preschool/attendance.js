// Keep attendance copy separate so teacher attendance can be tested without
// relying on placeholders or hardcoded strings in the page template.
export default {
  // ── Shared status labels ───────────────────────────────────────────────────
  preschoolAttendanceStatus: {
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    excused: 'Excused',
    presentShort: 'P',
    absentShort: 'A',
    lateShort: 'L',
    excusedShort: 'E',
  },

  // ── Admin hub ──────────────────────────────────────────────────────────────
  preschoolAttendanceHubPage: {
    title: 'Attendance Management',
    subtitle: 'Record, review, and analyse attendance for students and teachers.',
    cards: {
      students: {
        title: 'Daily Student Attendance',
        description: 'Mark attendance for students in a class on a selected date.',
      },
      teachers: {
        title: 'Daily Teacher Attendance',
        description: 'Record attendance for teaching staff on a selected date.',
      },
      history: {
        title: 'Attendance History',
        description: 'Browse all past attendance records with date and status filters.',
      },
      dashboard: {
        title: 'Attendance Dashboard',
        description: 'Overview of attendance rates, class breakdowns, and monthly trends.',
      },
      alerts: {
        title: 'Absence Alerts',
        description: 'View students with repeated absences or a low attendance rate.',
      },
      calendar: {
        title: 'Calendar View',
        description: 'Month-by-month attendance overview for a class.',
      },
      profile: {
        title: 'Student Profile',
        description: 'Full attendance history and rate breakdown for a single student.',
      },
      idCard: {
        title: 'Generate ID Card',
        description: 'Generate and download student ID cards as a PDF file.',
      },
    },
  },

  // ── Daily student attendance ───────────────────────────────────────────────
  preschoolAdminAttendancePage: {
    title: 'Daily Student Attendance',
    subtitle: 'Mark and review daily attendance for a class.',
    filters: {
      class: 'Class',
      date: 'Date',
    },
    placeholders: {
      class: 'Select a class',
      note: 'Note (optional)',
    },
    columns: {
      student: 'Student',
      status: 'Status',
      note: 'Note',
    },
    actions: {
      markAllPresent: 'Mark All Present',
      markAllAbsent: 'Mark All Absent',
      clearAll: 'Clear All',
      save: 'Save Attendance',
      saving: 'Saving…',
      prevDay: 'Previous Day',
      nextDay: 'Next Day',
      back: 'Back',
    },
    summary: '{marked} of {total} students marked',
    messages: {
      selectClass: 'Select a class and date to begin marking attendance.',
      noStudents: 'No students are enrolled in this class.',
      loadFailed: 'Failed to load attendance data.',
      saved: 'Attendance saved.',
      saveFailed: 'Some records could not be saved. Please try again.',
      skippedNote: 'Students with no status selected will be skipped.',
    },
  },

  // ── Attendance history ─────────────────────────────────────────────────────
  preschoolAdminAttendanceHistoryPage: {
    title: 'Attendance History',
    subtitle: 'Browse and filter all past attendance records.',
    filters: {
      search: 'Search',
      class: 'Class',
      status: 'Status',
      date: 'Date',
      student: 'Student',
      allStatuses: 'All Statuses',
      allClasses: 'All Classes',
    },
    placeholders: {
      search: 'Search records…',
      searchStudent: 'Search by student name…',
    },
    columns: {
      no: 'No.',
      student: 'Student',
      class: 'Class',
      date: 'Date',
      status: 'Status',
      note: 'Note',
      recordedBy: 'Recorded By',
    },
    actions: {
      apply: 'Apply Filters',
      back: 'Back',
    },
    messages: {
      empty: 'No attendance records found.',
      loadFailed: 'Failed to load attendance records.',
    },
    pagination: {
      previous: 'Previous',
      next: 'Next',
      summary: 'Page {page} of {lastPage} · {total} records',
    },
  },

  // ── Attendance dashboard ───────────────────────────────────────────────────
  preschoolAttendanceDashboardPage: {
    title: 'Attendance Dashboard',
    subtitle: 'Attendance rate overview, class breakdown, and monthly summary.',
    filters: {
      class: 'Class',
      dateFrom: 'From',
      dateTo: 'To',
      allClasses: 'All Classes',
    },
    actions: {
      apply: 'Apply',
      back: 'Back',
    },
    cards: {
      rate: 'Attendance Rate',
      rateCaption: 'Present records ÷ total records',
      total: 'Total Records',
      totalCaption: 'Attendance entries in range',
      present: 'Present',
      presentCaption: 'Students marked present',
      absent: 'Absent',
      absentCaption: 'Students marked absent',
      late: 'Late',
      lateCaption: 'Students marked late',
      excused: 'Excused',
      excusedCaption: 'Excused absences',
    },
    breakdown: {
      title: 'By Class',
      columns: {
        class: 'Class',
        total: 'Records',
        present: 'Present',
        absent: 'Absent',
        late: 'Late',
        rate: 'Rate',
      },
      empty: 'No data for the selected range.',
    },
    messages: {
      loadFailed: 'Failed to load attendance data.',
      noData: 'No attendance records found for the selected filters.',
    },
  },

  // ── Absence alerts ─────────────────────────────────────────────────────────
  preschoolAttendanceAlertsPage: {
    title: 'Absence Alerts',
    subtitle: 'Students with consecutive absences or a low attendance rate.',
    filters: {
      class: 'Class',
      allClasses: 'All Classes',
      threshold: 'Alert after',
      thresholdDays: '{n} consecutive days',
    },
    actions: {
      apply: 'Apply',
      back: 'Back',
    },
    severity: {
      critical: 'Critical',
      warning: 'Warning',
      watch: 'Watch',
    },
    columns: {
      student: 'Student',
      class: 'Class',
      streak: 'Consecutive Days',
      lastPresent: 'Last Present',
      severity: 'Alert',
    },
    messages: {
      loading: 'Analysing attendance data…',
      noAlerts: 'No students meet the alert threshold.',
      loadFailed: 'Failed to load attendance records.',
      empty: 'Select a class to check for absence alerts.',
    },
  },

  // ── Calendar view ──────────────────────────────────────────────────────────
  preschoolAttendanceCalendarPage: {
    title: 'Attendance Calendar',
    subtitle: 'Month-by-month attendance overview per class. Click a day to mark attendance.',
    filters: {
      class: 'Class',
    },
    placeholders: {
      class: 'Select a class',
    },
    actions: {
      prevMonth: 'Previous month',
      nextMonth: 'Next month',
      back: 'Back',
    },
    days: {
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
    },
    legend: {
      allPresent: 'All present',
      someAbsent: 'Some absent',
      mostlyAbsent: 'Mostly absent',
      noRecords: 'No records',
    },
    messages: {
      selectClass: 'Select a class to view the attendance calendar.',
      loading: 'Loading attendance data…',
      noRecords: 'No attendance records this month.',
    },
  },

  // ── Student profile ────────────────────────────────────────────────────────
  preschoolAttendanceProfilePage: {
    title: 'Student Attendance Profile',
    subtitle: 'Full attendance history and rate breakdown for a single student.',
    filters: {
      class: 'Class',
      student: 'Student',
    },
    placeholders: {
      class: 'All Classes',
      student: 'Select a student',
    },
    actions: {
      load: 'Load Profile',
      back: 'Back',
    },
    cards: {
      rate: 'Attendance Rate',
      rateCaption: 'Overall present rate',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      excused: 'Excused',
    },
    breakdown: {
      title: 'Monthly Breakdown',
      columns: {
        month: 'Month',
        total: 'Days',
        present: 'Present',
        absent: 'Absent',
        late: 'Late',
        rate: 'Rate',
      },
      empty: 'No records yet.',
    },
    history: {
      title: 'All Records',
      columns: {
        no: 'No.',
        date: 'Date',
        status: 'Status',
        class: 'Class',
        note: 'Note',
      },
      empty: 'No attendance records found for this student.',
    },
    messages: {
      selectStudent: 'Select a student to view their attendance profile.',
      loadFailed: 'Failed to load student attendance.',
    },
  },

  // ── Teacher hub ────────────────────────────────────────────────────────────
  preschoolTeacherAttendanceHubPage: {
    title: 'Attendance',
    subtitle: 'Mark attendance for your students or record your own.',
    cards: {
      students: {
        title: "My Students' Attendance",
        description: 'Mark daily attendance for students in your assigned classes.',
      },
      self: {
        title: 'My Attendance',
        description: 'Record your own attendance for today.',
      },
    },
  },

  preschoolTeacherStudentAttendancePage: {
    title: "My Students' Attendance",
    subtitle: 'Mark attendance for students in your classes.',
    actions: { back: 'Back' },
  },

  preschoolTeacherSelfAttendancePage: {
    title: 'My Attendance',
    subtitle: 'Record your own attendance for a selected date.',
    fields: { date: 'Date', status: 'Status', note: 'Note' },
    placeholders: { note: 'Add a note (optional)', status: 'Select status' },
    actions: { save: 'Save', saving: 'Saving…', back: 'Back' },
    messages: {
      saved: 'Your attendance has been recorded.',
      saveFailed: 'Failed to record attendance. Please try again.',
      selectStatus: 'Please select a status before saving.',
    },
  },

  // ── Legacy teacher attendance page ────────────────────────────────────────
  preschoolTeacherAttendancePage: {
    title: 'Preschool Attendance',
    subtitle: 'Track attendance for your assigned preschool classes.',
    searchPlaceholder: 'Search attendance',
    filters: { allStatus: 'All status' },
    columns: {
      no: 'No.',
      student: 'Student',
      class: 'Class',
      date: 'Date',
      status: 'Status',
      note: 'Note',
    },
    options: { present: 'Present', absent: 'Absent', late: 'Late', excused: 'Excused' },
    messages: {
      loadFailed: 'Failed to load attendance.',
      noResults: 'No attendance records found.',
    },
  },
}
