// Keep Preschool admin copy grouped here while the module is still being
// normalized, so class-management regressions remain easy to trace.
export default {
  preschoolClassesManagement: {
    title: 'ថ្នាក់មត្តេយ្យសិក្សា',
    subtitle: 'គ្រប់គ្រងក្រុមថ្នាក់ គ្រូដែលបានចាត់តាំង និងការរៀបចំកាលវិភាគសម្រាប់ការសិក្សាដំបូង។',
    addButton: 'បន្ថែមថ្នាក់',
    searchPlaceholder: 'ស្វែងរកថ្នាក់ គ្រូ កម្រិត ឬកាលវិភាគ',
    tableEmpty: 'មិនមានថ្នាក់មត្តេយ្យសិក្សាទេ។',
    toolbarEyebrow: 'បញ្ជីថ្នាក់',
    toolbarSummary: '{count} ថ្នាក់កំពុងបង្ហាញ',
    visibleRange: 'បង្ហាញ {start}-{end} នៃ {total} ថ្នាក់',
    noResults: 'មិនមានថ្នាក់ណាដែលផ្គូផ្គងនឹងតម្រងបច្ចុប្បន្នទេ។',
    spotlightLabel: 'ថ្នាក់សកម្ម',
    highlights: {
      visibleClasses: 'ថ្នាក់ដែលមើលឃើញ',
      visibleStudents: 'សិស្សដែលមើលឃើញ',
      avgStudents: 'មធ្យមសិស្ស',
    },
    alerts: {
      deleteTitle: 'លុបថ្នាក់?',
      deleteMessage: 'តើអ្នកប្រាកដថាចង់លុប {name} ដែរឬទេ?',
      deleteFallback: 'ថ្នាក់នេះ',
      confirm: 'លុប',
      cancel: 'បោះបង់',
      successTitle: 'ជោគជ័យ',
      close: 'បិទ',
    },
    messages: {
      loadFailed: 'មិនអាចផ្ទុកថ្នាក់មត្តេយ្យសិក្សាបានទេ។',
      deleteFailed: 'មិនអាចលុបថ្នាក់បានទេ។',
      deleteSuccess: 'ថ្នាក់ {name} ត្រូវបានលុបដោយជោគជ័យ។',
    },
    summary: {
      total: {
        title: 'ថ្នាក់សរុប',
        badge: '{count} ក្រុម',
        caption: 'ថ្នាក់មត្តេយ្យសិក្សាសរុបដែលកំពុងគ្រប់គ្រងនៅក្នុងកម្មវិធី។',
      },
      active: {
        title: 'ថ្នាក់សកម្ម',
        badge: '{rate} កំពុងដំណើរការ',
        caption: 'ថ្នាក់ដែលកំពុងដំណើរការជាមួយគ្រូដែលបានចាត់តាំង និងបញ្ជីសិស្សសកម្ម។',
      },
      pending: {
        title: 'រង់ចាំរៀបចំ',
        badge: 'ត្រូវការពិនិត្យ',
        badgeClear: 'គ្មានកំពុងរង់ចាំ',
        caption: 'ថ្នាក់ដែលកំពុងរង់ចាំការបញ្ជាក់កាលវិភាគ ឬការចាត់តាំងគ្រូ។',
      },
      students: {
        title: 'សិស្សសរុប',
        badge: 'បានចុះឈ្មោះ',
        caption: 'ចំនួនសិស្សសរុបនៅលើគ្រប់កម្រិតថ្នាក់មត្តេយ្យសិក្សា។',
      },
    },
    table: {
      code: 'កូដ',
      class: 'ថ្នាក់',
      teacher: 'គ្រូ',
      level: 'កម្រិត',
      schedule: 'កាលវិភាគ',
      students: 'សិស្ស',
    },
  },
}
