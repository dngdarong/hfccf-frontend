import { STATUS_OPTIONS } from '../constants/addPlayerConstants'

export function playerStatusLabel(status: string | null | undefined, t: any, te: any): string {
  const key = `sportPlayerInformation.status.${String(status || '').replace(/[\s-]+/g, '_').toLowerCase()}`
  return te(key) ? t(key) : String(status || '')
}

export function validate(form: any, t: any): string {
  if (!form.name.trim()) return t('sportAddPlayer.validation.nameRequired')
  if (!form.team.trim()) return t('sportAddPlayer.validation.teamRequired')
  if (!form.division.trim()) return t('sportAddPlayer.validation.divisionRequired')
  if (!form.status) return t('sportAddPlayer.validation.statusRequired')
  if (Number(form.matchesPlayed) < 0) return t('sportAddPlayer.validation.statsInvalid')
  if (Number(form.goalsScored) < 0) return t('sportAddPlayer.validation.statsInvalid')
  if (Number(form.goalsScored) > Number(form.matchesPlayed)) return t('sportAddPlayer.validation.goalsTooHigh')
  return ''
}

export function getFormPayload(form: any): Record<string, any> {
  return {
    name: form.name,
    phone: form.phone,
    gender: form.gender,
    team: form.team,
    division: form.division,
    jerseyNumber: form.jerseyNumber,
    age: form.age,
    status: form.status,
    matchesPlayed: form.matchesPlayed,
    goalsScored: form.goalsScored,
    photo: form.profileImage,
    heightCm: form.heightCm,
    weightKg: form.weightKg,
    preferredFoot: form.preferredFoot,
    bloodType: form.bloodType,
    village: form.village,
    commune: form.commune,
    district: form.district,
    province: form.province,
    currentSchool: form.currentSchool,
    gradeYear: form.gradeYear,
    primaryPosition: form.primaryPosition,
    registrationStatus: form.registrationStatus,
  }
}

export function initializeFormFromPlayer(found: any, form: any) {
  form.name = String(found.name || '')
  form.phone = String(found.phone || '')
  form.gender = String(found.gender || '')
  form.team = String(found.team || '')
  form.division = String(found.division || '')
  form.jerseyNumber = found.jerseyNumber ?? null
  form.age = found.age ?? null
  form.status = String(found.status || STATUS_OPTIONS[0])
  form.matchesPlayed = Number(found.matchesPlayed ?? 0)
  form.goalsScored = Number(found.goalsScored ?? 0)
  form.heightCm = found.heightCm ?? null
  form.weightKg = found.weightKg ?? null
  form.preferredFoot = String(found.preferredFoot || '')
  form.bloodType = String(found.bloodType || '')
  form.village = String(found.village || '')
  form.commune = String(found.commune || '')
  form.district = String(found.district || '')
  form.province = String(found.province || '')
  form.currentSchool = String(found.currentSchool || '')
  form.gradeYear = String(found.gradeYear || '')
  form.primaryPosition = String(found.primaryPosition || found.position || '')
  form.registrationStatus = String(found.registrationStatus || STATUS_OPTIONS[0])
}

export function getProfileImagePreview(found: any): string {
  return String(found.photo || found.avatar || '').trim()
}
