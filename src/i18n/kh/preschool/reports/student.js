// Keep the Khmer student report copy aligned with EN so the reporting pages
// stay readable and do not fall back to raw keys in the UI.
export default {
  preschoolStudentReportsPage: {
    title: 'របាយការណ៍សិស្ស',
    subtitle: 'ពិនិត្យការវាយតម្លៃ វត្តមាន និងកំណត់សម្គាល់ដែលបានបញ្ចប់របស់សិស្ស។',
    filters: {
      periodType: 'ប្រភេទរយៈពេល',
      student: 'សិស្ស',
      period: 'រយៈពេលរបាយការណ៍',
    },
    placeholders: {
      periodType: 'ជ្រើសប្រភេទរយៈពេល',
      student: 'ជ្រើសសិស្ស',
      period: 'ជ្រើសរយៈពេល',
    },
    periodTypes: {
      monthly: 'ប្រចាំខែ',
      term: 'តាម term',
      annual: 'ប្រចាំឆ្នាំ',
    },
    actions: {
      back: 'ត្រឡប់',
      load: 'ផ្ទុករបាយការណ៍',
      loading: 'កំពុងផ្ទុក…',
    },
  },
}
