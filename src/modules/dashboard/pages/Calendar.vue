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
import {
  buildRoleCalendarConfig,
  EVENT_TYPE_OPTIONS,
} from '@/modules/dashboard/config/calendar.config'
import {
  addDays,
  addMonths,
  formatDate,
  sameDay,
  sameMonth,
  startOfWeek,
} from '@/modules/dashboard/composables/useCalendarDate'
import {
  buildMockEvents,
  getNextCalendarEventId,
  normalizeCalendarEvents,
} from '@/modules/dashboard/composables/useCalendarEvents'

const { t, language } = useLanguage()
const userStore = useUserStore()

// Role config
const roleCalendarConfig = computed(() => buildRoleCalendarConfig({ t }))
const currentRole = computed(() => normalizeRole(userStore.currentUser?.role))
const currentDomain = computed(() => getRoleAccess(currentRole.value)?.domain || DOMAINS.GLOBAL)
const calendarConfig = computed(
  () => roleCalendarConfig.value[currentDomain.value] || roleCalendarConfig.value[DOMAINS.GLOBAL],
)
const eventTypeOptions = computed(() => calendarConfig.value.eventTypes || EVENT_TYPE_OPTIONS)
const scheduleTargets = computed(() => calendarConfig.value.targets || [])

// Date state
const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const currentMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const locale = computed(() => (language.value === 'KH' ? 'km-KH' : 'en-US'))
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

// Event state
const initialEvents = buildMockEvents(today)
const events = ref(initialEvents)
const eventIdCounter = ref(getNextCalendarEventId(initialEvents))
const typeLookup = computed(() =>
  Object.fromEntries(eventTypeOptions.value.map((item) => [item.value, item])),
)
const teamLookup = computed(() =>
  Object.fromEntries(scheduleTargets.value.map((team) => [team.id, team])),
)
const normalizedEvents = computed(() =>
  normalizeCalendarEvents(events.value, {
    defaultContext: calendarConfig.value.defaultContext,
    teamLookup: teamLookup.value,
    typeLookup: typeLookup.value,
  }),
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

// Page labels
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
const nextEvent = computed(() => {
  const nowValue = new Date()

  return (
    normalizedEvents.value.find((event) => new Date(`${event.date}T${event.time}:00`) >= nowValue) ||
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
const deleteConfirmVisible = ref(false)
const pendingDeleteEventId = ref(null)
const pendingDeleteEvent = computed(
  () => events.value.find((event) => event.id === pendingDeleteEventId.value) || null,
)
const deleteConfirmMessage = computed(() => {
  const title = pendingDeleteEvent.value?.title || t('pages.calendar.nextEvent.none')
  return t('pages.calendar.deleteConfirmMessage', { title })
})

// Modal state
const dialogVisible = ref(false)
const dialogMode = ref('create')
const editingEventId = ref(null)
const teamSearchQuery = ref('')
const formState = ref(createEmptyForm(formatDate(today)))

function createEmptyForm(defaultDate = formatDate(today)) {
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

// Modal actions
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

// Delete actions
function deleteEvent() {
  if (editingEventId.value === null) return
  pendingDeleteEventId.value = editingEventId.value
  deleteConfirmVisible.value = true
}

function closeDeleteConfirm() {
  deleteConfirmVisible.value = false
  pendingDeleteEventId.value = null
}

function confirmDeleteEvent() {
  if (pendingDeleteEventId.value === null) return
  events.value = events.value.filter((event) => event.id !== pendingDeleteEventId.value)
  closeDeleteConfirm()
  closeModal()
}

// Month navigation
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
                <span class="calendar-highlight__separator">&bull;</span>
                {{ nextEvent.time }}
                <span class="calendar-highlight__separator">&bull;</span>
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
