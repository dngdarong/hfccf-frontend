// Keep Khmer shared schedule labels in their own file so day names, statuses,
// and overlap messaging stay aligned across management and read-only views.
export default {
  preschoolSchedulesShared: {
    days: {
      monday: 'ថ្ងៃចន្ទ',
      tuesday: 'ថ្ងៃអង្គារ',
      wednesday: 'ថ្ងៃពុធ',
      thursday: 'ថ្ងៃព្រហស្បតិ៍',
      friday: 'ថ្ងៃសុក្រ',
      saturday: 'ថ្ងៃសៅរ៍',
      sunday: 'ថ្ងៃអាទិត្យ',
    },
    statuses: {
      active: 'សកម្ម',
      inactive: 'អសកម្ម',
      archived: 'ចាស់ទុកជាឯកសារ',
    },
    conflicts: {
      title: 'រកឃើញការប៉ះទង្គិចក្នុងកាលវិភាគ។',
      subtitle: 'ម៉ាស៊ីនមេមិនអនុញ្ញាតឱ្យរក្សាទុកទេ ព្រោះមានកាលវិភាគសកម្មមួយ ឬច្រើនជាន់គ្នា។',
      class: 'ថ្នាក់ដូចគ្នាមានកាលវិភាគជាន់គ្នា។',
      teacher: 'គ្រូដូចគ្នាមានកាលវិភាគជាន់គ្នា។',
      room: 'បន្ទប់ដូចគ្នាមានកាលវិភាគជាន់គ្នា។',
    },
    loading: {
      grid: 'កំពុងផ្ទុកធាតុកាលវិភាគ...',
    },
  },
}
