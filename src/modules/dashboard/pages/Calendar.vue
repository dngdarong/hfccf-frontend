<script setup>
import { computed, ref } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useLanguage } from '@/composables/useLanguage'
import { DOMAINS, getRoleAccess } from '@/constants/access'
import { normalizeRole } from '@/constants/roles'
import { useUserStore } from '@/store/userStore'
import AlertQuestion from '@/components/alerts/AlertQuestion.vue'
import CalendarCard from '@/modules/dashboard/components/calendar/CalendarCard.vue'
import CalendarLayoutShell from '@/modules/dashboard/components/calendar/CalendarLayoutShell.vue'
import CalendarPageHeader from '@/modules/dashboard/components/calendar/CalendarPageHeader.vue'
import EventFormModal from '@/modules/dashboard/components/calendar/EventFormModal.vue'
import UpcomingEventsCard from '@/modules/dashboard/components/calendar/UpcomingEventsCard.vue'

const { t, language } = useLanguage()
const userStore = useUserStore()

const EVENT_TYPE_OPTIONS = [
  { value: 'match', labelKey: 'match', color: '#00AEEF' },
  { value: 'training', labelKey: 'training', color: '#8DC63F' },
  { value: 'meeting', labelKey: 'meeting', color: '#FDC116' },
  { value: 'urgent', labelKey: 'urgent', color: '#ED1C24' },
]

const teams = [
  { id: 1, name: 'U-18 Falcons', group: 'Girls Football' },
  { id: 2, name: 'Rising Strikers', group: 'Boys Football' },
  { id: 3, name: 'Cyan Court', group: 'Basketball' },
  { id: 4, name: 'Lime Sprinters', group: 'Athletics' },
  { id: 5, name: 'Red Defenders', group: 'Volleyball' },
  { id: 6, name: 'Yellow Tactics', group: 'Staff & Coaches' },
]

