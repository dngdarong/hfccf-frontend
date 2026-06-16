// Keep progress summary labels isolated so the Khmer copy stays aligned with
// the EN summary view and future Preschool reports do not inherit hardcoded text.
export default {
  preschoolProgressSummaryPage: {
    title: 'សង្ខេបវឌ្ឍនភាព',
    subtitle: 'ពិនិត្យមើលនិន្នាការវាយតម្លៃដែលបានបញ្ចប់ មុនដំណាក់កាលរបាយការណ៍មានពេញលេញ។',
    loading: 'កំពុងផ្ទុកសង្ខេបវឌ្ឍនភាព...',
    emptyRecent: 'នៅពេលនេះមិនទាន់មានការវាយតម្លៃដែលបានបញ្ចប់ទេ។',
    emptyTrends: 'នៅពេលនេះមិនទាន់មាននិន្នាការតាមប្រភេទទេ។',
    cardFallback: 'សូចនាករសង្ខេប',
    recentTitle: 'ការវាយតម្លៃដែលបានបញ្ចប់ថ្មីៗ',
    trendsTitle: 'និន្នាការតាមប្រភេទ',
    selectedStudent: 'សិស្សដែលបានជ្រើសរើស៖ {name}',
    filters: {
      student: 'សិស្ស',
    },
    placeholders: {
      student: 'ជ្រើសរើសសិស្ស',
    },
    actions: {
      refresh: 'ធ្វើបច្ចុប្បន្នភាពសង្ខេប',
    },
    cards: {
      total: {
        title: 'ការវាយតម្លៃសរុប',
        caption: 'កំណត់ត្រាសេចក្ដីព្រាង បានបញ្ចប់ និងបានទុកក្នុងបណ្ណសារ',
      },
      finalized: {
        title: 'បានបញ្ចប់',
        caption: 'កំណត់ត្រាវឌ្ឍនភាពដែលបានចាក់សោ',
      },
      draft: {
        title: 'សេចក្ដីព្រាង',
        caption: 'ការវាយតម្លៃដែលអាចកែសម្រួលបាន',
      },
      average: {
        title: 'ពិន្ទុមធ្យម',
        caption: 'ពិន្ទុមធ្យមនៃកំណត់ត្រាដែលបានបញ្ចប់',
      },
    },
    countLabel: '{count} ការវាយតម្លៃ',
    averageLabel: 'មធ្យម៖ {score}',
  },
}
