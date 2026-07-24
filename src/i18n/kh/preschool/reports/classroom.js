// Keep the Khmer classroom report copy aligned with EN so the report table
// remains easy to read and easy to regression test.
export default {
  preschoolClassroomReportsPage: {
    title: 'របាយការណ៍ថ្នាក់',
    subtitle: 'ពិនិត្យការរីកចម្រើន វត្តមាន និងការសង្កេតរបស់ថ្នាក់ទាំងមូល។',
    filters: {
      periodType: 'ប្រភេទរយៈពេល',
      class: 'ថ្នាក់',
      period: 'រយៈពេលរបាយការណ៍',
    },
    placeholders: {
      periodType: 'ជ្រើសប្រភេទរយៈពេល',
      class: 'ជ្រើសថ្នាក់',
      period: 'ជ្រើសរយៈពេលរបាយការណ៍',
    },
    periodTypes: {
      monthly: 'ប្រចាំខែ',
      term: 'តាម term',
      annual: 'ប្រចាំឆ្នាំ',
    },
    actions: {
      back: 'ត្រឡប់ទៅទិដ្ឋភាពទូទៅ',
    },
    studentsTitle: 'សង្ខេបសិស្ស',
    emptyStudents: 'មិនទាន់មានសង្ខេបសិស្សសម្រាប់រយៈពេលនេះទេ។',
    studentColumns: {
      name: 'សិស្ស',
      assessments: 'ការវាយតម្លៃ',
      average: 'មធ្យមភាគ',
      attendance: 'វត្តមាន',
      latest: 'ការវាយតម្លៃចុងក្រោយ',
    },
  },
}