const ROLE_CALENDAR_CONFIG = computed(() => ({
  [DOMAINS.SPORT]: {
    title: t('pages.calendar.roles.sport.title'),
    createTitle: t('pages.calendar.roles.sport.createTitle'),
    editTitle: t('pages.calendar.roles.sport.editTitle'),
    description: t('pages.calendar.roles.sport.description'),
    eventTypes: EVENT_TYPE_OPTIONS.map((item) => ({
      ...item,
      label: t(`pages.calendar.roles.sport.eventTypes.${item.labelKey}`),
    })),
    contextLabel: t('pages.calendar.roles.sport.contextLabel'),
    contextPlaceholder: t('pages.calendar.roles.sport.contextPlaceholder'),
    titlePlaceholder: t('pages.calendar.roles.sport.titlePlaceholder'),
    notePlaceholder: t('pages.calendar.roles.sport.notePlaceholder'),
    audienceLabel: t('pages.calendar.roles.sport.audienceLabel'),
    audienceSearchPlaceholder: t('pages.calendar.roles.sport.audienceSearchPlaceholder'),
    audienceEmptyLabel: t('pages.calendar.roles.sport.audienceEmptyLabel'),
    upcomingTitle: t('pages.calendar.roles.sport.upcomingTitle'),
    upcomingSubtitle: t('pages.calendar.roles.sport.upcomingSubtitle'),
    upcomingEmptyLabel: t('pages.calendar.roles.sport.upcomingEmptyLabel'),
    targetIcon: 'pi pi-users',
    contextIcon: 'pi pi-flag',
    targetSummaryLabel: t('pages.calendar.summary.teamsInvolved'),
    defaultContext: t('pages.calendar.roles.sport.defaultContext'),
    defaultType: 'match',
    targets: teams,
  },
  [DOMAINS.ENGLISH]: {
    title: t('pages.calendar.roles.english.title'),
    createTitle: t('pages.calendar.roles.english.createTitle'),
    editTitle: t('pages.calendar.roles.english.editTitle'),
    description: t('pages.calendar.roles.english.description'),
    eventTypes: [
      { value: 'training', label: t('pages.calendar.roles.english.eventTypes.training'), color: '#8DC63F' },
      { value: 'meeting', label: t('pages.calendar.roles.english.eventTypes.meeting'), color: '#FDC116' },
      { value: 'match', label: t('pages.calendar.roles.english.eventTypes.match'), color: '#00AEEF' },
      { value: 'urgent', label: t('pages.calendar.roles.english.eventTypes.urgent'), color: '#ED1C24' },
    ],
    contextLabel: t('pages.calendar.roles.english.contextLabel'),
    contextPlaceholder: t('pages.calendar.roles.english.contextPlaceholder'),
    titlePlaceholder: t('pages.calendar.roles.english.titlePlaceholder'),
    notePlaceholder: t('pages.calendar.roles.english.notePlaceholder'),
    audienceLabel: t('pages.calendar.roles.english.audienceLabel'),
    audienceSearchPlaceholder: t('pages.calendar.roles.english.audienceSearchPlaceholder'),
    audienceEmptyLabel: t('pages.calendar.roles.english.audienceEmptyLabel'),
    upcomingTitle: t('pages.calendar.roles.english.upcomingTitle'),
    upcomingSubtitle: t('pages.calendar.roles.english.upcomingSubtitle'),
    upcomingEmptyLabel: t('pages.calendar.roles.english.upcomingEmptyLabel'),
    targetIcon: 'pi pi-book',
    contextIcon: 'pi pi-building',
    targetSummaryLabel: t('pages.calendar.summary.teamsInvolved'),
    defaultContext: t('pages.calendar.roles.english.defaultContext'),
    defaultType: 'training',
    targets: [
      { id: 101, name: 'English Level 1', group: 'Morning class' },
      { id: 102, name: 'English Level 2', group: 'Afternoon class' },
      { id: 103, name: 'English Level 3', group: 'Exam preparation' },
      { id: 104, name: 'English Teachers', group: 'Staff' },
    ],
  },
  [DOMAINS.PRESCHOOL]: {
    title: t('pages.calendar.roles.preschool.title'),
    createTitle: t('pages.calendar.roles.preschool.createTitle'),
    editTitle: t('pages.calendar.roles.preschool.editTitle'),
    description: t('pages.calendar.roles.preschool.description'),
    eventTypes: [
      { value: 'training', label: t('pages.calendar.roles.preschool.eventTypes.training'), color: '#8DC63F' },
      { value: 'meeting', label: t('pages.calendar.roles.preschool.eventTypes.meeting'), color: '#FDC116' },
      { value: 'match', label: t('pages.calendar.roles.preschool.eventTypes.match'), color: '#00AEEF' },
      { value: 'urgent', label: t('pages.calendar.roles.preschool.eventTypes.urgent'), color: '#ED1C24' },
    ],
    contextLabel: t('pages.calendar.roles.preschool.contextLabel'),
    contextPlaceholder: t('pages.calendar.roles.preschool.contextPlaceholder'),
    titlePlaceholder: t('pages.calendar.roles.preschool.titlePlaceholder'),
    notePlaceholder: t('pages.calendar.roles.preschool.notePlaceholder'),
    audienceLabel: t('pages.calendar.roles.preschool.audienceLabel'),
    audienceSearchPlaceholder: t('pages.calendar.roles.preschool.audienceSearchPlaceholder'),
    audienceEmptyLabel: t('pages.calendar.roles.preschool.audienceEmptyLabel'),
    upcomingTitle: t('pages.calendar.roles.preschool.upcomingTitle'),
    upcomingSubtitle: t('pages.calendar.roles.preschool.upcomingSubtitle'),
    upcomingEmptyLabel: t('pages.calendar.roles.preschool.upcomingEmptyLabel'),
    targetIcon: 'pi pi-home',
    contextIcon: 'pi pi-building',
    targetSummaryLabel: t('pages.calendar.summary.teamsInvolved'),
    defaultContext: t('pages.calendar.roles.preschool.defaultContext'),
    defaultType: 'training',
    targets: [
      { id: 201, name: 'Nursery A', group: 'Preschool' },
      { id: 202, name: 'Nursery B', group: 'Preschool' },
      { id: 203, name: 'Kindergarten', group: 'Preschool' },
      { id: 204, name: 'Preschool Teachers', group: 'Staff' },
    ],
  },
  [DOMAINS.SCHOLARSHIP]: {
    title: t('pages.calendar.roles.scholarship.title'),
    createTitle: t('pages.calendar.roles.scholarship.createTitle'),
    editTitle: t('pages.calendar.roles.scholarship.editTitle'),
    description: t('pages.calendar.roles.scholarship.description'),
    eventTypes: [
      { value: 'meeting', label: t('pages.calendar.roles.scholarship.eventTypes.meeting'), color: '#FDC116' },
      { value: 'match', label: t('pages.calendar.roles.scholarship.eventTypes.match'), color: '#00AEEF' },
      { value: 'training', label: t('pages.calendar.roles.scholarship.eventTypes.training'), color: '#8DC63F' },
      { value: 'urgent', label: t('pages.calendar.roles.scholarship.eventTypes.urgent'), color: '#ED1C24' },
    ],
    contextLabel: t('pages.calendar.roles.scholarship.contextLabel'),
    contextPlaceholder: t('pages.calendar.roles.scholarship.contextPlaceholder'),
    titlePlaceholder: t('pages.calendar.roles.scholarship.titlePlaceholder'),
    notePlaceholder: t('pages.calendar.roles.scholarship.notePlaceholder'),
    audienceLabel: t('pages.calendar.roles.scholarship.audienceLabel'),
    audienceSearchPlaceholder: t('pages.calendar.roles.scholarship.audienceSearchPlaceholder'),
    audienceEmptyLabel: t('pages.calendar.roles.scholarship.audienceEmptyLabel'),
    upcomingTitle: t('pages.calendar.roles.scholarship.upcomingTitle'),
    upcomingSubtitle: t('pages.calendar.roles.scholarship.upcomingSubtitle'),
    upcomingEmptyLabel: t('pages.calendar.roles.scholarship.upcomingEmptyLabel'),
    targetIcon: 'pi pi-users',
    contextIcon: 'pi pi-id-card',
    targetSummaryLabel: t('pages.calendar.summary.teamsInvolved'),
    defaultContext: t('pages.calendar.roles.scholarship.defaultContext'),
    defaultType: 'meeting',
    targets: [
      { id: 301, name: 'New Applicants', group: '2026 cycle' },
      { id: 302, name: 'Shortlisted Students', group: 'Review stage' },
      { id: 303, name: 'Current Scholars', group: 'Active support' },
      { id: 304, name: 'Scholarship Staff', group: 'Staff' },
    ],
  },
  [DOMAINS.GLOBAL]: {
    title: t('pages.calendar.roles.global.title'),
    createTitle: t('pages.calendar.roles.global.createTitle'),
    editTitle: t('pages.calendar.roles.global.editTitle'),
    description: t('pages.calendar.roles.global.description'),
    eventTypes: [
      { value: 'meeting', label: t('pages.calendar.roles.global.eventTypes.meeting'), color: '#FDC116' },
      { value: 'training', label: t('pages.calendar.roles.global.eventTypes.training'), color: '#8DC63F' },
      { value: 'match', label: t('pages.calendar.roles.global.eventTypes.match'), color: '#00AEEF' },
      { value: 'urgent', label: t('pages.calendar.roles.global.eventTypes.urgent'), color: '#ED1C24' },
    ],
    contextLabel: t('pages.calendar.roles.global.contextLabel'),
    contextPlaceholder: t('pages.calendar.roles.global.contextPlaceholder'),
    titlePlaceholder: t('pages.calendar.roles.global.titlePlaceholder'),
    notePlaceholder: t('pages.calendar.roles.global.notePlaceholder'),
    audienceLabel: t('pages.calendar.roles.global.audienceLabel'),
    audienceSearchPlaceholder: t('pages.calendar.roles.global.audienceSearchPlaceholder'),
    audienceEmptyLabel: t('pages.calendar.roles.global.audienceEmptyLabel'),
    upcomingTitle: t('pages.calendar.roles.global.upcomingTitle'),
    upcomingSubtitle: t('pages.calendar.roles.global.upcomingSubtitle'),
    upcomingEmptyLabel: t('pages.calendar.roles.global.upcomingEmptyLabel'),
    targetIcon: 'pi pi-sitemap',
    contextIcon: 'pi pi-briefcase',
    targetSummaryLabel: t('pages.calendar.summary.teamsInvolved'),
    defaultContext: t('pages.calendar.roles.global.defaultContext'),
    defaultType: 'meeting',
    defaultTargetIds: [400],
    targets: [
      { id: 400, name: 'All Programs', group: 'Organization-wide' },
      { id: 401, name: 'English Program', group: 'Education' },
      { id: 402, name: 'Preschool Program', group: 'Education' },
      { id: 403, name: 'Scholarship Program', group: 'Education' },
      { id: 404, name: 'Sport Program', group: 'Athletics' },
      { id: 405, name: 'Operations Team', group: 'Administration' },
    ],
  },
}))

