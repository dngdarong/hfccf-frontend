import { computed, unref } from 'vue'
import { compareMatchEvents } from '@/modules/sport/services/sportApi'
import { MATCH_EVENT_PERIODS, MATCH_EVENT_SORT_ORDER } from '@/modules/sport/constants/matchEvent'

function resolveMinute(event = {}) {
  const minute = Number(event.minute ?? 0)
  const stoppageMinute = Number(event.stoppageMinute ?? event.stoppage_minute ?? 0)
  const extraTimeMinute = Number(event.extraTimeMinute ?? event.extra_time_minute ?? 0)

  return {
    minute,
    stoppageMinute: Number.isFinite(stoppageMinute) ? stoppageMinute : 0,
    extraTimeMinute: Number.isFinite(extraTimeMinute) ? extraTimeMinute : 0,
  }
}

function formatPeriodTitle(period = '') {
  return String(period || '')
    .split('_')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

export function formatMatchEventMinute(event = {}) {
  const timing = resolveMinute(event)

  if (timing.stoppageMinute > 0) {
    return `${timing.minute}+${timing.stoppageMinute}'`
  }

  if (timing.extraTimeMinute > 0) {
    return `${timing.minute}+${timing.extraTimeMinute}'`
  }

  return `${timing.minute}'`
}

export function useMatchTimeline(eventsSource) {
  const orderedEvents = computed(() => {
    const events = Array.isArray(unref(eventsSource)) ? [...unref(eventsSource)] : []
    return events.sort(compareMatchEvents)
  })

  const groupedEvents = computed(() => {
    const buckets = new Map(MATCH_EVENT_SORT_ORDER.map((period) => [period, []]))

    orderedEvents.value.forEach((event) => {
      const period = String(event.period || MATCH_EVENT_PERIODS.FIRST_HALF).toLowerCase()
      const normalizedPeriod = buckets.has(period) ? period : MATCH_EVENT_PERIODS.FIRST_HALF
      buckets.get(normalizedPeriod).push(event)
    })

    return MATCH_EVENT_SORT_ORDER
      .map((period) => ({
        period,
        title: formatPeriodTitle(period),
        events: buckets.get(period) || [],
      }))
      .filter((group) => group.events.length > 0)
  })

  const eventCount = computed(() => orderedEvents.value.length)

  return {
    orderedEvents,
    groupedEvents,
    eventCount,
    formatMatchEventMinute,
  }
}