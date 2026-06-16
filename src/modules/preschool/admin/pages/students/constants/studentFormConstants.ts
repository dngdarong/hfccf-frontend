export const STUDENT_TYPES = {
  PAYING: 'paying',
  NON_PAYING: 'non_paying',
}

export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
}

export const STUDENT_STATUSES = {
  ACTIVE: 'active',
  PENDING: 'pending',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
}

export const DEFAULT_FORM = {
  student_code: '',
  student_type: STUDENT_TYPES.PAYING,
  first_name: '',
  last_name: '',
  gender: '',
  date_of_birth: '',
  guardian_name: '',
  guardian_phone: '',
  address: '',
  status: STUDENT_STATUSES.ACTIVE,
  class_ids: [],
  avatar: null,
  remove_avatar: false,
}

export const AVATAR_ACCEPT_TYPE = 'image/*'