const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const eventIdCounter = ref(7)
const events = ref(buildMockEvents(today))
const dialogVisible = ref(false)
const dialogMode = ref('create')
const editingEventId = ref(null)
const deleteConfirmVisible = ref(false)
const pendingDeleteEventId = ref(null)
const teamSearchQuery = ref('')

const currentRole = computed(() => normalizeRole(userStore.currentUser?.role))
const currentDomain = computed(() => getRoleAccess(currentRole.value)?.domain || DOMAINS.SPORT)
const calendarConfig = computed(
  () => ROLE_CALENDAR_CONFIG.value[currentDomain.value] || ROLE_CALENDAR_CONFIG.value[DOMAINS.SPORT],
)
const eventTypeOptions = computed(() => calendarConfig.value.eventTypes)
const scheduleTargets = computed(() => calendarConfig.value.targets)
const formState = ref(createEmptyForm(formatDate(today)))

const typeLookup = computed(() =>
  Object.fromEntries(eventTypeOptions.value.map((item) => [item.value, item])),
)

const teamLookup = computed(() => Object.fromEntries(scheduleTargets.value.map((team) => [team.id, team])))

const locale = computed(() => (language.value === 'KH' ? 'km-KH' : 'en-US'))
const pageTitle = computed(() => t('pages.calendar.pageTitle'))
const pageSubtitle = computed(() => calendarConfig.value.description)
const addEventLabel = computed(() => t('pages.calendar.addEvent'))
const upcomingTitle = computed(() => calendarConfig.value.upcomingTitle)
const upcomingSubtitle = computed(() => calendarConfig.value.upcomingSubtitle)
const highlightEyebrow = computed(() => t('pages.calendar.highlight.monthSnapshot'))
const highlightSubtitle = computed(() => t('pages.calendar.highlight.subtitle'))
const nextEventLabel = computed(() => t('pages.calendar.highlight.nextEvent'))

