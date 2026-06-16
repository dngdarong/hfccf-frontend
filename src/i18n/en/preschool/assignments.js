export default {
  preschoolAssignmentsPage: {
    title: 'Preschool Assignment Workflow',
    subtitle:
      'Admin-only hub for student-class, teacher-class, and schedule assignments. Teacher-preschool stays scoped to assigned operational data only.',
    workflowNote:
      'Assignment history is preserved on the pivot table so active and inactive links remain visible without deleting records.',
    quickActions: {
      title: 'Workflow shortcuts',
      manageStudents: 'Manage Students',
      manageClasses: 'Manage Classes',
      manageTeachers: 'Manage Teachers',
      manageSchedules: 'Manage Schedules',
      attendance: 'Attendance',
    },
    summary: {
      studentAssignments: {
        title: 'Student Assignments',
        caption: 'Current student-class links',
      },
      teacherAssignments: {
        title: 'Teacher Assignments',
        caption: 'Current class ownership',
      },
      scheduleAssignments: {
        title: 'Schedule Assignments',
        caption: 'Class and teacher timetable rows',
      },
      history: {
        title: 'Assignment History',
        caption: 'Inactive and previous links',
      },
    },
    sections: {
      studentAssignments: {
        eyebrow: 'Student to class',
        title: 'Student Class Assignments',
        subtitle:
          'Active and inactive student-class links are preserved on the pivot table for review and transfer history.',
      },
      teacherAssignments: {
        eyebrow: 'Teacher to class',
        title: 'Teacher Class Assignments',
        subtitle:
          'Teachers are assigned at the class level. Staff teachers only see their scoped classes and students.',
      },
      scheduleAssignments: {
        eyebrow: 'Schedule to class and teacher',
        title: 'Schedule Assignments',
        subtitle:
          'Schedule rows connect classes and teachers for the weekly operational flow.',
      },
      history: {
        eyebrow: 'Audit trail',
        title: 'Assignment History',
        subtitle:
          'Inactive links remain visible so transfers and deactivations can be reviewed by Preschool admins.',
      },
    },
    table: {
      student: 'Student',
      class: 'Class',
      teacher: 'Teacher',
      status: 'Status',
      enrolledAt: 'Enrolled',
      updatedAt: 'Updated',
      schedule: 'Schedule',
      day: 'Day',
      record: 'Record',
      type: 'Type',
      notes: 'Notes',
      actions: 'Actions',
    },
    statusLabels: {
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      archived: 'Archived',
    },
    empty: 'No assignments found.',
    loading: 'Loading assignments...',
  },
}
