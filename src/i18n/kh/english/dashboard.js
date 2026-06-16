export default {
  english: {
    dashboard: {
      admin: {
        title: 'ផ្ទាំងគ្រប់គ្រង English',
        subtitle: 'ទិដ្ឋភាពទូទៅនៃថ្នាក់ គ្រូ សិស្ស និងសកម្មភាពកិច្ចការ។',
        loading: 'កំពុងផ្ទុកផ្ទាំងគ្រប់គ្រង English...',
        error: 'មិនអាចផ្ទុកផ្ទាំងគ្រប់គ្រង English បានទេ។',
        cards: {
          totalStudents: {
            title: 'សិស្សសរុប',
            label: 'អ្នកសិក្សាដែលបានចុះឈ្មោះ',
          },
          totalTeachers: {
            title: 'គ្រូសរុប',
            label: 'គ្រូបង្រៀន English',
          },
          activeClasses: {
            title: 'ថ្នាក់សកម្ម',
            label: 'ថ្នាក់កំពុងដំណើរការ',
          },
          activeTasks: {
            title: 'កិច្ចការសកម្ម',
            label: 'បំពង់កិច្ចការ',
          },
          pendingSubmissions: {
            title: 'ការដាក់ស្នើរង់ចាំ',
            label: 'កំពុងរង់ចាំពិនិត្យ',
          },
          reviewedSubmissions: {
            title: 'ការដាក់ស្នើបានពិនិត្យ',
            label: 'ធាតុដែលបានដាក់ពិន្ទុ',
          },
        },
        panels: {
          recentAssignments: {
            title: 'កិច្ចការថ្មីៗ',
            caption: 'កិច្ចការចុងក្រោយ',
            empty: 'មិនមានកិច្ចការថ្មីៗទេ។',
          },
          recentReviews: {
            title: 'ការពិនិត្យថ្មីៗ',
            caption: 'ការដាក់ស្នើដែលបានពិនិត្យចុងក្រោយ',
            empty: 'មិនមានការពិនិត្យថ្មីៗទេ។',
          },
          teacherWorkload: {
            title: 'បន្ទុកការងារគ្រូ',
            caption: 'ថ្នាក់ និងកិច្ចការតាមគ្រូ',
            empty: 'មិនមានទិន្នន័យបន្ទុកការងារគ្រូទេ។',
          },
        },
        tables: {
          assignments: {
            title: 'កិច្ចការ',
            class: 'ថ្នាក់',
            status: 'ស្ថានភាព',
            dueDate: 'ថ្ងៃផុតកំណត់',
          },
          reviews: {
            taskTitle: 'កិច្ចការដែលបានពិនិត្យ',
            studentName: 'សិស្ស',
            status: 'ស្ថានភាព',
            reviewedAt: 'បានពិនិត្យនៅ',
          },
          workload: {
            name: 'គ្រូ',
            classes: 'ថ្នាក់',
            tasks: 'កិច្ចការ',
          },
        },
      },
      teacher: {
        title: 'កន្លែងធ្វើការរបស់គ្រូ',
        subtitle: 'កិច្ចការ ការដាក់ស្នើ និងតាមដានថ្នាក់សម្រាប់ក្រុម English របស់អ្នក។',
        loading: 'កំពុងផ្ទុកផ្ទាំងគ្រប់គ្រងគ្រូ...',
        error: 'មិនអាចផ្ទុកផ្ទាំងគ្រប់គ្រងគ្រូ English បានទេ។',
        cards: {
          assignedClasses: {
            title: 'ថ្នាក់ដែលបានផ្ដល់',
            label: 'ថ្នាក់របស់អ្នក',
          },
          activeTasks: {
            title: 'កិច្ចការសកម្ម',
            label: 'កិច្ចការបើក',
          },
          pendingSubmissions: {
            title: 'ការដាក់ស្នើរង់ចាំ',
            label: 'កំពុងរង់ចាំពិនិត្យ',
          },
          reviewedSubmissions: {
            title: 'ការដាក់ស្នើបានពិនិត្យ',
            label: 'ការពិនិត្យបានបញ្ចប់',
          },
        },
        panels: {
          recentAssignments: {
            title: 'កិច្ចការថ្មីៗ',
            caption: 'កិច្ចការសម្រាប់ថ្នាក់របស់អ្នក',
            empty: 'មិនមានកិច្ចការថ្មីៗទេ។',
          },
          recentReviews: {
            title: 'ការពិនិត្យថ្មីៗ',
            caption: 'ការដាក់ស្នើដែលបានពិនិត្យចុងក្រោយ',
            empty: 'មិនមានការពិនិត្យថ្មីៗទេ។',
          },
        },
        tables: {
          assignments: {
            title: 'កិច្ចការ',
            class: 'ថ្នាក់',
            status: 'ស្ថានភាព',
            dueDate: 'ថ្ងៃផុតកំណត់',
          },
          reviews: {
            taskTitle: 'កិច្ចការដែលបានពិនិត្យ',
            studentName: 'សិស្ស',
            status: 'ស្ថានភាព',
            reviewedAt: 'បានពិនិត្យនៅ',
          },
        },
      },
    },
  },
}