const plannerLabel = computed(() => t('pages.calendar.planner'))
const timelineLabel = computed(() => t('pages.calendar.timeline'))
const monthlyViewLabel = computed(() => t('pages.calendar.monthlyView'))
const todayLabel = computed(() => t('pages.calendar.today'))
const prevMonthLabel = computed(() => t('pages.calendar.previousMonth'))
const nextMonthLabel = computed(() => t('pages.calendar.nextMonth'))

const updateLabel = computed(() => t('pages.calendar.update'))
const createLabel = computed(() => t('pages.calendar.create'))
const saveChangesLabel = computed(() => t('pages.calendar.saveChanges'))
const saveEventLabel = computed(() => t('pages.calendar.saveEvent'))

const scheduleForLabel = computed(() => t('pages.calendar.scheduleFor'))
const eventTypeLabel = computed(() => t('pages.calendar.eventType'))
const timeLabel = computed(() => t('pages.calendar.time'))
const titleLabel = computed(() => t('pages.calendar.title'))
const dateLabel = computed(() => t('pages.calendar.date'))
const optionalCommentLabel = computed(() => t('pages.calendar.optionalComment'))
const selectEventTypeLabel = computed(() => t('pages.calendar.selectEventType'))

const monthLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }).format(currentMonth.value),
)

