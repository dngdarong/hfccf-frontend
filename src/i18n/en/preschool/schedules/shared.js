// Keep shared schedule labels in their own file so day names, statuses, and
// overlap messaging stay aligned across management and read-only views.
export default {
  preschoolSchedulesShared: {
    days: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    },
    statuses: {
      active: 'Active',
      inactive: 'Inactive',
      archived: 'Archived',
    },
    conflicts: {
      title: 'Schedule conflict detected.',
      subtitle: 'The server rejected the save because one or more active schedules overlap.',
      class: 'Same class has an overlapping schedule.',
      teacher: 'Same teacher has an overlapping schedule.',
      room: 'Same room has an overlapping schedule.',
    },
    loading: {
      grid: 'Loading timetable entries...',
    },
  },
}
