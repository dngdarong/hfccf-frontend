export function teamStatusLabel(status: string | null | undefined, t: any): string {
  const normalized = String(status || '').trim()

  if (!normalized) return '-'

  const key = `common.status.${normalized.replace(/[\s-]+/g, '_').toLowerCase()}`
  const translated = t(key)
  return translated !== key ? translated : String(status || '')
}

export function validateForm(form: any, t: any): string {
  if (!form.name.trim()) return t('sportAddTeam.validation.nameRequired')
  if (!form.division.trim()) return t('sportAddTeam.validation.divisionRequired')
  if (!form.coach.trim()) return t('sportAddTeam.validation.coachRequired')
  if (!form.captain.trim()) return t('sportAddTeam.validation.captainRequired')
  if (form.players <= 0) return t('sportAddTeam.validation.playersRequired')
  if (form.matches < 0) return t('sportAddTeam.validation.recordInvalid')
  if (!form.venue.trim()) return t('sportAddTeam.validation.venueRequired')
  if (!form.status) return t('sportAddTeam.validation.statusRequired')
  if (form.wins < 0 || form.draws < 0 || form.losses < 0) {
    return t('sportAddTeam.validation.recordInvalid')
  }
  return ''
}

export function getFormPayload(form: any): Record<string, any> {
  return {
    name: form.name,
    division: form.division,
    coach: form.coach,
    coach_display_name: form.coach,
    captain: form.captain,
    players: form.players,
    matches: form.matches,
    venue: form.venue,
    status: form.status,
    wins: form.wins,
    draws: form.draws,
    losses: form.losses,
    logo: form.logo,
  }
}

export function initializeFormFromTeam(found: any, form: any, statusOptions: string[], divisionOptions: string[]) {
  form.name = found.name || ''
  form.division = found.division || divisionOptions[0] || ''
  form.coach = found.coachDisplayName || found.coach || ''
  form.captain = found.captainName || found.captain || ''
  form.players = Number(found.playersCount ?? found.players ?? 0)
  form.matches = Number(found.matchesCount ?? found.matches ?? 0)
  form.venue = found.venue || ''

  const normalizedStatus = String(found.status || '')
  const matchedStatus = statusOptions.find(
    (status) => status.toLowerCase() === normalizedStatus.toLowerCase(),
  )
  form.status = matchedStatus || statusOptions[0]
  form.wins = Number(found.wins || 0)
  form.draws = Number(found.draws || 0)
  form.losses = Number(found.losses || 0)
  form.logo = null
}

export function getLogoPreview(found: any): string {
  return String(found.logo || '').trim()
}
