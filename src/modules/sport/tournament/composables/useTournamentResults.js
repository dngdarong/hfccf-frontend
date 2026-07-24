import { computed, ref, watch } from 'vue'
import { useLanguage } from '@/composables/useLanguage'
import { calculateMatchScore } from '../services/calculateMatchScore'
import {
  createMatchEventDraft,
  createMatchEventId,
  normalizeEventType,
  normalizeMatchEvent,
  normalizeMatchEvents,
  normalizeText,
} from '../services/normalizeMatchEvents'
import { sortMatchTimeline } from '../services/sortMatchTimeline'
import { validateMatchEvents } from '../services/validateMatchEvents'
import { normalizeScoreValue } from '../services/calculateStandings'
import { addTournamentMatchEvent, updateTournamentResult } from '../api/tournamentApi'

const EVENT_TYPE_KEYS = [
  'goal',
  'assist',
  'yellow_card',
  'red_card',
  'own_goal',
  'penalty_goal',
  'penalty_miss',
  'substitution',
  'injury',
  'var_review',
  'note',
]

function normalizeMatchStatus(value) {
  const status = normalizeText(value).toLowerCase()
  return ['scheduled', 'live', 'completed', 'postponed', 'cancelled'].includes(status) ? status : 'scheduled'
}

function normalizeFixtureScore(score = {}) {
  return {
    home: normalizeScoreValue(score?.home),
    away: normalizeScoreValue(score?.away),
  }
}

function createDefaultEventDraft(fixture = null) {
  return createMatchEventDraft({
    type: 'goal',
    side: fixture?.homeTeamId ? 'home' : '',
    minute: 1,
    stoppageMinute: 0,
    teamId: fixture?.homeTeamId || '',
    teamName: fixture?.homeTeamName || '',
    matchId: fixture?.id || '',
  }, {
    matchId: fixture?.id || '',
    homeTeamId: fixture?.homeTeamId || '',
    awayTeamId: fixture?.awayTeamId || '',
  })
}

function createFixtureResultDraft(fixture = null) {
  const events = Array.isArray(fixture?.events)
    ? sortMatchTimeline(normalizeMatchEvents(fixture.events, fixture || {}), fixture || {})
    : []

  return {
    status: normalizeMatchStatus(fixture?.status),
    score: normalizeFixtureScore(fixture?.score),
    venue: normalizeText(fixture?.venue || ''),
    dateTime: normalizeText(fixture?.dateTime || ''),
    notes: normalizeText(fixture?.notes || ''),
    events,
  }
}

function buildEventTypeOptions(t) {
  return EVENT_TYPE_KEYS.map((value) => ({
    label: t(`sportTournament.results.eventTypes.${value}`),
    value,
  }))
}

function buildEventSideOptions(t) {
  return [
    { label: t('sportTournament.results.eventForm.sides.home'), value: 'home' },
    { label: t('sportTournament.results.eventForm.sides.away'), value: 'away' },
  ]
}

function buildEventTeamOptions(fixture = {}, t) {
  if (!fixture?.id) {
    return []
  }

  return [
    {
      label: fixture.homeTeamName || t('sportTournament.results.eventForm.defaultTeamHome'),
      value: fixture.homeTeamId || '',
    },
    {
      label: fixture.awayTeamName || t('sportTournament.results.eventForm.defaultTeamAway'),
      value: fixture.awayTeamId || '',
    },
  ].filter((option) => normalizeText(option.value))
}

