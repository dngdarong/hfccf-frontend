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

export const GUARDIAN_TYPES = {
  FATHER: 'father',
  MOTHER: 'mother',
  GRANDFATHER: 'grandfather',
  GRANDMOTHER: 'grandmother',
  OTHER: 'other',
}

export const DEFAULT_FORM = {
  student_code: '',
  student_type: STUDENT_TYPES.PAYING,
  first_name: '',
  last_name: '',
  latin_name: '',
  nationality: '',
  ethnicity: '',
  gender: '',
  date_of_birth: '',
  guardian_name: '',
  guardian_phone: '',
  guardian_type: '',
  birth_province_id: '',
  birth_district_id: '',
  birth_commune_id: '',
  birth_village_id: '',
  residence_province_id: '',
  residence_district_id: '',
  residence_commune_id: '',
  residence_village_id: '',
  status: STUDENT_STATUSES.ACTIVE,
  class_ids: [],
  avatar: null,
  remove_avatar: false,
}

export const AVATAR_ACCEPT_TYPE = 'image/*'
