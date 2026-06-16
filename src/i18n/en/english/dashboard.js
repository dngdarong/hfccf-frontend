export default {
  english: {
    dashboard: {
      admin: {
        title: 'English Dashboard',
        subtitle: 'Overview of classes, teachers, students, and task activity.',
        loading: 'Loading English dashboard...',
        error: 'Failed to load English dashboard.',
        cards: {
          totalStudents: {
            title: 'Total students',
            label: 'Registered learners',
          },
          totalTeachers: {
            title: 'Total teachers',
            label: 'English instructors',
          },
          activeClasses: {
            title: 'Active classes',
            label: 'Running classes',
          },
          activeTasks: {
            title: 'Active tasks',
            label: 'Task pipeline',
          },
          pendingSubmissions: {
            title: 'Pending submissions',
            label: 'Awaiting review',
          },
          reviewedSubmissions: {
            title: 'Reviewed submissions',
            label: 'Scored items',
          },
        },
        panels: {
          recentAssignments: {
            title: 'Recent Assignments',
            caption: 'Latest tasks',
            empty: 'No recent assignments.',
          },
          recentReviews: {
            title: 'Recent Reviews',
            caption: 'Latest reviewed submissions',
            empty: 'No recent reviews.',
          },
          teacherWorkload: {
            title: 'Teacher Workload',
            caption: 'Classes and tasks per teacher',
            empty: 'No teacher workload data.',
          },
        },
        tables: {
          assignments: {
            title: 'Task',
            class: 'Class',
            status: 'Status',
            dueDate: 'Due Date',
          },
          reviews: {
            taskTitle: 'Reviewed Task',
            studentName: 'Student',
            status: 'Status',
            reviewedAt: 'Reviewed At',
          },
          workload: {
            name: 'Teacher',
            classes: 'Classes',
            tasks: 'Tasks',
          },
        },
      },
      teacher: {
        title: 'Teacher Workspace',
        subtitle: 'Tasks, submissions, and class follow-up for your English groups.',
        loading: 'Loading teacher dashboard...',
        error: 'Failed to load English teacher dashboard.',
        cards: {
          assignedClasses: {
            title: 'Assigned classes',
            label: 'Your classes',
          },
          activeTasks: {
            title: 'Active tasks',
            label: 'Open tasks',
          },
          pendingSubmissions: {
            title: 'Pending submissions',
            label: 'Awaiting review',
          },
          reviewedSubmissions: {
            title: 'Reviewed submissions',
            label: 'Completed reviews',
          },
        },
        panels: {
          recentAssignments: {
            title: 'Recent Assignments',
            caption: 'Tasks for your classes',
            empty: 'No recent assignments.',
          },
          recentReviews: {
            title: 'Recent Reviews',
            caption: 'Latest reviewed submissions',
            empty: 'No recent reviews.',
          },
        },
        tables: {
          assignments: {
            title: 'Task',
            class: 'Class',
            status: 'Status',
            dueDate: 'Due Date',
          },
          reviews: {
            taskTitle: 'Reviewed Task',
            studentName: 'Student',
            status: 'Status',
            reviewedAt: 'Reviewed At',
          },
        },
      },
    },
  },
}
