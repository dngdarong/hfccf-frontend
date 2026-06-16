export function buildStudentTypeOptions(t: any) {
  return [
    { label: t('preschoolStudentInfoPage.options.paying'), value: 'paying' },
    { label: t('preschoolStudentInfoPage.options.nonPaying'), value: 'non_paying' },
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

export function loadStudentIntoForm(student: any, form: any) {
  form.student_code = student.studentCode || ''
  form.student_type = student.studentType || student.student_type || 'paying'
  form.first_name = student.firstName || ''
  form.last_name = student.lastName || ''
  form.gender = student.gender || ''
  form.date_of_birth = student.dateOfBirth || ''
  form.guardian_name = student.guardianName || ''
  form.guardian_phone = student.guardianPhone || ''
  form.address = student.address || ''
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
  return {
    student_code: isEditMode ? form.student_code.trim() : undefined,
    student_type: form.student_type || 'paying',
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    gender: form.gender || null,
    date_of_birth: form.date_of_birth || null,
    guardian_name: form.guardian_name.trim() || null,
    guardian_phone: form.guardian_phone.trim() || null,
    address: form.address.trim() || null,
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
