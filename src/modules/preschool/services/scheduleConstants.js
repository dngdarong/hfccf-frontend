// Keep schedule constants in one tiny module so day and status values stay in
// sync across the management, class, and teacher timetable pages.
export const PreschoolScheduleDay = Object.freeze({
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
})

export const PreschoolScheduleStatus = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
})
