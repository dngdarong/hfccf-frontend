export const DEFAULT_PAGINATION = {
  currentPage: 1,
  lastPage: 1,
  total: 0,
}

export const DEFAULT_FILTERS = {
  search: '',
  status: '',
  academicYearId: '',
}

export const DEFAULT_SUMMARY = {}

export const FINAL_STATUSES = ['enrolled', 'rejected', 'cancelled']

export const DECISION_HANDLERS = {
  approve: 'approveEnrollment',
  reject: 'rejectEnrollment',
  waitlist: 'waitlistEnrollment',
  cancel: 'cancelEnrollment',
  enroll: 'enrollStudent',
  review: 'reviewEnrollment',
}

export const DECISION_MESSAGE_KEYS = {
  approve: 'approveSuccess',
  reject: 'rejectSuccess',
  waitlist: 'waitlistSuccess',
  cancel: 'cancelSuccess',
  enroll: 'enrollSuccess',
  review: 'reviewSuccess',
}

export const EDITABLE_STATUSES = ['draft', 'submitted', 'waitlisted', 'under_review', 'approved']

export const QUICK_ACTIONS = {
  SUBMIT: 'submit',
}
