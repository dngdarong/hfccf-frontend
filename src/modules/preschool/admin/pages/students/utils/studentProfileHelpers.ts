import { formatDate } from '@/utils/date'
import { STATUS_CLASSES, DEFAULT_FALLBACK } from '../constants/studentProfileConstants'

export function buildInfoCards(t: any, student: any, profileClasses: any[]) {
  return [
    {
      key: 'code',
      label: t('preschoolStudentProfilePage.cards.signature'),
      value: student?.publicId || student?.studentCode || DEFAULT_FALLBACK,
    },
    {
      key: 'gender',
      label: t('preschoolStudentProfilePage.cards.gender'),
      value: student?.gender ? t(`preschoolStudentInfoPage.options.${student.gender}`) : DEFAULT_FALLBACK,
    },
    {
      key: 'dob',
      label: t('preschoolStudentProfilePage.cards.dateOfBirth'),
      value: formatDate(student?.dateOfBirth) || student?.dateOfBirth || DEFAULT_FALLBACK,
    },
    {
      key: 'classes',
      label: t('preschoolStudentProfilePage.cards.classes'),
      value: String(student?.classesCount || profileClasses.length || 0),
    },
  ]
}

export function getStatusLabel(t: any, student: any): string {
  const key = String(student?.status || '').toLowerCase()
  return t(`preschoolStudentInfoPage.options.${key}`) || (student?.status || DEFAULT_FALLBACK)
}

export function getStatusClass(status: any): string {
  const key = String(status || '').toLowerCase()
  return STATUS_CLASSES[key] || STATUS_CLASSES.active
}

export function getStudentDisplayName(student: any): string {
  return student?.fullName || student?.name || DEFAULT_FALLBACK
}
