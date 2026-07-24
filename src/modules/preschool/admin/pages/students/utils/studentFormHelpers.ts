import { GUARDIAN_TYPES } from '../constants/studentFormConstants'

export function buildStudentTypeOptions(t: any) {
  return [
    { label: t('preschoolStudentInfoPage.options.paying'), value: 'paying' },
    { label: t('preschoolStudentInfoPage.options.nonPaying'), value: 'non_paying' },
  ]
}

export function buildGuardianTypeOptions(t: any) {
  return [
    { label: t('preschoolStudentInfoPage.options.father'), value: GUARDIAN_TYPES.FATHER },
    { label: t('preschoolStudentInfoPage.options.mother'), value: GUARDIAN_TYPES.MOTHER },
    { label: t('preschoolStudentInfoPage.options.grandfather'), value: GUARDIAN_TYPES.GRANDFATHER },
    { label: t('preschoolStudentInfoPage.options.grandmother'), value: GUARDIAN_TYPES.GRANDMOTHER },
    { label: t('preschoolStudentInfoPage.options.other'), value: GUARDIAN_TYPES.OTHER },
  ]
}

export function buildGenderOptions(t: any) {
  return [
    { label: t('preschoolStudentInfoPage.options.male'), value: 'male' },
    { label: t('preschoolStudentInfoPage.options.female'), value: 'female' },
    { label: t('preschoolStudentInfoPage.options.other'), value: 'other' },
  ]
}

export function buildStatusOptions(t: any) {
  return [
    { label: t('preschoolStudentInfoPage.options.active'), value: 'active' },
    { label: t('preschoolStudentInfoPage.options.pending'), value: 'pending' },
    { label: t('preschoolStudentInfoPage.options.inactive'), value: 'inactive' },
    { label: t('preschoolStudentInfoPage.options.graduated'), value: 'graduated' },
  ]
}

export function buildClassOptions(classes: any[]) {
  return (classes || []).map((item) => ({
    label: `${item.code} - ${item.name}`,
    value: item.id,
  }))
}

export function clearAvatarPreview(previewUrl: string) {
  if (previewUrl.startsWith('blob:')) {
    URL.revokeObjectURL(previewUrl)
  }
}

export function createResetForm(defaultForm: any) {
  return { ...defaultForm }
}

function normalizeText(value: any) {
  return String(value ?? '').trim()
}

function normalizeFormId(value: any) {
  const text = normalizeText(value)
  if (!text) return ''

  const numeric = Number(text)
  return Number.isFinite(numeric) ? String(numeric) : text
}

export function loadStudentIntoForm(student: any, form: any) {
  form.student_code = student.studentCode || ''
  form.student_type = student.studentType || student.student_type || 'paying'
  form.first_name = student.firstName || ''
  form.last_name = student.lastName || ''
  form.latin_name = student.latinName || student.latin_name || ''
  form.nationality = student.nationality || ''
  form.ethnicity = student.ethnicity || ''
  form.gender = student.gender || ''
  form.date_of_birth = student.dateOfBirth || ''
  form.guardian_name = student.guardianName || ''
  form.guardian_phone = student.guardianPhone || ''
  form.guardian_type = student.guardianType || student.guardian_type || student.relationshipType || student.relationship_type || ''
  form.birth_province_id = normalizeFormId(student.birthProvinceId || student.birth_province_id || student.birthProvince?.id)
  form.birth_district_id = normalizeFormId(student.birthDistrictId || student.birth_district_id || student.birthDistrict?.id)
  form.birth_commune_id = normalizeFormId(student.birthCommuneId || student.birth_commune_id || student.birthCommune?.id)
  form.birth_village_id = normalizeFormId(student.birthVillageId || student.birth_village_id || student.birthVillage?.id)
  form.residence_province_id = normalizeFormId(student.residenceProvinceId || student.residence_province_id || student.residenceProvince?.id)
  form.residence_district_id = normalizeFormId(student.residenceDistrictId || student.residence_district_id || student.residenceDistrict?.id)
  form.residence_commune_id = normalizeFormId(student.residenceCommuneId || student.residence_commune_id || student.residenceCommune?.id)
  form.residence_village_id = normalizeFormId(student.residenceVillageId || student.residence_village_id || student.residenceVillage?.id)
  form.status = student.status || 'active'
  form.class_ids = Array.isArray(student.classes)
    ? student.classes.map((item: any) => item.id).filter(Boolean)
    : []
  form.avatar = null
  form.remove_avatar = false
}

export function getStudentDisplayName(firstName: string, lastName: string): string {
  return firstName || lastName ? `${firstName} ${lastName}`.trim() : '-'
}

export function normalizeStudentPayload(form: any, isEditMode: boolean) {
  const normalizeNullableText = (value: any) => {
    const text = normalizeText(value)
    return text || null
  }

  const normalizeNullableId = (value: any) => {
    const text = normalizeText(value)
    if (!text) return null

    const numeric = Number(text)
    return Number.isFinite(numeric) ? numeric : null
  }

  return {
    student_code: isEditMode ? form.student_code.trim() : undefined,
    student_type: form.student_type || 'paying',
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    latin_name: normalizeNullableText(form.latin_name),
    nationality: normalizeNullableText(form.nationality),
    ethnicity: normalizeNullableText(form.ethnicity),
    gender: form.gender || null,
    date_of_birth: form.date_of_birth || null,
    guardian_name: form.guardian_name.trim() || null,
    guardian_phone: form.guardian_phone.trim() || null,
    guardian_type: form.guardian_type || null,
    birth_province_id: normalizeNullableId(form.birth_province_id),
    birth_district_id: normalizeNullableId(form.birth_district_id),
    birth_commune_id: normalizeNullableId(form.birth_commune_id),
    birth_village_id: normalizeNullableId(form.birth_village_id),
    residence_province_id: normalizeNullableId(form.residence_province_id),
    residence_district_id: normalizeNullableId(form.residence_district_id),
    residence_commune_id: normalizeNullableId(form.residence_commune_id),
    residence_village_id: normalizeNullableId(form.residence_village_id),
    status: form.status,
    class_ids: form.class_ids,
    avatar: form.avatar instanceof File ? form.avatar : undefined,
    removeAvatar: form.remove_avatar || undefined,
  }
}

export function buildSuccessQuery(isEditMode: boolean) {
  return {
    saved: isEditMode ? 'updated' : 'created',
  }
}
