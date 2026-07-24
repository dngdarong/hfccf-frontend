export function teamStatusLabel(status: string | null | undefined, t: any): string {
  const normalized = String(status || '').trim()

  if (!normalized) return '-'

  const key = `common.status.${normalized.replace(/[\s-]+/g, '_').toLowerCase()}`
  const translated = t(key)
  return translated !== key ? translated : String(status || '')
}

function normalizeText(value: unknown): string {
  return String(value || '').trim()
}

function normalizePlayerIds(value: unknown): Array<string | number> {
  if (!Array.isArray(value)) return []
  return value.filter((item) => item !== null && item !== undefined && String(item).trim() !== '')
}

export function validateForm(form: any, t: any): string {
  const name = normalizeText(form.name)
  const division = normalizeText(form.division)
  const coachDisplayName = normalizeText(form.coachDisplayName || form.coach)
  const captain = normalizeText(form.captain)
  const venue = normalizeText(form.venue)

  if (!name) return t('sportAddTeam.validation.nameRequired')
  if (name.length > 191) return t('sportAddTeam.validation.nameTooLong')
  if (division.length > 100) return t('sportAddTeam.validation.divisionTooLong')
  if (coachDisplayName.length > 191) return t('sportAddTeam.validation.coachTooLong')
  if (captain.length > 191) return t('sportAddTeam.validation.captainTooLong')
  if (venue.length > 191) return t('sportAddTeam.validation.venueTooLong')
  if (form.matches < 0) return t('sportAddTeam.validation.recordInvalid')
  if (!form.status) return t('sportAddTeam.validation.statusRequired')
  if (form.wins < 0 || form.draws < 0 || form.losses < 0) {
    return t('sportAddTeam.validation.recordInvalid')
  }
  return ''
}

export function getFormPayload(form: any, options: Record<string, any> = {}): Record<string, any> {
  const selectedCoach = options.selectedCoach || null
  const selectedDivision = options.selectedDivision || null
  const selectedPlayerIds = normalizePlayerIds(options.selectedPlayerIds ?? form.selectedPlayerIds ?? form.playerIds)

  return {
    name: normalizeText(form.name),
    division: normalizeText(form.division) || null,
    division_id: selectedDivision?.id ?? null,
    coach_user_id: selectedCoach?.id ?? null,
    coach_display_name: normalizeText(form.coachDisplayName || selectedCoach?.fullName || ''),
    captain_name: normalizeText(form.captain) || null,
    players_count: selectedPlayerIds.length,
    matches_count: form.matches,
    player_ids: selectedPlayerIds,
    venue: normalizeText(form.venue) || null,
    status: form.status,
    wins: form.wins,
    draws: form.draws,
    losses: form.losses,
    logo: form.logo,
  }
}

export function initializeFormFromTeam(
  found: any,
  form: any,
  statusOptions: string[],
  divisionOptions: Array<{ label: string, value: string }>,
  coachOptions: Array<{ label: string, value: string }>,
) {
  form.name = found.name || ''
  form.division = found.division || divisionOptions[0]?.value || ''
  form.coach = found.coachUserId || coachOptions.find((option) => option.label === (found.coachDisplayName || found.coach || ''))?.value || ''
  form.coachDisplayName = found.coachDisplayName || found.coach || coachOptions.find((option) => option.value === form.coach)?.label || ''
  form.captain = found.captainName || found.captain || ''
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
