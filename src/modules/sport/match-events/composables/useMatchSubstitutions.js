import { computed, unref } from 'vue'
import { MATCH_EVENT_TYPES } from '@/modules/sport/constants/matchEvent'

function asEventList(eventsSource) {
  return Array.isArray(unref(eventsSource)) ? unref(eventsSource) : []
}

function resolveActiveEvents(eventsSource, excludeEventId = '') {
  const targetId = String(excludeEventId || '')
  return asEventList(eventsSource).filter((event) => String(event.id || '') !== targetId)
}

export function useMatchSubstitutions(eventsSource) {
  const substitutionIns = computed(() =>
    resolveActiveEvents(eventsSource).filter((event) => String(event.eventType || '').toLowerCase() === MATCH_EVENT_TYPES.SUBSTITUTION_IN),
  )

  const substitutionOuts = computed(() =>
    resolveActiveEvents(eventsSource).filter((event) => String(event.eventType || '').toLowerCase() === MATCH_EVENT_TYPES.SUBSTITUTION_OUT),
  )

  function canSelectPlayer(playerId, excludeEventId = '') {
    const id = String(playerId || '')
    if (!id) return false

    const activeIds = new Set()
    resolveActiveEvents(eventsSource, excludeEventId).forEach((event) => {
      activeIds.add(String(event.squadPlayerId || event.playerId || ''))
      activeIds.add(String(event.relatedSquadPlayerId || event.relatedPlayerId || ''))
    })

    return !activeIds.has(id)
  }

  function validateSubstitution({ squadPlayerId, relatedSquadPlayerId, eventId } = {}) {
    const actorId = String(squadPlayerId || '')
    const relatedId = String(relatedSquadPlayerId || '')

    if (!actorId || !relatedId) return 'Both players are required for substitutions.'
    if (actorId === relatedId) return 'A player cannot be substituted with themselves.'
    if (!canSelectPlayer(actorId, eventId)) return 'The selected player already has a substitution event.'
    if (!canSelectPlayer(relatedId, eventId)) return 'The replacement player already has a substitution event.'

    return ''
  }

  return {
    substitutionIns,
    substitutionOuts,
    canSelectPlayer,
    validateSubstitution,
  }
}