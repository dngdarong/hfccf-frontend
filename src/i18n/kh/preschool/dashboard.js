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
}

export default mergeDeep(enPreschool, overrides)
