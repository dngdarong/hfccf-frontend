import { formatDate } from '@/utils/date'

export function formatTournamentDateRange(tournament, language = 'EN') {
  const start = String(tournament?.startAt || '').trim()
  const end = String(tournament?.endAt || '').trim()

  if (!start && !end) return '-'

  const locale = language === 'KH' ? 'km-KH' : 'en-US'
  const startDate = new Date(start)
  const endDate = new Date(end)

  if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime())) {
    const startMonth = startDate.toLocaleDateString(locale, { month: 'short' })
    const endMonth = endDate.toLocaleDateString(locale, { month: 'short' })
    const year = endDate.toLocaleDateString(locale, { year: 'numeric' })

    if (startMonth === endMonth && startDate.getFullYear() === endDate.getFullYear()) {
      return `${startMonth} ${startDate.getDate()}–${endDate.getDate()}, ${year}`
    }
  }

  return `${start ? formatDate(start) : '—'} → ${end ? formatDate(end) : '—'}`
}

export function getTournamentTeamCount(tournament) {
  const registered = Number(tournament?.statistics?.registeredTeams || 0)
  const total = Number(tournament?.statistics?.totalTeams || tournament?.teams?.length || 0)

  if (!total) return String(registered || 0)

  return `${registered}/${total}`
}