const weekdayLabels = computed(() => {
  const labels = []
  const monday = new Date(2026, 0, 5)

  for (let index = 0; index < 7; index += 1) {
    labels.push(
      new Intl.DateTimeFormat(locale.value, { weekday: 'short' })
        .format(addDays(monday, index))
        .toUpperCase(),
    )
  }

  return labels
})

const normalizedEvents = computed(() =>
  [...events.value]
    .map((event) => {
      const meta = typeLookup.value[event.type] || typeLookup.value.urgent
      const selectedTeams = event.teamIds.map((teamId) => teamLookup.value[teamId]).filter(Boolean)
      const teamLabel =
        selectedTeams.length > 1
          ? `${selectedTeams[0].name} +${selectedTeams.length - 1}`
          : selectedTeams[0]?.name || calendarConfig.value.defaultContext

      return {
        ...event,
        typeLabel: meta.label,
        typeColor: meta.color,
        teamLabel,
        startsAt: new Date(`${event.date}T${event.time || '00:00'}:00`),
      }
    })
    .sort((left, right) => left.startsAt - right.startsAt),
)

const calendarDays = computed(() => {
  const monthStart = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth(), 1)
  const gridStart = startOfWeek(monthStart)

  return Array.from({ length: 42 }, (_, index) => {
    const dateValue = addDays(gridStart, index)
    const isoDate = formatDate(dateValue)

    return {
      key: `${isoDate}-${index}`,
      isoDate,
      dayNumber: dateValue.getDate(),
      inCurrentMonth: sameMonth(dateValue, currentMonth.value),
      isToday: sameDay(dateValue, today),
      events: normalizedEvents.value.filter((event) => event.date === isoDate),
    }
  })
})

const upcomingEvents = computed(() =>
  normalizedEvents.value.filter((event) => sameMonth(new Date(`${event.date}T00:00:00`), currentMonth.value)),
)

const legendItems = computed(() =>
  eventTypeOptions.value.map((item) => ({
    label: item.label,
    color: item.color,
  })),
)

const monthEvents = computed(() =>
  normalizedEvents.value.filter((event) => sameMonth(new Date(`${event.date}T00:00:00`), currentMonth.value)),
)

const summaryCards = computed(() => {
  const urgentCount = monthEvents.value.filter((event) => event.type === 'urgent').length
  const teamCount = new Set(monthEvents.value.flatMap((event) => event.teamIds)).size
  const matchCount = monthEvents.value.filter((event) => event.type === 'match').length

  return [
    {
      key: 'events',
      label: t('pages.calendar.summary.monthlyEvents'),
      value: monthEvents.value.length,
      tone: 'cyan',
      icon: 'pi pi-calendar',
    },
    {
      key: 'matches',
      label: t('pages.calendar.summary.matches'),
      value: matchCount,
      tone: 'lime',
      icon: 'pi pi-flag',
    },
    {
      key: 'teams',
      label: calendarConfig.value.targetSummaryLabel,
      value: teamCount,
      tone: 'yellow',
      icon: calendarConfig.value.targetIcon,
    },
    {
      key: 'urgent',
      label: t('pages.calendar.summary.urgentItems'),
      value: urgentCount,
      tone: 'red',
      icon: 'pi pi-bolt',
    },
  ]
})

const nextEvent = computed(() => {
  const now = new Date()
  return (
    normalizedEvents.value.find((event) => new Date(`${event.date}T${event.time}:00`) >= now) ||
    normalizedEvents.value[0] ||
    null
  )
})

