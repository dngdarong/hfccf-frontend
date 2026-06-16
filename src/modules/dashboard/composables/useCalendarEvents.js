import { daysInMonth, formatDate } from '@/modules/dashboard/composables/useCalendarDate'

// Calendar mock data stays in one place so the page can focus on orchestration.
export function buildMockEvents(baseDate) {
  const year = baseDate.getFullYear()
  const month = baseDate.getMonth()
  const currentDay = baseDate.getDate()

  return [
    {
      id: 1,
      type: 'training',
      title: 'Morning Conditioning Block',
      tournament: 'Youth Performance Camp',
      date: formatDate(new Date(year, month, Math.max(2, currentDay - 9))),
      time: '07:30',
      comment: 'Focus on sprint patterns and dynamic warm-up progressions.',
      teamIds: [4],
    },
    {
      id: 2,
      type: 'match',
      title: 'Falcons vs River Academy',
      tournament: 'EduSportPro Spring Cup',
      date: formatDate(new Date(year, month, Math.max(4, currentDay - 5))),
      time: '15:00',
      comment: 'Home fixture. Media check-in opens one hour before kickoff.',
      teamIds: [1],
    },
    {
      id: 3,
      type: 'meeting',
      title: 'Coach Strategy Review',
      tournament: 'Technical Department',
      date: formatDate(new Date(year, month, currentDay)),
      time: '10:15',
      comment: 'Review weekly player load and match preparation.',
      teamIds: [6],
    },
    {
      id: 4,
      type: 'urgent',
      title: 'Medical Clearance Follow-up',
      tournament: 'Player Welfare',
      date: formatDate(new Date(year, month, currentDay)),
      time: '16:30',
      comment: 'Confirm final roster availability before weekend fixtures.',
      teamIds: [1, 5],
    },
    {
      id: 5,
      type: 'training',
      title: 'Set Piece Training Session',
      tournament: 'Match Preparation',
      date: formatDate(new Date(year, month, Math.min(daysInMonth(year, month), currentDay + 3))),
      time: '08:45',
      comment: 'Shared session for defensive and attacking unit structure.',
      teamIds: [1, 2],
    },
    {
      id: 6,
      type: 'match',
      title: 'Community Showcase Match',
      tournament: 'EduSportPro Outreach Games',
      date: formatDate(new Date(year, month, Math.min(daysInMonth(year, month), currentDay + 8))),
      time: '17:30',
      comment: 'Cross-program exhibition with mixed team representation.',
      teamIds: [2, 3, 5],
    },
  ]
}

export function getNextCalendarEventId(events = []) {
  const highestId = Math.max(0, ...events.map((event) => Number(event?.id || 0)))
  return highestId + 1
}

export function normalizeCalendarEvents(events = [], { typeLookup, teamLookup, defaultContext }) {
  return [...events]
    .map((event) => {
      const meta = typeLookup[event.type] || typeLookup.urgent
      const selectedTeams = (Array.isArray(event.teamIds) ? event.teamIds : [])
        .map((teamId) => teamLookup[teamId])
        .filter(Boolean)
      const teamLabel =
        selectedTeams.length > 1
          ? `${selectedTeams[0].name} +${selectedTeams.length - 1}`
          : selectedTeams[0]?.name || defaultContext

      return {
        ...event,
        typeLabel: meta.label,
        typeColor: meta.color,
        teamLabel,
        startsAt: new Date(`${event.date}T${event.time || '00:00'}:00`),
      }
    })
    .sort((left, right) => left.startsAt - right.startsAt)
}