export function useTournamentResults(tournament, actions = {}) {
  const { t } = useLanguage()
  const selectedFixtureId = ref('')
  const resultDraft = ref(createFixtureResultDraft())
  const eventDraft = ref(createDefaultEventDraft())
  const isSaving = ref(false)
  const isAddingEvent = ref(false)

  const fixtures = computed(() => {
    const source = Array.isArray(tournament?.value?.fixtures) ? tournament.value.fixtures : []

    return source.map((fixture) => {
      const normalizedEvents = sortMatchTimeline(
        normalizeMatchEvents(fixture?.events || [], fixture || {}),
        fixture || {},
      )
      const eventScore = calculateMatchScore({
        match: fixture,
        events: normalizedEvents,
      })

      return {
        ...fixture,
        status: normalizeMatchStatus(fixture?.status),
        score: normalizeFixtureScore(fixture?.score),
        events: normalizedEvents,
        eventScore,
      }
    })
  })

  const selectedFixture = computed(() =>
    fixtures.value.find((fixture) => fixture.id === selectedFixtureId.value) || fixtures.value[0] || null,
  )

  const statusOptions = computed(() => [
    { label: t('sportTournament.matchStatuses.scheduled'), value: 'scheduled' },
    { label: t('sportTournament.matchStatuses.live'), value: 'live' },
    { label: t('sportTournament.matchStatuses.completed'), value: 'completed' },
    { label: t('sportTournament.matchStatuses.postponed'), value: 'postponed' },
    { label: t('sportTournament.matchStatuses.cancelled'), value: 'cancelled' },
  ])

  const eventTypes = computed(() => buildEventTypeOptions(t))
  const eventSideOptions = computed(() => buildEventSideOptions(t))
  const eventTeamOptions = computed(() => buildEventTeamOptions(selectedFixture.value || {}, t))
  const eventTimeline = computed(() =>
    sortMatchTimeline(resultDraft.value.events, selectedFixture.value || {}),
  )
  const eventDraftValidation = computed(() =>
    validateMatchEvents({
      events: [eventDraft.value],
      context: {
        match: selectedFixture.value || {},
      },
    }),
  )

  watch(
    fixtures,
    (nextFixtures) => {
      if (!nextFixtures.length) {
        selectedFixtureId.value = ''
        resultDraft.value = createFixtureResultDraft()
        eventDraft.value = createDefaultEventDraft()
        return
      }

      if (!selectedFixtureId.value || !nextFixtures.some((fixture) => fixture.id === selectedFixtureId.value)) {
        selectedFixtureId.value = nextFixtures[0].id
      }
    },
    { immediate: true },
  )

  watch(
    selectedFixture,
    (nextFixture) => {
      resultDraft.value = createFixtureResultDraft(nextFixture)
      eventDraft.value = createDefaultEventDraft(nextFixture)
    },
    { immediate: true },
  )

  function selectFixture(fixtureId) {
    const normalizedId = normalizeText(fixtureId)
    if (!normalizedId) return

    selectedFixtureId.value = normalizedId
  }

  function updateDraft(patch = {}) {
    resultDraft.value = {
      ...resultDraft.value,
      ...patch,
      score: patch.score ? normalizeFixtureScore(patch.score) : resultDraft.value.score,
      events: Array.isArray(patch.events)
        ? sortMatchTimeline(normalizeMatchEvents(patch.events, selectedFixture.value || {}), selectedFixture.value || {})
        : resultDraft.value.events,
      status: patch.status ? normalizeMatchStatus(patch.status) : resultDraft.value.status,
    }
  }

  function setScore(home, away) {
    updateDraft({
      score: {
        home: normalizeScoreValue(home),
        away: normalizeScoreValue(away),
      },
    })
  }

  function setStatus(status) {
    updateDraft({ status })
  }

  function resetEventDraft(fixture = selectedFixture.value || null) {
    eventDraft.value = createDefaultEventDraft(fixture)
  }

  async function addEvent(event = eventDraft.value) {
    if (isAddingEvent.value) return null
    const currentFixture = selectedFixture.value
    if (!currentFixture?.id) {
      return null
    }

    const nextEvent = createMatchEventDraft(event, {
      matchId: currentFixture.id,
      homeTeamId: currentFixture.homeTeamId,
      awayTeamId: currentFixture.awayTeamId,
    })
    const validation = validateMatchEvents({
      events: [nextEvent],
      context: {
        match: currentFixture,
      },
    })

    if (!validation.valid) {
      return validation
    }

    if (typeof actions.reloadTournament !== 'function') return null

    isAddingEvent.value = true
    try {
      const response = await addTournamentMatchEvent(currentTournamentId(), currentFixture.id, {
        team_id: nextEvent.teamId,
        player_id: nextEvent.playerId || null,
        event_type: nextEvent.type || nextEvent.eventType,
        minute: nextEvent.minute,
        stoppage_minute: nextEvent.stoppageMinute || null,
        side: nextEvent.side || null,
        description: nextEvent.description || null,
        metadata: nextEvent.metadata || {},
      })
      await actions.reloadTournament()
      resetEventDraft(currentFixture)
      return response.event || nextEvent
    } finally {
      isAddingEvent.value = false
    }
  }

  function removeEvent(eventId) {
    const targetId = normalizeText(eventId)
    if (!targetId) return

    updateDraft({
      events: resultDraft.value.events.filter((event) => event.id !== targetId),
    })
  }

  async function saveResult() {
    if (isSaving.value) return null
    const currentTournament = tournament?.value || {}
    const currentFixture = selectedFixture.value

    if (typeof actions.reloadTournament !== 'function') {
      return null
    }

    if (!currentTournament?.id || !currentFixture?.id) {
      return null
    }

    isSaving.value = true
    try {
      const updated = await updateTournamentResult(currentTournament.id, currentFixture.id, {
        homeScore: resultDraft.value.score.home,
        awayScore: resultDraft.value.score.away,
        status: resultDraft.value.status,
        notes: resultDraft.value.notes,
      })
      await actions.reloadTournament()
      return { id: currentTournament.id, ...updated }
    } finally {
      isSaving.value = false
    }
  }

  function currentTournamentId() {
    return String(tournament?.value?.id || '').trim()
  }

  return {
    selectedFixtureId,
    selectedFixture,
    fixtures,
    resultDraft,
    eventDraft,
    eventDraftValidation,
    eventTimeline,
    statusOptions,
    eventTypes,
    eventSideOptions,
    eventTeamOptions,
    selectFixture,
    updateDraft,
    setScore,
    setStatus,
    addEvent,
    removeEvent,
    resetEventDraft,
    saveResult,
    isSaving,
    isAddingEvent,
  }
}

export {
  createDefaultEventDraft,
  createEventId,
  createFixtureResultDraft,
  normalizeEventType,
  normalizeFixtureEvent,
  normalizeFixtureScore,
  normalizeMatchStatus,
}

function normalizeFixtureEvent(event = {}, index = 0) {
  return normalizeMatchEvent(event, index)
}

function createEventId(events = []) {
  return createMatchEventId(Array.isArray(events) ? events.length : 0)
}
