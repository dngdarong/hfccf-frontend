// Keep the Preschool report overview copy in its own module so the landing
// page can evolve without changing the student and classroom report copy.
export default {
  preschoolReportsPage: {
    title: 'របាយការណ៍ Preschool',
    subtitle: 'ពិនិត្យទិន្នន័យវាយតម្លៃ និង attendance ដែលបានបញ្ចប់តាមរយៈ reporting period។',
    loading: 'កំពុងផ្ទុករយៈពេលរបាយការណ៍...',
    emptyOverview: 'មិនទាន់មាន report period ដែលបានបញ្ចប់នៅឡើយទេ។',
    actions: {
      openStudentReports: 'របាយការណ៍សិស្ស',
      openClassroomReports: 'របាយការណ៍ថ្នាក់',
    },
    overview: {
      periods: 'រយៈពេលរបាយការណ៍',
      periodsCaption: 'រយៈពេលដែលបានបញ្ចប់សម្រាប់របាយការណ៍',
      students: 'សិស្សដែលតាមដាន',
      studentsCaption: 'សិស្សដែលមាននៅក្នុង Preschool',
      finalized: 'រយៈពេលដែលបានបញ្ចប់',
      finalizedCaption: 'បង្អួចរបាយការណ៍ដែលបានបិទ និងគួរតែមានស្ថិរភាព',
      locked: 'ចាក់សោ / រក្សាទុកឯកសារ',
      lockedCaption: 'រយៈពេលដែលអាចអានបានតែប៉ុណ្ណោះសម្រាប់ការងារធម្មតា',
      listTitle: 'បញ្ជីរយៈពេលរបាយការណ៍',
      listSubtitle: 'រយៈពេលរបាយការណ៍ដែលទាញយកពីទិន្នន័យវាយតម្លៃដែលបានបញ្ចប់។',
    },
    selectedPeriod: {
      title: 'រយៈពេលរបាយការណ៍ដែលបានជ្រើស',
      subtitle: 'រយៈពេលនេះកំណត់ថាតើរបាយការណ៍ណានឹងបង្ហាញខាងក្រោម។',
    },
    periodColumns: {
      label: 'រយៈពេល',
      status: 'ស្ថានភាព',
      dates: 'ចន្លោះថ្ងៃ',
      assessments: 'វាយតម្លៃ',
      students: 'សិស្ស',
      classes: 'ថ្នាក់',
    },
  },
}