const nextEventDateLabel = computed(() => {
  if (!nextEvent.value) return t('pages.calendar.noScheduledEvents')

  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${nextEvent.value.date}T00:00:00`))
})

const pendingDeleteEvent = computed(() =>
  events.value.find((event) => event.id === pendingDeleteEventId.value) || null,
)

const deleteConfirmMessage = computed(() => {
  const title = pendingDeleteEvent.value?.title || t('pages.calendar.nextEvent.none')
  return t('pages.calendar.deleteConfirmMessage', { title })
})

function createEmptyForm(defaultDate) {
  return {
    type: calendarConfig.value?.defaultType || 'match',
    comment: '',
    teamIds: [...(calendarConfig.value?.defaultTargetIds || [])],
    title: '',
    tournament: '',
    date: defaultDate,
    time: '09:00',
  }
}

function buildMockEvents(baseDate) {
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

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function formatDate(dateValue) {
  const year = dateValue.getFullYear()
  const month = String(dateValue.getMonth() + 1).padStart(2, '0')
  const day = String(dateValue.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(dateValue, amount) {
  const next = new Date(dateValue)
  next.setDate(next.getDate() + amount)
  return next
}

function addMonths(dateValue, amount) {
  return new Date(dateValue.getFullYear(), dateValue.getMonth() + amount, 1)
}

function startOfWeek(dateValue) {
  const next = new Date(dateValue)
  const day = next.getDay()
  const diff = day === 0 ? -6 : 1 - day
  next.setDate(next.getDate() + diff)
  next.setHours(0, 0, 0, 0)
  return next
}

function sameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

function sameMonth(left, right) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth()
}

function openCreateModal(date = formatDate(today)) {
  dialogMode.value = 'create'
  editingEventId.value = null
  teamSearchQuery.value = ''
  formState.value = createEmptyForm(date)
  dialogVisible.value = true
}

function openEditModal(eventItem) {
  dialogMode.value = 'edit'
  editingEventId.value = eventItem.id
  teamSearchQuery.value = ''
  formState.value = {
    type: eventItem.type,
    comment: eventItem.comment || '',
    teamIds: [...eventItem.teamIds],
    title: eventItem.title,
    tournament: eventItem.tournament,
    date: eventItem.date,
    time: eventItem.time,
  }
  dialogVisible.value = true
}

function closeModal() {
  dialogVisible.value = false
  editingEventId.value = null
  teamSearchQuery.value = ''
}

function closeDeleteConfirm() {
  deleteConfirmVisible.value = false
  pendingDeleteEventId.value = null
}

function updateFormField({ field, value }) {
  formState.value = {
    ...formState.value,
    [field]: value,
  }
}

function updateSelectedTeamIds(teamIds) {
  formState.value = {
    ...formState.value,
    teamIds,
  }
}

function updateDialogVisible(value) {
  dialogVisible.value = value
}

function updateTeamSearchQuery(value) {
  teamSearchQuery.value = value
}

function saveEvent() {
  const payload = {
    ...formState.value,
    title: formState.value.title.trim() || t('pages.calendar.untitledEvent'),
    tournament: formState.value.tournament.trim() || calendarConfig.value.defaultContext,
    comment: formState.value.comment.trim(),
    time: formState.value.time || '09:00',
  }

  if (editingEventId.value !== null) {
    events.value = events.value.map((event) =>
      event.id === editingEventId.value ? { ...event, ...payload } : event,
    )
  } else {
    events.value = [
      ...events.value,
      {
        id: eventIdCounter.value,
        ...payload,
      },
    ]
    eventIdCounter.value += 1
  }

  closeModal()
}

function deleteEvent() {
  if (editingEventId.value === null) return
  pendingDeleteEventId.value = editingEventId.value
  deleteConfirmVisible.value = true
}

function confirmDeleteEvent() {
  if (pendingDeleteEventId.value === null) return
  events.value = events.value.filter((event) => event.id !== pendingDeleteEventId.value)
  closeDeleteConfirm()
  closeModal()
}

function goToPreviousMonth() {
  currentMonth.value = addMonths(currentMonth.value, -1)
}

function goToNextMonth() {
  currentMonth.value = addMonths(currentMonth.value, 1)
}

function goToToday() {
  currentMonth.value = new Date(today.getFullYear(), today.getMonth(), 1)
}
</script>

<template>
  <MainLayout>
    <CalendarLayoutShell>
      <template #header>
        <CalendarPageHeader
          :title="pageTitle"
          :subtitle="pageSubtitle"
          :action-label="addEventLabel"
          :eyebrow-label="plannerLabel"
          @action="openCreateModal()"
        />
      </template>

      <section class="calendar-dashboard">
        <article class="calendar-highlight">
          <div class="calendar-highlight__copy">
            <p class="calendar-highlight__eyebrow">{{ highlightEyebrow }}</p>
            <h2 class="calendar-highlight__title">{{ monthLabel }}</h2>
            <p class="calendar-highlight__subtitle">{{ highlightSubtitle }}</p>
          </div>

          <div class="calendar-highlight__next">
            <span class="calendar-highlight__next-label">{{ nextEventLabel }}</span>
            <strong class="calendar-highlight__next-title">
              {{ nextEvent?.title || t('pages.calendar.nextEvent.none') }}
            </strong>
            <span class="calendar-highlight__next-meta">
              {{ nextEventDateLabel }}
              <template v-if="nextEvent">
                <span class="calendar-highlight__separator">•</span>
                {{ nextEvent.time }}
                <span class="calendar-highlight__separator">•</span>
                {{ nextEvent.teamLabel }}
              </template>
            </span>
          </div>
        </article>

        <div class="calendar-stats">
          <article
            v-for="card in summaryCards"
            :key="card.key"
            class="calendar-stats__card"
            :class="`calendar-stats__card--${card.tone}`"
          >
            <span class="calendar-stats__icon">
              <i :class="card.icon" aria-hidden="true" />
            </span>
            <div>
              <p class="calendar-stats__label">{{ card.label }}</p>
              <p class="calendar-stats__value">{{ card.value }}</p>
            </div>
          </article>
        </div>

        <div class="calendar-dashboard__stack">
          <CalendarCard
            :month-label="monthLabel"
            :weekdays="weekdayLabels"
            :days="calendarDays"
            :legend-items="legendItems"
            :today-label="todayLabel"
            :prev-label="prevMonthLabel"
            :next-label="nextMonthLabel"
            :monthly-view-label="monthlyViewLabel"
            @previous="goToPreviousMonth"
            @next="goToNextMonth"
            @today="goToToday"
            @add-event="openCreateModal"
            @select-event="openEditModal"
          />

          <UpcomingEventsCard
            :title="upcomingTitle"
            :subtitle="upcomingSubtitle"
            :events="upcomingEvents"
            :locale="locale"
            :eyebrow-label="timelineLabel"
            :context-icon="calendarConfig.contextIcon"
            :context-label="calendarConfig.contextLabel"
            :empty-label="calendarConfig.upcomingEmptyLabel"
            :target-icon="calendarConfig.targetIcon"
            :target-label="calendarConfig.audienceLabel"
            @select-event="openEditModal"
          />
        </div>
      </section>

      <EventFormModal
        :visible="dialogVisible"
        :mode="dialogMode"
        :form="formState"
        :event-types="eventTypeOptions"
        :teams="scheduleTargets"
        :team-query="teamSearchQuery"
        :context-label="calendarConfig.contextLabel"
        :context-placeholder="calendarConfig.contextPlaceholder"
        :create-title="calendarConfig.createTitle"
        :description="calendarConfig.description"
        :edit-title="calendarConfig.editTitle"
        :note-placeholder="calendarConfig.notePlaceholder"
        :role-title="calendarConfig.title"
        :target-empty-label="calendarConfig.audienceEmptyLabel"
        :target-label="calendarConfig.audienceLabel"
        :target-search-placeholder="calendarConfig.audienceSearchPlaceholder"
        :title-placeholder="calendarConfig.titlePlaceholder"
        :update-label="updateLabel"
        :create-label="createLabel"
        :save-changes-label="saveChangesLabel"
        :save-event-label="saveEventLabel"
        :cancel-label="t('common.cancel')"
        :delete-label="t('common.delete')"
        :schedule-for-label="scheduleForLabel"
        :event-type-label="eventTypeLabel"
        :time-label="timeLabel"
        :title-label="titleLabel"
        :date-label="dateLabel"
        :optional-comment-label="optionalCommentLabel"
        :select-event-type-label="selectEventTypeLabel"
        @update:visible="updateDialogVisible"
        @update-field="updateFormField"
        @update:team-query="updateTeamSearchQuery"
        @update:selected-team-ids="updateSelectedTeamIds"
        @cancel="closeModal"
        @save="saveEvent"
        @delete="deleteEvent"
      />

      <AlertQuestion
        :show="deleteConfirmVisible"
        :title="t('pages.calendar.deleteConfirmTitle')"
        :message="deleteConfirmMessage"
        :confirm-text="t('common.delete')"
        :cancel-text="t('common.cancel')"
        type="danger"
        @confirm="confirmDeleteEvent"
        @cancel="closeDeleteConfirm"
      />
    </CalendarLayoutShell>
  </MainLayout>
</template>

<style scoped>
.calendar-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.calendar-highlight {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.85fr);
  gap: 1rem;
  border: 1px solid #d9e5ec;
  border-radius: 1.4rem;
  padding: 1.15rem 1.2rem;
  background:
    radial-gradient(circle at top right, rgba(0, 174, 239, 0.12), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #f7fbfd 100%);
  box-shadow: 0 24px 38px -34px rgba(15, 23, 42, 0.24);
}

.calendar-highlight__eyebrow {
  margin: 0;
  color: #00aeef;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.calendar-highlight__title {
  margin: 0.45rem 0 0;
  color: #1d1d1b;
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  font-weight: 900;
  line-height: 1.06;
}

.calendar-highlight__subtitle {
  margin: 0.6rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.65;
  max-width: 40rem;
}

.calendar-highlight__next {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.28rem;
  border: 1px solid #dce8ef;
  border-radius: 1.15rem;
  padding: 1rem 1.05rem;
  background: rgba(255, 255, 255, 0.82);
}

.calendar-highlight__next-label {
  color: #00aeef;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.calendar-highlight__next-title {
  color: #1d1d1b;
  font-size: 1rem;
  font-weight: 900;
}

.calendar-highlight__next-meta {
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.55;
}

.calendar-highlight__separator {
  margin-inline: 0.35rem;
  color: #c4cdd6;
}

.calendar-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
}

.calendar-stats__card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  border: 1px solid #dce5ec;
  border-radius: 1.15rem;
  padding: 0.95rem 1rem;
  background: #fff;
  box-shadow: 0 22px 34px -36px rgba(15, 23, 42, 0.35);
}

.calendar-stats__icon {
  width: 2.6rem;
  height: 2.6rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.95rem;
  font-size: 1rem;
}

.calendar-stats__card--cyan .calendar-stats__icon {
  background: #e9f9ff;
  color: #0089bc;
}

.calendar-stats__card--lime .calendar-stats__icon {
  background: #f0f8e2;
  color: #669a24;
}

.calendar-stats__card--yellow .calendar-stats__icon {
  background: #fff8de;
  color: #8c6500;
}

.calendar-stats__card--red .calendar-stats__icon {
  background: #ffeaec;
  color: #c71f1f;
}

.calendar-stats__label {
  margin: 0;
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 700;
}

.calendar-stats__value {
  margin: 0.18rem 0 0;
  color: #1d1d1b;
  font-size: 1.3rem;
  font-weight: 900;
  line-height: 1;
}

.calendar-dashboard__stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

@media (max-width: 960px) {
  .calendar-highlight,
  .calendar-stats {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .calendar-highlight,
  .calendar-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .calendar-highlight {
    padding: 1rem;
  }

  .calendar-stats__card {
    padding: 0.85rem 0.9rem;
  }
}
</style>
