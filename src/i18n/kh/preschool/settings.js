import enPreschool from '@/i18n/en/preschool/settings.js'

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
  preschoolPreferencesSettingsPage: {
    pageTitle: 'ចំណូលចិត្ត',
    pageSubtitle: 'កំណត់លំនាំប្រតិបត្តិការសម្រាប់ការចុះឈ្មោះ សមត្ថភាពថ្នាក់ លេខកូដសិស្ស អាណាព្យាបាល និងការទំនាក់ទំនង។',
    sections: {
      general: {
        eyebrow: 'ចំណូលចិត្តទូទៅ',
        title: 'ចំណូលចិត្តទូទៅ',
        subtitle: 'កំណត់ភាសា និងទម្រង់បង្ហាញដែលប្រើទូទាំង Preschool។',
      },
      enrollment: {
        eyebrow: 'ច្បាប់ចុះឈ្មោះ',
        title: 'ច្បាប់ចុះឈ្មោះ',
        subtitle: 'កំណត់អាយុអប្បបរមា អតិបរមា និងលំនាំអនុម័តការចុះឈ្មោះ។',
      },
      studentCode: {
        eyebrow: 'ច្បាប់លេខកូដសិស្ស',
        title: 'ច្បាប់លេខកូដសិស្ស',
        subtitle: 'កំណត់កូដនាំមុខ ទម្រង់ឆ្នាំ និងប្រវែងលេខរៀង។',
      },
      classRules: {
        eyebrow: 'ច្បាប់ថ្នាក់',
        title: 'ច្បាប់ថ្នាក់',
        subtitle: 'កំណត់សមត្ថភាពថ្នាក់លំនាំដើម និងសមាមាត្រគ្រូ-សិស្ស។',
      },
      guardianRules: {
        eyebrow: 'ច្បាប់អាណាព្យាបាល',
        title: 'ច្បាប់អាណាព្យាបាល',
        subtitle: 'កំណត់ចំនួនអាណាព្យាបាល និងលំនាំអនុញ្ញាតទទួលសិស្ស។',
      },
      communicationRules: {
        eyebrow: 'ច្បាប់ទំនាក់ទំនង',
        title: 'ច្បាប់ទំនាក់ទំនង',
        subtitle: 'បើក ឬបិទការជូនដំណឹងប្រតិបត្តិការសម្រាប់បុគ្គលិក និងគ្រួសារ។',
      },
    },
    fields: {
      timezone: 'ល្វែងម៉ោង',
      defaultLanguage: 'ភាសាលំនាំដើម',
      dateFormat: 'ទម្រង់កាលបរិច្ឆេទ',
      timeFormat: 'ទម្រង់ម៉ោង',
      minimumEnrollmentAgeMonths: 'អាយុចុះឈ្មោះអប្បបរមា (ខែ)',
      maximumEnrollmentAgeMonths: 'អាយុចុះឈ្មោះអតិបរមា (ខែ)',
      autoApproveEnrollment: 'អនុម័តការចុះឈ្មោះដោយស្វ័យប្រវត្តិ',
      studentCodePrefix: 'បុព្វបទលេខកូដសិស្ស',
      studentCodeYearFormat: 'ទម្រង់ឆ្នាំ',
      studentCodeSequenceLength: 'ប្រវែងលេខរៀង',
      defaultClassCapacity: 'សមត្ថភាពថ្នាក់លំនាំដើម',
      teacherStudentRatio: 'សមាមាត្រគ្រូ-សិស្ស',
      waitlistEnabled: 'បញ្ជីរង់ចាំ',
      minimumGuardians: 'អាណាព្យាបាលអប្បបរមា',
      maximumGuardians: 'អាណាព្យាបាលអតិបរមា',
      primaryGuardianRequired: 'តម្រូវឱ្យមានអាណាព្យាបាលសំខាន់',
      pickupAuthorizationRequired: 'តម្រូវឱ្យមានការអនុញ្ញាតទទួលសិស្ស',
      attendanceAlerts: 'ការជូនដំណឹងវត្តមាន',
      assessmentAlerts: 'ការជូនដំណឹងវាយតម្លៃ',
      healthAlerts: 'ការជូនដំណឹងសុខភាព',
      enrollmentNotifications: 'ការជូនដំណឹងចុះឈ្មោះ',
    },
    preview: {
      studentCode: 'មើលសាកល្បងលេខកូដសិស្ស',
    },
    languages: {
      english: 'អង់គ្លេស',
      khmer: 'ខ្មែរ',
    },
    actions: {
      saveSettings: 'រក្សាទុកចំណូលចិត្ត',
    },
    messages: {
      loadFailed: 'មិនអាចផ្ទុកចំណូលចិត្តបានទេ។',
      saveFailed: 'មិនអាចរក្សាទុកចំណូលចិត្តបានទេ។',
      settingsSaved: 'បានរក្សាទុកចំណូលចិត្តរួចហើយ។',
      validationFailed: 'សូមកែប្រែវាលដែលបានបន្លិចមុនរក្សាទុក។',
    },
    validation: {
      required: 'វាលនេះត្រូវតែបំពេញ។',
      positive: 'សូមបញ្ចូលលេខវិជ្ជមាន។',
      range: 'អាយុអតិបរមាត្រូវធំជាង ឬស្មើអាយុអប្បបរមា។',
      invalidTimezone: 'សូមជ្រើសល្វែងម៉ោងដែលគាំទ្រ។',
      unsupportedLanguage: 'សូមជ្រើសភាសាដែលគាំទ្រ។',
      invalidDateFormat: 'សូមជ្រើសទម្រង់កាលបរិច្ឆេទដែលគាំទ្រ។',
      invalidTimeFormat: 'សូមជ្រើសទម្រង់ម៉ោងដែលគាំទ្រ។',
      invalidYearFormat: 'សូមជ្រើសទម្រង់ឆ្នាំដែលគាំទ្រ។',
    },
  },
  preschoolSettingsPage: {
    dashboard: {
      fields: {
        enrollmentRules: 'ច្បាប់ចុះឈ្មោះ',
        studentCodeFormat: 'ទម្រង់លេខកូដសិស្ស',
        classCapacity: 'សមត្ថភាពថ្នាក់',
        guardianRules: 'ច្បាប់អាណាព្យាបាល',
        communicationRules: 'ច្បាប់ទំនាក់ទំនង',
      },
      emptyStates: {
        enrollmentRules: 'មិនទាន់កំណត់ច្បាប់ចុះឈ្មោះ',
        studentCodeFormat: 'មិនទាន់កំណត់ទម្រង់លេខកូដសិស្ស',
        classCapacity: 'មិនទាន់កំណត់សមត្ថភាពថ្នាក់',
        guardianRules: 'មិនទាន់កំណត់ច្បាប់អាណាព្យាបាល',
        communicationRules: 'មិនទាន់កំណត់ច្បាប់ទំនាក់ទំនង',
      },
      sections: {
        preferences: {
          eyebrow: 'ចំណូលចិត្ត',
          title: 'ចំណូលចិត្ត',
          subtitle: 'ពិនិត្យមើលលំនាំប្រតិបត្តិការដែលកំពុងប្រើសម្រាប់ Preschool។',
          action: 'បើកចំណូលចិត្ត',
        },
      },
    },
  },
  preschoolClassLevelsPage: {
    eyebrow: 'ការកំណត់ថ្នាក់',
    title: 'កម្រិតថ្នាក់',
    subtitle: 'គ្រប់គ្រងកម្រិតថ្នាក់មត្តេយ្យដែលអាចកំណត់បានសម្រាប់ទម្រង់ថ្នាក់ និងការចុះឈ្មោះ។',
    description: 'បន្ថែមកម្រិតថ្មីនៅទីនេះ ហើយប្រើវានៅពេលបង្កើតថ្នាក់ដោយមិនចាំបាច់ hardcode បញ្ជីជម្រើស។',
    actions: {
      add: 'បន្ថែមកម្រិតថ្នាក់',
      save: 'រក្សាទុកកម្រិតថ្នាក់',
      deactivate: 'បិទដំណើរការ',
      restore: 'ស្តារឡើងវិញ',
    },
    status: {
      active: 'សកម្ម',
      inactive: 'មិនសកម្ម',
    },
    labels: {
      sortOrder: 'លំដាប់: {value}',
    },
    emptyStates: {
      none: 'មិនមានកម្រិតថ្នាក់ទេ។',
      noKhmer: 'មិនទាន់មានឈ្មោះខ្មែរ',
    },
    dialog: {
      addTitle: 'បន្ថែមកម្រិតថ្នាក់',
      editTitle: 'កែសម្រួលកម្រិតថ្នាក់',
      subtitle: 'ប្រើលេខកូដខ្លី និងឯកតា ដើម្បីឲ្យការបង្កើតកូដថ្នាក់អាចយកទៅប្រើបានដោយសុវត្ថិភាព។',
    },
    fields: {
      nameEn: 'ឈ្មោះកម្រិត EN',
      nameKh: 'ឈ្មោះកម្រិត KH',
      code: 'លេខកូដកម្រិត',
      sortOrder: 'លំដាប់',
      isActive: 'សកម្ម',
    },
    placeholders: {
      nameEn: 'Nursery',
      nameKh: 'មត្តេយ្យកម្រិតតូច',
      code: 'NUR',
      sortOrder: '0',
    },
    help: {
      isActive: 'កម្រិតដែលមិនសកម្មនៅតែរក្សាទុកសម្រាប់កំណត់ត្រា ប៉ុន្តែមិនបង្ហាញក្នុងការជ្រើសរើសថ្នាក់ថ្មី។',
    },
    validation: {
      required: 'វាលនេះត្រូវតែបំពេញ។',
      max: 'ត្រូវមានត្រឹម 10 តួអក្សរ ឬតិចជាងនេះ។',
      positive: 'សូមបញ្ចូលលេខ 0 ឬច្រើនជាងនេះ។',
      alphaNumeric: 'ប្រើតែលេខកូដអក្សរធំ និងលេខប៉ុណ្ណោះ។',
    },
  },
  preschoolAssessmentSettingsPage: {
    fields: {
      periodType: 'ប្រភេទរយៈពេល',
    },
    periodTypes: {
      monthly: 'ប្រចាំខែ',
      term: 'តាម term',
      annual: 'ប្រចាំឆ្នាំ',
    },
    help: {
      termOptional: 'អាចទុកទទេសម្រាប់រយៈពេលប្រចាំខែ ឬប្រចាំឆ្នាំ។',
    },
    placeholders: {
      termOptional: 'ជាជម្រើសសម្រាប់ប្រចាំខែ ឬប្រចាំឆ្នាំ',
    },
  },
}

export default mergeDeep(enPreschool, overrides)
